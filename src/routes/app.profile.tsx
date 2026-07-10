import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRole, ROLE_META } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { listMaterials, listSubmissions, triggerDownload, humanSize, fileToBlob, MAX_FILE_BYTES } from "@/lib/materials-store";
import { updateUser } from "@/lib/api/users";
import { changePasswordRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { User, GraduationCap, Save, Download, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "My Profile — CRMS" }] }),
  component: ProfilePage,
});

const CLASS_LEVELS = ["Y1","Y2","Y3","Y4","M1","M2"];
const SPECIALTIES  = ["Computer Science","Electrical Engineering","Data Science","Civil Engineering","Mechanical Engineering","Other"];

function ProfilePage() {
  const { user, updateProfile } = useRole();
  if (!user) return <Navigate to="/" />;

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatar, setAvatar] = useState(user.avatar ?? "");
  const [classLevel, setClassLevel] = useState(user.classLevel ?? "Y1");
  const [specialty, setSpecialty] = useState(user.specialty ?? "Computer Science");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const uploads = useMemo(() => {
    if (user.role === "faculty") return listMaterials().filter(m => m.lecturerEmail.toLowerCase() === user.email.toLowerCase());
    return listSubmissions().filter(s => s.studentEmail.toLowerCase() === user.email.toLowerCase());
  }, [user]);

  const downloads = useMemo(() => {
    if (user.role === "student")
      return listMaterials().filter(m => m.downloads.includes(user.matricule));
    if (user.role === "faculty")
      return listSubmissions().filter(s => s.lecturerEmail.toLowerCase() === user.email.toLowerCase());
    return [];
  }, [user]);

  const onAvatar = async (f: File | null) => {
    if (!f) return;
    if (f.size > 500 * 1024) return toast.error("Avatar must be ≤ 500 KB");
    const b = await fileToBlob(f);
    setAvatar(b.dataUrl);
  };

  const save = async () => {
    if (!user._id) return toast.error("Missing user id — please sign in again.");
    setSaving(true);
    try {
      const patch: Record<string, unknown> = { name, phone, avatar };
      if (user.role === "student") { patch.classLevel = classLevel; patch.specialty = specialty; }
      const updated = await updateUser(user._id, patch);
      updateProfile({ name: updated.name, phone: updated.phone, avatar: updated.avatar, classLevel: updated.classLevel, specialty: updated.specialty });

      if (newPassword) {
        if (!currentPassword) throw new Error("Enter your current password to set a new one.");
        await changePasswordRequest(currentPassword, newPassword);
        setCurrentPassword("");
        setNewPassword("");
      }
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader title="My Profile" subtitle="Manage your account. Your role can only be changed by an administrator." />
      <div className="px-5 lg:px-8 py-6 space-y-6 max-w-5xl">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal information</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-[auto_1fr] gap-6">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 ring-2 ring-primary/30">
                <AvatarImage src={avatar} />
                <AvatarFallback>{user.name.split(" ").map(n => n[0]).slice(0,2).join("")}</AvatarFallback>
              </Avatar>
              <label className="text-xs text-primary cursor-pointer hover:underline">
                Change photo
                <input type="file" accept="image/*" hidden onChange={e => onAvatar(e.target.files?.[0] ?? null)} />
              </label>
              <Badge variant="outline" className="border-primary/40 text-primary">{ROLE_META[user.role].label}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div><Label>Matricule (read-only)</Label><Input value={user.matricule} disabled /></div>
              <div><Label>Email (read-only)</Label><Input value={user.email} disabled /></div>
              <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 ..." /></div>
              {user.role === "student" && <>
                <div>
                  <Label>Class level</Label>
                  <Select value={classLevel} onValueChange={setClassLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASS_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>}
              <div>
                <Label>Current password</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="required to change password" />
              </div>
              <div>
                <Label>New password (leave blank to keep current)</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="min. 6 characters" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={save} disabled={saving}><Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save changes"}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><UploadCloud className="h-4 w-4 text-primary" /> My uploads</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {uploads.length === 0 && <p className="text-muted-foreground text-xs">No uploads yet.</p>}
              {uploads.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.title ?? u.file?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{u.courseCode} · {humanSize(u.file.size)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => triggerDownload(u.file)}><Download className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4 text-primary" /> {user.role === "faculty" ? "Submissions received" : "My downloads"}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {downloads.length === 0 && <p className="text-muted-foreground text-xs">Nothing yet.</p>}
              {downloads.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.title ?? u.file?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{u.courseCode} · {humanSize(u.file.size)}{u.studentName ? ` · from ${u.studentName}` : ""}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => triggerDownload(u.file)}><Download className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
