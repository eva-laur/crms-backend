import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarX, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TIME_SLOTS } from "@/lib/academic-data";
import { getCourses } from "@/lib/api/academic";
import { getCancellations, createCancellation } from "@/lib/api/coursework";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/app/cancellations")({
  head: () => ({ meta: [{ title: "Class Cancellations — CRMS" }] }),
  component: CancellationsPage,
});

function CancellationsPage() {
  const { user, can } = useRole();
  if (!can("nav:cancellations") && user?.role !== "student") return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const canCancel = can("action:cancelClass");
  const queryClient = useQueryClient();

  const { data: cancellations = [], isLoading } = useQuery({
    queryKey: ["cancellations"],
    queryFn: getCancellations,
  });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: getCourses });

  const myCourses = useMemo(
    () => (user.role === "faculty" ? courses.filter((c: any) => c.lecturer?._id === user._id) : courses),
    [courses, user]
  );

  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string>(TIME_SLOTS[0]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeCourseId = courseId || myCourses[0]?._id || "";

  const submit = async () => {
    if (!activeCourseId) return toast.error("No course available to cancel");
    if (!reason.trim()) return toast.error("Provide a reason");
    setSubmitting(true);
    try {
      const created = await createCancellation({ course: activeCourseId, date, timeSlot: slot, reason: reason.trim() });
      queryClient.invalidateQueries({ queryKey: ["cancellations"] });
      toast.success("Class cancellation broadcast", { description: `${created.course?.courseCode ?? ""} · ${date} · ${slot} — students notified` });
      setReason("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to cancel class");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Class Cancellations" subtitle={canCancel ? "Cancel a class on a date & time slot — concerned students are alerted" : "Cancellations affecting your enrolled courses"} />
      <div className="px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-[1fr_1.3fr] gap-5">
        {canCancel && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><CalendarX className="h-4 w-4 text-destructive" /> Cancel a class</CardTitle>
              <p className="text-xs text-muted-foreground">Notifies students enrolled in the course; admin is informed.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5">
                <Label>Course</Label>
                <Select value={activeCourseId} onValueChange={setCourseId}>
                  <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                  <SelectContent>
                    {myCourses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.courseCode} · {c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="grid gap-1.5">
                  <Label>Time slot</Label>
                  <Select value={slot} onValueChange={setSlot}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIME_SLOTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5"><Label>Reason</Label><Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Conference travel, illness, …" /></div>
              <Button variant="destructive" onClick={submit} disabled={submitting}>{submitting ? "Cancelling…" : "Cancel class & notify"}</Button>
            </CardContent>
          </Card>
        )}

        <Card className={!canCancel ? "xl:col-span-2" : ""}>
          <CardHeader>
            <CardTitle className="text-base">Cancellation log</CardTitle>
            <p className="text-xs text-muted-foreground">{isLoading ? "Loading…" : `${cancellations.length} record(s)`}</p>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {!isLoading && cancellations.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No cancellations.</li>}
              {cancellations.map((c) => (
                <li key={c._id} className="px-3 sm:px-5 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    <p className="text-sm font-semibold">{c.course?.courseCode ?? "—"} cancelled · {c.date} · {c.timeSlot}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.reason}</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">— {c.cancelledBy?.name ?? "Unknown"} · posted {new Date(c.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
