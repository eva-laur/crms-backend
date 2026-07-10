import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, ListChecks, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { getCourses } from "@/lib/api/academic";
import { getLogbookByCourse, createLogbook, addOutlineTopic, updateOutlineStatus, deleteOutlineTopic } from "@/lib/api/logbooks";

export const Route = createFileRoute("/app/course-progress")({
  head: () => ({ meta: [{ title: "Course Progress — CRMS" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user, can } = useRole();
  if (!can("nav:courseProgress")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;
  return <ProgressInner userId={user._id ?? ""} role={user.role} canEdit={can("action:editSyllabus")} />;
}

function ProgressInner({ userId, role, canEdit }: { userId: string; role: string; canEdit: boolean }) {
  const queryClient = useQueryClient();

  const { data: allCourses = [], isLoading: loadingCourses } = useQuery({ queryKey: ["courses", "all"], queryFn: getCourses });
  const myCourses = useMemo(() => {
    if (role === "faculty") return (allCourses as any[]).filter(c => (c.lecturer?._id ?? c.lecturer) === userId);
    if (role === "student") return (allCourses as any[]).filter(c => (c.students ?? []).some((s: any) => (s._id ?? s) === userId));
    return allCourses as any[];
  }, [allCourses, role, userId]);

  const [courseId, setCourseId] = useState("");
  useEffect(() => { if (!courseId && myCourses[0]) setCourseId(myCourses[0]._id); }, [myCourses, courseId]);
  const course = myCourses.find((c: any) => c._id === courseId);

  const { data: logbooks = [], isLoading: loadingLogbook } = useQuery({
    queryKey: ["logbooks", "course", course?._id],
    queryFn: () => getLogbookByCourse(course._id),
    enabled: !!course?._id,
  });
  const logbook = (logbooks as any[])[0];
  const items = logbook?.outline ?? [];
  const covered = items.filter((i: any) => i.status === "covered").length;
  const pct = items.length ? Math.round((covered / items.length) * 100) : 0;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["logbooks", "course", course?._id] });

  const [creating, setCreating] = useState(false);
  const ensureLogbook = async () => {
    if (!course) return;
    setCreating(true);
    try {
      await createLogbook({ course: course._id, academicYear: course.academicYear, semester: course.semester });
      toast.success("Syllabus tracker created");
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to create syllabus tracker");
    } finally {
      setCreating(false);
    }
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ week: 1, title: "", description: "" });
  const [saving, setSaving] = useState(false);

  const addLesson = async () => {
    if (!logbook) return;
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    try {
      await addOutlineTopic(logbook._id, { week: form.week, title: form.title.trim(), description: form.description.trim() || undefined });
      toast.success("Lesson added");
      setOpen(false);
      setForm({ week: form.week + 1, title: "", description: "" });
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to add lesson");
    } finally {
      setSaving(false);
    }
  };

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const toggle = async (topic: any) => {
    if (!logbook) return;
    setTogglingId(topic._id);
    try {
      const next = topic.status === "covered" ? "pending" : "covered";
      await updateOutlineStatus(logbook._id, topic._id, next);
      toast.success(next === "covered" ? "Marked covered" : "Marked pending");
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update");
    } finally {
      setTogglingId(null);
    }
  };

  const removeLesson = async (topic: any) => {
    if (!logbook) return;
    try {
      await deleteOutlineTopic(logbook._id, topic._id);
      toast.success("Removed");
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to remove");
    }
  };

  return (
    <>
      <AppHeader title="Course Progress" subtitle={canEdit ? "Track lectures covered after each session" : "Track what your lecturer has covered to date"} />
      <div className="px-3 sm:px-5 lg:px-8 py-6 space-y-5">
        {loadingCourses ? (
          <p className="text-xs text-muted-foreground text-center py-10">Loading…</p>
        ) : myCourses.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No courses to show progress for yet.</CardContent></Card>
        ) : (
          <>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div className="grid gap-1.5">
                <Label>Course</Label>
                <Select value={course?._id ?? ""} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {myCourses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.courseCode} · {c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {canEdit && logbook && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Add lesson</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add a syllabus lesson</DialogTitle></DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid gap-1.5"><Label>Week #</Label><Input type="number" min={1} value={form.week} onChange={e => setForm({ ...form, week: Math.max(1, Number(e.target.value) || 1) })} /></div>
                      <div className="grid gap-1.5"><Label>Lesson title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                      <div className="grid gap-1.5"><Label>Description (optional)</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    </div>
                    <DialogFooter><Button onClick={addLesson} disabled={saving}>{saving ? "Adding…" : "Add lesson"}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> {course?.courseCode} · {course?.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {loadingLogbook ? "Loading…" : logbook ? `${covered} of ${items.length} lessons covered` : "No syllabus tracker yet for this course"}
                  </p>
                </div>
                {logbook && (
                  <div className="w-40">
                    <Progress value={pct} className="h-2" />
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {loadingLogbook ? null : !logbook ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-muted-foreground mb-3">This course doesn't have a syllabus tracker yet.</p>
                    {canEdit && (
                      <Button size="sm" onClick={ensureLogbook} disabled={creating}>{creating ? "Creating…" : "Create syllabus tracker"}</Button>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {items.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground text-center">No syllabus items yet.</li>}
                    {items.slice().sort((a: any, b: any) => a.week - b.week).map((it: any) => (
                      <li key={it._id} className="px-3 sm:px-5 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                        <button
                          disabled={!canEdit || togglingId === it._id}
                          onClick={() => toggle(it)}
                          className={`h-7 w-7 rounded-md border flex items-center justify-center ${it.status === "covered" ? "bg-success/15 border-success text-success" : "border-border"}`}
                          aria-label="Toggle covered">
                          {it.status === "covered" && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${it.status === "covered" ? "line-through text-muted-foreground" : ""}`}>Week {it.week} · {it.title}</p>
                          {it.description && <p className="text-[11px] text-muted-foreground">{it.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={it.status === "covered" ? "border-success/40 text-success" : "border-warning/40 text-warning"}>
                            {it.status === "covered" ? "Covered" : it.status === "partially_covered" ? "Partial" : "Pending"}
                          </Badge>
                          {canEdit && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLesson(it)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
