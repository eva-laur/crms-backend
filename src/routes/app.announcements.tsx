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
import { Megaphone, Send } from "lucide-react";
import { toast } from "sonner";
import { getCourses } from "@/lib/api/academic";
import { getAnnouncements, createAnnouncement } from "@/lib/api/coursework";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/app/announcements")({
  head: () => ({ meta: [{ title: "Announcements — CRMS" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { user, can } = useRole();
  if (!can("nav:announcements")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const canPost = can("action:postAnnouncement");
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });
  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: getCourses });

  const myCourses = useMemo(
    () => (user.role === "faculty" ? courses.filter((c: any) => c.lecturer?._id === user._id) : courses),
    [courses, user]
  );

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const activeCourseId = courseId || myCourses[0]?._id || "";

  const submit = async () => {
    if (!activeCourseId) return toast.error("No course available to post to");
    if (!title.trim() || !body.trim()) return toast.error("Title and body required");
    setPosting(true);
    try {
      await createAnnouncement({ course: activeCourseId, title: title.trim(), body: body.trim() });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setTitle(""); setBody("");
      toast.success("Announcement posted");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <AppHeader title="Announcements" subtitle={canPost ? "Reach the class enrolled in a specific course" : "Updates from your lecturers"} />
      <div className="px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-[1fr_1.4fr] gap-5">
        {canPost && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Compose</CardTitle>
              <p className="text-xs text-muted-foreground">Only students enrolled in the selected course will see this.</p>
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
                {myCourses.length === 0 && <p className="text-xs text-muted-foreground">No courses found — create one first.</p>}
              </div>
              <div className="grid gap-1.5"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Message</Label><Textarea rows={5} value={body} onChange={e => setBody(e.target.value)} /></div>
              <Button onClick={submit} disabled={posting} className="gap-1.5"><Send className="h-4 w-4" /> {posting ? "Posting…" : "Post announcement"}</Button>
            </CardContent>
          </Card>
        )}

        <Card className={!canPost ? "xl:col-span-2" : ""}>
          <CardHeader>
            <CardTitle className="text-base">Inbox</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${announcements.length} announcement(s)`}{user.role === "admin" ? " · admin view: all courses" : ""}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {!isLoading && announcements.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No announcements.</li>}
              {announcements.map((a) => (
                <li key={a._id} className="px-3 sm:px-5 py-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <Badge variant="outline" className="text-[10px]">{a.course?.courseCode ?? "—"}</Badge>
                  </div>
                  <p className="text-sm mt-1.5 whitespace-pre-line">{a.body}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">— {a.postedBy?.name ?? "Unknown"} · {new Date(a.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
