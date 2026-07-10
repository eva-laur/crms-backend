import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, can } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BookOpen, CheckCircle2, AlertCircle, Plus, Users, Trash2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  getCourses, createCourse, enrollStudent, unenrollStudent,
  getAttendanceByCourse, createAttendance, markAttendance, getAttendance,
  getResultsByCourse, createResult, addAssessmentResult, updateAssessmentResult, getResults,
} from "@/lib/api/academic";
import { lookupUserByMatricule } from "@/lib/api/users";

export const Route = createFileRoute("/app/logbook")({
  head: () => ({ meta: [{ title: "Academic Logbook — CRMS" }] }),
  component: LogbookPage,
});

function LogbookPage() {
  const { user } = useRole();
  if (!user) return null;
  if (can(user.role, "action:logAttendance")) return <FacultyLogbook />;
  if (can(user.role, "nav:logbook")) return <StudentLogbook />;
  return <Navigate to="/app/dashboard" />;
}

/* ---- faculty ---- */

type Status = "P" | "A" | "L" | null;
const STATUS_LABEL: Record<"P" | "A" | "L", string> = { P: "present", L: "late", A: "absent" };
const CA_TITLE = "Continuous Assessment";

function FacultyLogbook() {
  const { user } = useRole();
  const queryClient = useQueryClient();

  const { data: allCourses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses", "all"], queryFn: getCourses,
  });
  const myCourses = useMemo(
    () => allCourses.filter((c: any) => (c.lecturer?._id ?? c.lecturer) === user?._id),
    [allCourses, user]
  );

  const [courseId, setCourseId] = useState("");
  useEffect(() => {
    if (!courseId && myCourses[0]) setCourseId(myCourses[0]._id);
  }, [myCourses, courseId]);
  const course = myCourses.find((c: any) => c._id === courseId);
  const roster: any[] = course?.students ?? [];

  const { data: sessions = [] } = useQuery({
    queryKey: ["attendance", "course", course?._id],
    queryFn: () => getAttendanceByCourse(course._id),
    enabled: !!course?._id,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results", "course", course?._id],
    queryFn: () => getResultsByCourse(course._id),
    enabled: !!course?._id,
  });
  const resultByStudent = useMemo(() => {
    const m: Record<string, any> = {};
    (results as any[]).forEach(r => { m[r.student?._id ?? r.student] = r; });
    return m;
  }, [results]);

  // Attendance state keyed by studentId → today's uncommitted status
  const [currentSession, setCurrentSession] = useState<Record<string, Status>>({});
  const [committing, setCommitting] = useState(false);

  // CA-mark inputs, keyed by studentId. Seeded from the real "Continuous
  // Assessment" entry in that student's Result once it loads, but never
  // overwritten while the person is actively editing (only fills in blanks).
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [savingMark, setSavingMark] = useState<string | null>(null);

  useEffect(() => { setCurrentSession({}); }, [courseId]);

  useEffect(() => {
    setMarks(prev => {
      const next = { ...prev };
      roster.forEach((s: any) => {
        if (next[s._id] === undefined) {
          const r = resultByStudent[s._id];
          const ca = r?.assessments?.find((a: any) => a.title === CA_TITLE);
          next[s._id] = ca?.score ?? 14;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultByStudent, courseId]);

  /** Attendance score = 20 - 2*absent - 1*late across every real committed
   *  session for this course, plus today's not-yet-committed pick. */
  const attendanceScore = (studentId: string): number => {
    let score = 20;
    (sessions as any[]).forEach(session => {
      const rec = (session.records ?? []).find((r: any) => (r.student?._id ?? r.student) === studentId);
      if (rec?.status === "absent") score -= 2;
      else if (rec?.status === "late") score -= 1;
    });
    const today = currentSession[studentId];
    if (today === "A") score -= 2;
    else if (today === "L") score -= 1;
    return Math.max(0, score);
  };

  const tally = useMemo(() => {
    const t = { P: 0, A: 0, L: 0, none: 0 };
    roster.forEach((s: any) => {
      const v = currentSession[s._id];
      if (v === "P") t.P++;
      else if (v === "A") t.A++;
      else if (v === "L") t.L++;
      else t.none++;
    });
    return t;
  }, [currentSession, roster]);

  const commitSession = async () => {
    if (!course || roster.length === 0) return;
    setCommitting(true);
    try {
      const created = await createAttendance({ course: course._id });
      for (const s of roster) {
        const v = currentSession[s._id] ?? "A"; // unmarked treated as absent on commit
        await markAttendance(created._id, { student: s._id, status: STATUS_LABEL[v as "P" | "L" | "A"] });
      }
      toast.success(`Session recorded · ${course.courseCode}`);
      setCurrentSession({});
      queryClient.invalidateQueries({ queryKey: ["attendance", "course", course._id] });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to record session");
    } finally {
      setCommitting(false);
    }
  };

  const saveMark = async (studentId: string, value: number) => {
    if (!course) return;
    setSavingMark(studentId);
    try {
      let result = resultByStudent[studentId];
      if (!result) result = await createResult({ student: studentId, course: course._id });
      const existing = result.assessments?.find((a: any) => a.title === CA_TITLE);
      if (existing) await updateAssessmentResult(result._id, existing._id, { score: value });
      else await addAssessmentResult(result._id, { title: CA_TITLE, type: "test", score: value, totalMarks: 20 });
      queryClient.invalidateQueries({ queryKey: ["results", "course", course._id] });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to save mark");
    } finally {
      setSavingMark(null);
    }
  };

  return (
    <>
      <AppHeader title="Academic Logbook" subtitle="Record attendance and CA marks — roster scoped to selected course's enrolled students" />
      <div className="px-3 sm:px-5 lg:px-8 py-6 space-y-5">
        <CourseManagementPanel />

        {loadingCourses ? (
          <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
        ) : !course ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Create a course above to begin taking attendance and recording marks.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div className="grid gap-1.5">
                <label className="text-xs text-muted-foreground">Course</label>
                <Select value={course._id} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{myCourses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.courseCode} · {c.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] items-center">
                <Badge variant="outline" className="border-success/40 text-success">Present · {tally.P}</Badge>
                <Badge variant="outline" className="border-warning/40 text-warning">Late · {tally.L}</Badge>
                <Badge variant="outline" className="border-destructive/40 text-destructive">Absent · {tally.A}</Badge>
                <Badge variant="outline">Unmarked · {tally.none}</Badge>
                <button onClick={commitSession} disabled={committing || roster.length === 0}
                  className="ml-2 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
                  {committing ? "Saving…" : "Commit session"}
                </button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary"/> Class roster — {course.courseCode} · {course.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{roster.length} enrolled students · attendance score starts at 20 and decrements by 2 (Absent) / 1 (Late)</p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                    <tr>
                      <th className="text-left px-3 sm:px-5 py-2.5 font-medium">Student</th>
                      <th className="text-left px-3 py-2.5 font-medium">Matricule</th>
                      <th className="text-center px-3 py-2.5 font-medium">Attendance (today)</th>
                      <th className="text-right px-3 py-2.5 font-medium w-28">Attend /20</th>
                      <th className="text-right px-3 sm:px-5 py-2.5 font-medium w-28">CA /20</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No students enrolled — use "Manage students" above to add some.</td></tr>}
                    {roster.map((s: any, idx: number) => {
                      const cur = currentSession[s._id] ?? null;
                      const score = attendanceScore(s._id);
                      return (
                        <tr key={s._id} className={cn(idx % 2 === 0 ? "bg-transparent" : "bg-background/20", "border-b border-border/60")}>
                          <td className="px-3 sm:px-5 py-3 font-medium">{s.name}</td>
                          <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground">{s.matricule ?? "—"}</td>
                          <td className="px-3 py-3">
                            <div className="flex justify-center gap-1.5">
                              {(["P", "L", "A"] as const).map(opt => (
                                <button key={opt} onClick={() => setCurrentSession(p => ({ ...p, [s._id]: cur === opt ? null : opt }))}
                                  className={cn("h-7 px-2 text-[11px] font-semibold rounded-md border transition-all",
                                    opt === "P" && cur === "P" && "bg-success/20 border-success/60 text-success",
                                    opt === "L" && cur === "L" && "bg-warning/20 border-warning/60 text-warning",
                                    opt === "A" && cur === "A" && "bg-destructive/20 border-destructive/60 text-destructive",
                                    cur !== opt && "border-border text-muted-foreground hover:bg-accent/40",
                                  )}>
                                  {opt === "P" ? "Present" : opt === "L" ? "Late" : "Absent"}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className={cn("font-mono font-semibold",
                              score >= 16 ? "text-success" : score >= 10 ? "text-warning" : "text-destructive")}>
                              {score}
                            </span>
                          </td>
                          <td className="px-3 sm:px-5 py-3">
                            <div className="relative">
                              <Input
                                type="number" min={0} max={20}
                                value={marks[s._id] ?? 14}
                                onChange={e => setMarks(p => ({ ...p, [s._id]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) }))}
                                onBlur={e => saveMark(s._id, Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                                disabled={savingMark === s._id}
                                className="h-8 text-right pr-6"
                              />
                              {savingMark === s._id && (
                                <Loader2 className="h-3 w-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

/* ---- course creation & enrollment (real backend, faculty-only) ---- */

const emptyCourseForm = { courseCode: "", title: "", description: "", semester: "", academicYear: "" };

function CourseManagementPanel() {
  const { user } = useRole();
  const queryClient = useQueryClient();
  const { data: allCourses = [], isLoading } = useQuery({
    queryKey: ["courses", "all"], queryFn: getCourses,
  });
  const myCourses = allCourses.filter((c: any) => (c.lecturer?._id ?? c.lecturer) === user?._id);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["courses"] });

  /* create course */
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyCourseForm);
  const [creating, setCreating] = useState(false);

  const submitCreate = async () => {
    if (!form.courseCode.trim() || !form.title.trim() || !form.semester.trim() || !form.academicYear.trim()) {
      toast.error("Course code, title, semester and academic year are required");
      return;
    }
    setCreating(true);
    try {
      await createCourse(form);
      toast.success(`${form.courseCode.toUpperCase()} created`);
      setForm(emptyCourseForm);
      setCreateOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  /* manage students */
  const [manageId, setManageId] = useState<string | null>(null);
  const manageCourse = myCourses.find((c: any) => c._id === manageId) ?? null;
  const [matricule, setMatricule] = useState("");
  const [busy, setBusy] = useState(false);

  const addStudent = async () => {
    if (!manageCourse || !matricule.trim()) return;
    setBusy(true);
    try {
      const found = await lookupUserByMatricule(matricule.trim());
      if (found.role !== "student") {
        toast.error(`${found.name} is registered as ${found.role}, not a student`);
        return;
      }
      await enrollStudent(manageCourse._id, found._id);
      toast.success(`${found.name} enrolled in ${manageCourse.courseCode}`);
      setMatricule("");
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Student not found");
    } finally {
      setBusy(false);
    }
  };

  const removeStudent = async (studentId: string, name: string) => {
    if (!manageCourse) return;
    try {
      await unenrollStudent(manageCourse._id, studentId);
      toast.success(`${name} removed from ${manageCourse.courseCode}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to remove student");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> My Courses</CardTitle>
          <p className="text-xs text-muted-foreground">Create the courses you teach and manage who's enrolled</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setForm(emptyCourseForm); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 shrink-0"><Plus className="h-3.5 w-3.5" /> New course</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create a course</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Course code</Label>
                  <Input value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))} placeholder="CS-401" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Semester</Label>
                  <Input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} placeholder="Fall 2026" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Distributed Systems" />
              </div>
              <div className="grid gap-1.5">
                <Label>Academic year</Label>
                <Input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2026/2027" />
              </div>
              <div className="grid gap-1.5">
                <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={submitCreate} disabled={creating}>{creating ? "Creating…" : "Create course"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
        ) : myCourses.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">You haven't created any courses yet — click "New course" to add one.</p>
        ) : (
          <ul className="divide-y divide-border">
            {myCourses.map((c: any) => (
              <li key={c._id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.courseCode} · {c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.semester} · {c.academicYear} · {c.students?.length ?? 0} enrolled</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setManageId(c._id)}>
                  <Users className="h-3.5 w-3.5" /> Manage students
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!manageCourse} onOpenChange={(o) => { if (!o) { setManageId(null); setMatricule(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{manageCourse?.courseCode} · {manageCourse?.title} — roster</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={matricule} onChange={e => setMatricule(e.target.value)} placeholder="Student matricule"
              onKeyDown={e => { if (e.key === "Enter") addStudent(); }} />
            <Button onClick={addStudent} disabled={busy || !matricule.trim()} className="gap-1.5 shrink-0">
              <UserPlus className="h-3.5 w-3.5" /> {busy ? "Adding…" : "Add"}
            </Button>
          </div>
          <ul className="divide-y divide-border max-h-72 overflow-auto mt-2">
            {(manageCourse?.students ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">No students enrolled yet.</p>
            )}
            {(manageCourse?.students ?? []).map((s: any) => (
              <li key={s._id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeStudent(s._id, s.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ---- student ---- */

function gradeTone(grade: string) {
  if (grade === "A" || grade === "B") return "border-success/40 text-success";
  if (grade === "C" || grade === "D") return "border-warning/40 text-warning";
  return "border-destructive/40 text-destructive";
}

function StudentLogbook() {
  const { user } = useRole();

  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ["results", "mine"], queryFn: getResults, enabled: !!user,
  });
  const { data: sessions = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance", "mine"], queryFn: getAttendance, enabled: !!user,
  });

  // Union of every course the student has a result or attendance record
  // for, keyed by course id so each shows once even if both exist.
  const courseMap = useMemo(() => {
    const m = new Map<string, any>();
    (results as any[]).forEach(r => { if (r.course?._id) m.set(r.course._id, r.course); });
    (sessions as any[]).forEach(s => { if (s.course?._id && !m.has(s.course._id)) m.set(s.course._id, s.course); });
    return m;
  }, [results, sessions]);

  const perCourseAttendance = useMemo(() => {
    const map: Record<string, { present: number; late: number; absent: number; total: number }> = {};
    if (!user) return map;
    (sessions as any[]).forEach(session => {
      const cid = session.course?._id ?? session.course;
      if (!cid) return;
      const rec = (session.records ?? []).find((r: any) => (r.student?._id ?? r.student) === user._id);
      if (!rec) return;
      if (!map[cid]) map[cid] = { present: 0, late: 0, absent: 0, total: 0 };
      map[cid].total++;
      if (rec.status === "present") map[cid].present++;
      else if (rec.status === "late") map[cid].late++;
      else if (rec.status === "absent") map[cid].absent++;
    });
    return map;
  }, [sessions, user]);

  if (!user) return null;

  const attendanceRows = Array.from(courseMap.values())
    .map(course => {
      const a = perCourseAttendance[course._id];
      // Late counts as half-attended — present + half of late, over total sessions.
      const pct = a && a.total > 0 ? Math.round(((a.present + a.late * 0.5) / a.total) * 100) : null;
      return { course, pct };
    })
    .filter(r => r.pct !== null) as { course: any; pct: number }[];
  const overall = attendanceRows.length
    ? Math.round(attendanceRows.reduce((s, r) => s + r.pct, 0) / attendanceRows.length)
    : null;

  return (
    <>
      <AppHeader title="My Academic Logbook" subtitle="Personal attendance and assessment record" />
      <div className="px-3 sm:px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{user.name}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono">{user.matricule}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {loadingAttendance ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
            ) : overall === null ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No attendance sessions recorded yet.</p>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Overall attendance</span>
                    <span className="font-medium">{overall}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-background overflow-hidden border border-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${overall}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    {overall >= 75 ? (
                      <><CheckCircle2 className="h-3 w-3 text-success" /> Above 75% threshold required to sit final exams.</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 text-destructive" /> Below the 75% threshold required to sit final exams.</>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Per-course attendance</p>
                  {attendanceRows.map(({ course, pct }) => (
                    <div key={course._id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="truncate">{course.courseCode} · {course.title}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5"/>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Official grade breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Continuous assessment vs. exam, per enrolled course</p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {loadingResults ? (
              <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
            ) : (results as any[]).length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No results published yet.</p>
            ) : (
              <table className="w-full text-sm min-w-[480px]">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-medium">Course</th>
                    <th className="text-right px-3 py-2.5 font-medium">CA</th>
                    <th className="text-right px-3 py-2.5 font-medium">Exam</th>
                    <th className="text-right px-3 py-2.5 font-medium">Total</th>
                    <th className="text-right px-5 py-2.5 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {(results as any[]).map((r, i) => {
                    const assessments = r.assessments ?? [];
                    const ca = assessments.filter((a: any) => a.type !== "exam");
                    const exam = assessments.filter((a: any) => a.type === "exam");
                    const caScore = ca.reduce((s: number, a: any) => s + a.score, 0);
                    const caTotal = ca.reduce((s: number, a: any) => s + a.totalMarks, 0);
                    const examScore = exam.reduce((s: number, a: any) => s + a.score, 0);
                    const examTotal = exam.reduce((s: number, a: any) => s + a.totalMarks, 0);
                    return (
                      <tr key={r._id} className={cn(i % 2 === 0 ? "bg-transparent" : "bg-background/20", "border-b border-border/60")}>
                        <td className="px-5 py-3 font-medium">{r.course?.courseCode} · {r.course?.title}</td>
                        <td className="px-3 py-3 text-right font-mono">{caTotal > 0 ? `${caScore}/${caTotal}` : "—"}</td>
                        <td className="px-3 py-3 text-right font-mono">{examTotal > 0 ? `${examScore}/${examTotal}` : "—"}</td>
                        <td className="px-3 py-3 text-right font-mono font-semibold">{r.finalScore}%</td>
                        <td className="px-5 py-3 text-right">
                          <Badge variant="outline" className={gradeTone(r.grade)}>{r.grade}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
