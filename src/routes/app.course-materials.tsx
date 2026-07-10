/* eslint-disable prettier/prettier */
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, Download, FileText, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { getCourses } from "@/lib/api/academic";
import {
  getMaterials, uploadMaterial, deleteMaterial, recordMaterialDownload,
  getSubmissions, submitAssignment, deleteSubmission,
  type ApiMaterial, type ApiSubmission,
} from "@/lib/api/coursework";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/app/course-materials")({
  head: () => ({ meta: [{ title: "Course Materials — CRMS" }] }),
  component: MaterialsPage,
});

const MAX_FILE_BYTES = 20 * 1024 * 1024; // matches server/shared/middleware/upload.js uploadMaterial/uploadSubmission limit
const humanSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function MaterialsPage() {
  const { user } = useRole();
  if (!user) return <Navigate to="/" />;
  if (user.role !== "faculty" && user.role !== "student") return <Navigate to="/app/dashboard" />;

  return (
    <>
      <AppHeader title="Course Materials" subtitle="Upload lecture material and receive student submissions." />
      <div className="px-5 lg:px-8 py-6">
        {user.role === "faculty" ? <FacultyView /> : <StudentView />}
      </div>
    </>
  );
}

/* ============= FACULTY ============= */

function FacultyView() {
  const { user } = useRole();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const { data: materials = [] } = useQuery({ queryKey: ["materials"], queryFn: getMaterials });
  const { data: submissions = [] } = useQuery({ queryKey: ["submissions"], queryFn: getSubmissions });

  const myCourses = useMemo(() => courses.filter((c: any) => c.lecturer?._id === user!._id), [courses, user]);
  const myMaterials = useMemo(() => materials.filter((m) => m.uploadedBy?._id === user!._id), [materials, user]);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const activeCourseId = courseId || myCourses[0]?._id || "";

  const upload = async () => {
    if (!activeCourseId || !title.trim() || !file) return toast.error("Course, title and file are required");
    if (file.size > MAX_FILE_BYTES) return toast.error("Max file size is 20 MB");
    setUploading(true);
    try {
      await uploadMaterial({ course: activeCourseId, title: title.trim(), file });
      toast.success("Material uploaded");
      setTitle(""); setFile(null);
      invalidate();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    try { await deleteMaterial(id); invalidate(); toast.success("Deleted"); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : "Delete failed"); }
  };
  const removeSubmission = async (id: string) => {
    try { await deleteSubmission(id); invalidate(); }
    catch (e) { toast.error(e instanceof ApiError ? e.message : "Delete failed"); }
  };

  return (
    <Tabs defaultValue="upload" className="space-y-4">
      <TabsList><TabsTrigger value="upload">Upload material</TabsTrigger><TabsTrigger value="mine">My materials ({myMaterials.length})</TabsTrigger><TabsTrigger value="incoming">Student submissions ({submissions.length})</TabsTrigger></TabsList>

      <TabsContent value="upload">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><UploadCloud className="h-4 w-4 text-primary" /> New material</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={activeCourseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{myCourses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.courseCode} — {c.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Week 3 — TCP handshake" /></div>
            <div className="md:col-span-2">
              <Label>File (≤ 20 MB)</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file && <p className="text-[11px] text-muted-foreground mt-1">{file.name} · {humanSize(file.size)}</p>}
            </div>
            <div className="md:col-span-2"><Button onClick={upload} disabled={uploading}><UploadCloud className="h-4 w-4 mr-1.5" /> {uploading ? "Uploading…" : "Upload"}</Button></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mine">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Title</TableHead><TableHead>Size</TableHead><TableHead>Downloads</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {myMaterials.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No uploads yet.</TableCell></TableRow>}
              {myMaterials.map((m: ApiMaterial) => (
                <TableRow key={m._id}>
                  <TableCell className="font-mono text-xs">{m.course?.courseCode ?? "—"}</TableCell>
                  <TableCell>{m.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{humanSize(m.fileSize)}</TableCell>
                  <TableCell>{m.downloads.length}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" asChild><a href={m.fileUrl} target="_blank" rel="noreferrer" download={m.fileName}><Download className="h-3.5 w-3.5" /></a></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(m._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="incoming">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>From</TableHead><TableHead>Course</TableHead><TableHead>Note</TableHead><TableHead>File</TableHead><TableHead>Received</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {submissions.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No submissions.</TableCell></TableRow>}
              {submissions.map((s: ApiSubmission) => (
                <TableRow key={s._id}>
                  <TableCell><div className="text-sm font-medium">{s.student?.name}</div><div className="text-[10px] font-mono text-muted-foreground">{s.student?.matricule}</div></TableCell>
                  <TableCell className="font-mono text-xs">{s.course?.courseCode ?? "—"}</TableCell>
                  <TableCell className="max-w-xs text-xs">{s.note || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-xs">{s.fileName} <span className="text-muted-foreground">({humanSize(s.fileSize)})</span></TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" asChild><a href={s.fileUrl} target="_blank" rel="noreferrer" download={s.fileName}><Download className="h-3.5 w-3.5" /></a></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeSubmission(s._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}

/* ============= STUDENT ============= */

function StudentView() {
  const { user } = useRole();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  };

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const { data: materials = [] } = useQuery({ queryKey: ["materials"], queryFn: getMaterials });
  const { data: mySubs = [] } = useQuery({ queryKey: ["submissions"], queryFn: getSubmissions });

  const myCourses = useMemo(() => courses.filter((c: any) => c.students?.some((s: any) => s._id === user!._id)), [courses, user]);

  const [courseId, setCourseId] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const activeCourseId = courseId || myCourses[0]?._id || "";

  const download = async (m: ApiMaterial) => {
    window.open(m.fileUrl, "_blank");
    try { await recordMaterialDownload(m._id); invalidate(); } catch { /* non-critical */ }
  };

  const send = async () => {
    if (!activeCourseId || !file) return toast.error("Course and file required");
    if (file.size > MAX_FILE_BYTES) return toast.error("Max file size is 20 MB");
    setSending(true);
    try {
      await submitAssignment({ course: activeCourseId, note, file });
      toast.success("Sent to lecturer");
      setNote(""); setFile(null);
      invalidate();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Tabs defaultValue="download" className="space-y-4">
      <TabsList><TabsTrigger value="download">Course materials ({materials.length})</TabsTrigger><TabsTrigger value="submit">Send to lecturer</TabsTrigger><TabsTrigger value="mine">My submissions ({mySubs.length})</TabsTrigger></TabsList>

      <TabsContent value="download">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>Title</TableHead><TableHead>Lecturer</TableHead><TableHead>Uploaded</TableHead><TableHead>Size</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {materials.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No materials for your courses yet.</TableCell></TableRow>}
              {materials.map((m: ApiMaterial) => (
                <TableRow key={m._id}>
                  <TableCell className="font-mono text-xs">{m.course?.courseCode ?? "—"}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary" />{m.title}</div></TableCell>
                  <TableCell>{m.uploadedBy?.name ?? "—"}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{humanSize(m.fileSize)}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => download(m)}><Download className="h-3.5 w-3.5 mr-1" />Download</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="submit">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> Send document to a lecturer</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Course (must be enrolled)</Label>
              <Select value={activeCourseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>{myCourses.map((c: any) => <SelectItem key={c._id} value={c._id}>{c.courseCode} — {c.title} ({c.lecturer?.name})</SelectItem>)}</SelectContent>
              </Select>
              {myCourses.length === 0 && <p className="text-xs text-muted-foreground mt-1">You're not enrolled in any course yet.</p>}
            </div>
            <div className="md:col-span-2"><Label>Note</Label><Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Optional message to the lecturer" /></div>
            <div className="md:col-span-2">
              <Label>File (≤ 20 MB)</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file && <p className="text-[11px] text-muted-foreground mt-1">{file.name} · {humanSize(file.size)}</p>}
            </div>
            <div className="md:col-span-2"><Button onClick={send} disabled={sending}><Send className="h-4 w-4 mr-1.5" /> {sending ? "Sending…" : "Send"}</Button></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mine">
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Course</TableHead><TableHead>File</TableHead><TableHead>Sent</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {mySubs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No submissions yet.</TableCell></TableRow>}
              {mySubs.map((s: ApiSubmission) => (
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-xs">{s.course?.courseCode ?? "—"}</TableCell>
                  <TableCell className="text-xs">{s.fileName}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right"><Button size="icon" variant="ghost" asChild><a href={s.fileUrl} target="_blank" rel="noreferrer" download={s.fileName}><Download className="h-3.5 w-3.5" /></a></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}
