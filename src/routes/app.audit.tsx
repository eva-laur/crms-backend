import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, MANAGER_AUDIT_SCOPE } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShieldCheck, Download, Search, Activity, Clock, User as UserIcon,
  CheckCircle2, AlertTriangle, XCircle, FileUp, FileText, Trash2, Paperclip,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  getAuditLogs, getEvidenceDocuments, uploadEvidenceDocument, deleteEvidenceDocument,
  type ApiAuditLog, type ApiEvidenceDocument,
} from "@/lib/api/audit";

export const Route = createFileRoute("/app/audit")({
  head: () => ({ meta: [{ title: "Activity & Evidence — CRMS" }] }),
  component: AuditPage,
});

/* ---------- Formatting helpers ---------- */

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function actorInitials(a: string) {
  const parts = a.replace(/[._-]/g, " ").split(" ").filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
function friendlyAction(a: string) {
  return a.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function severity(status: number, action: string): "success" | "warn" | "danger" | "info" {
  if (action.includes("DELETE") || action.includes("FAILED") || status >= 500) return "danger";
  if (action === "OVERRIDE_BOOKING" || (status >= 400 && status < 500)) return "warn";
  if (action.startsWith("CREATE") || action === "USER_LOGIN" || (status >= 200 && status < 300)) return "success";
  return "info";
}
function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
const SEV_STYLE: Record<string, { ring: string; bg: string; text: string; label: string; Icon: typeof CheckCircle2 }> = {
  success: { ring: "ring-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-500",  label: "Success",  Icon: CheckCircle2 },
  warn:    { ring: "ring-amber-500/30",   bg: "bg-amber-500/10",   text: "text-amber-500",    label: "Warning",  Icon: AlertTriangle },
  danger:  { ring: "ring-rose-500/30",    bg: "bg-rose-500/10",    text: "text-rose-500",     label: "Critical", Icon: XCircle },
  info:    { ring: "ring-indigo-500/30",  bg: "bg-indigo-500/10",  text: "text-indigo-500",   label: "Info",     Icon: Activity },
};

const MODULES = ["bookings", "resources", "bus", "users", "materials", "courses", "results", "attendance", "notifications"];

/* ---------- Page ---------- */

function AuditPage() {
  const { user, can } = useRole();
  if (!can("nav:audit")) return <Navigate to="/app/dashboard" />;

  const scope = user ? MANAGER_AUDIT_SCOPE[user.role] : undefined;
  const isAdmin = user?.role === "admin";

  const { data: logsResponse, isLoading: loadingLogs } = useQuery({
    queryKey: ["audit", "logs"],
    // Server already scopes this to "what the role manages" (or everything,
    // for admin) — see audit.service.js's buildRoleScopeFilter. We just ask
    // for a generous page size since this page does its own client-side
    // filter/search/"load more" on top of that.
    queryFn: () => getAuditLogs({ limit: 300 }),
  });
  const logs = logsResponse?.logs ?? [];

  const [moduleFilter, setModuleFilter] = useState("all");
  const [actorFilter, setActorFilter]   = useState("all");
  const [sevFilter, setSevFilter]       = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(20);

  const actors = useMemo(() => {
    const names = new Set<string>();
    logs.forEach(l => names.add(l.actor?.name ?? l.actorRole ?? "system"));
    return Array.from(names).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const actorName = l.actor?.name ?? l.actorRole ?? "system";
      if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
      if (actorFilter  !== "all" && actorName !== actorFilter) return false;
      if (sevFilter    !== "all" && severity(l.status, l.action) !== sevFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = [l._id, actorName, l.action, l.module, l.targetId ?? "", JSON.stringify(l.details ?? "")];
        if (!haystack.some(v => v.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [logs, moduleFilter, actorFilter, sevFilter, query]);

  useEffect(() => { setVisible(20); }, [moduleFilter, actorFilter, sevFilter, query]);

  const stats = useMemo(() => {
    const bySev: Record<"success" | "warn" | "danger" | "info", number> = { success: 0, warn: 0, danger: 0, info: 0 };
    logs.forEach(l => { bySev[severity(l.status, l.action)]++; });
    return { total: logs.length, success: bySev.success, warn: bySev.warn, danger: bySev.danger, info: bySev.info, last: logs[0]?.createdAt };
  }, [logs]);

  const exportCsv = () => {
    const rows = ["id,timestamp,actor,role,action,module,target,severity,status",
      ...filtered.map(l => {
        const sev = severity(l.status, l.action);
        const actorName = l.actor?.name ?? l.actorRole ?? "system";
        return [l._id, l.createdAt, actorName, l.actorRole, l.action, l.module, l.targetId ?? "", sev, l.status].join(",");
      })
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `crms-activity-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} entries`);
  };

  /* ---------- Evidence docs ---------- */

  const queryClient = useQueryClient();
  const { data: docs = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["audit", "documents"],
    queryFn: getEvidenceDocuments,
  });
  const refreshDocs = () => queryClient.invalidateQueries({ queryKey: ["audit", "documents"] });

  const removeDoc = async (id: string) => {
    try {
      await deleteEvidenceDocument(id);
      toast.success("Document removed");
      refreshDocs();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to remove document");
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, ApiAuditLog[]> = {};
    filtered.slice(0, visible).forEach(l => {
      const key = new Date(l.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
      (map[key] ||= []).push(l);
    });
    return Object.entries(map);
  }, [filtered, visible]);

  return (
    <>
      <AppHeader
        title="Activity & Evidence"
        subtitle={isAdmin
          ? "A clean, human-readable trail of everything that happened across the system, with room to attach supporting documents."
          : "A clean, human-readable trail of what happened in your domain, when, and by whom — with room to attach supporting documents."}
      />

      <div className="p-5 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard tone="primary" icon={Activity}     label="Total activity"   value={String(stats.total)} sub={stats.last ? relTime(stats.last) + " · latest" : ""} />
          <StatCard tone="success" icon={CheckCircle2} label="Successful"       value={String(stats.success)} sub="Completed operations" />
          <StatCard tone="warn"    icon={AlertTriangle} label="Needs attention" value={String(stats.warn)}   sub="Warnings & overrides" />
          <StatCard tone="danger"  icon={XCircle}      label="Critical"         value={String(stats.danger)} sub="Failures & deletions" />
        </div>

        {/* Filters + actions */}
        <Card className="border-border/70">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FilterField label="Search">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Actor, action, record…" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                </FilterField>
                <FilterField label="Module">
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All modules</SelectItem>
                      {(scope ?? MODULES).map(m => <SelectItem key={m} value={m}>{friendlyAction(m)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Actor">
                  <Select value={actorFilter} onValueChange={setActorFilter}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any actor</SelectItem>
                      {actors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FilterField>
                <FilterField label="Severity">
                  <Select value={sevFilter} onValueChange={setSevFilter}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="success">Successful</SelectItem>
                      <SelectItem value="warn">Needs attention</SelectItem>
                      <SelectItem value="danger">Critical</SelectItem>
                      <SelectItem value="info">Informational</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterField>
              </div>
              <div className="flex items-center gap-2">
                <UploadDocDialog scope={scope} onSaved={refreshDocs} />
                <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Activity timeline
                </CardTitle>
                <p className="text-xs text-muted-foreground">Grouped by day, newest first{scope ? ` · scoped to ${scope.map(friendlyAction).join(" & ")}` : ""}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{filtered.length} entries</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingLogs ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading activity…</div>
              ) : grouped.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No activity matches your filters.
                </div>
              ) : (
                grouped.map(([day, items]) => (
                  <div key={day} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{day}</p>
                      <div className="h-px flex-1 bg-border/60" />
                      <span className="text-[10px] text-muted-foreground">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(l => <TimelineRow key={l._id} entry={l} />)}
                    </div>
                  </div>
                ))
              )}

              {visible < filtered.length && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setVisible(v => v + 20)}>
                    Load more ({filtered.length - visible} remaining)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" /> {isAdmin ? "Evidence documents (all)" : "My uploaded files"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Every file uploaded from this page, by anyone" : "Reports, receipts, memos & policies you've attached"}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">{docs.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingDocs ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading…</div>
              ) : docs.length === 0 ? (
                <div className="border border-dashed border-border/70 rounded-lg py-8 text-center">
                  <FileText className="h-6 w-6 mx-auto text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground mt-2">No documents yet. Upload evidence to keep the trail complete.</p>
                </div>
              ) : (
                docs.map(d => (
                  <div key={d._id} className="rounded-lg border border-border/60 bg-card/50 p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {friendlyAction(d.module)} · {humanSize(d.fileSize)} · {relTime(d.createdAt)}
                        </p>
                        {d.note && <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2">{d.note}</p>}
                        <p className="text-[10px] text-muted-foreground mt-1">by {d.uploadedBy?.name ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1 flex-1" asChild>
                        <a href={d.fileUrl} target="_blank" rel="noreferrer">
                          <Download className="h-3 w-3" /> Download
                        </a>
                      </Button>
                      {(isAdmin || user?._id === d.uploadedBy?._id) && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeDoc(d._id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({ icon: Icon, label, value, sub, tone }: {
  icon: typeof Activity; label: string; value: string; sub?: string;
  tone: "primary" | "success" | "warn" | "danger";
}) {
  const tones = {
    primary: "bg-primary/10 ring-primary/20 text-primary",
    success: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500",
    warn:    "bg-amber-500/10 ring-amber-500/20 text-amber-500",
    danger:  "bg-rose-500/10 ring-rose-500/20 text-rose-500",
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ring-1 ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold leading-tight">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TimelineRow({ entry }: { entry: ApiAuditLog }) {
  const sev = severity(entry.status, entry.action);
  const s = SEV_STYLE[sev];
  const actorName = entry.actor?.name ?? entry.actorRole ?? "system";
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-card/70 transition-all">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary">
          {actorInitials(actorName)}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-background ${s.bg} ${s.text}`}>
          <s.Icon className="h-2.5 w-2.5" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{actorName}</span>
          <span className="text-xs text-muted-foreground">· {entry.actorRole.replace(/_/g, " ")}</span>
          <span className="text-sm">{friendlyAction(entry.action).toLowerCase()}</span>
          {entry.targetId && <Badge variant="outline" className="text-[10px] font-mono">{entry.targetId.slice(-8)}</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtDate(entry.createdAt)} · {relTime(entry.createdAt)}</span>
          <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" /> {friendlyAction(entry.module)}</span>
        </div>
      </div>

      {/* Severity chip */}
      <Badge className={`shrink-0 border-0 ${s.bg} ${s.text}`}>{s.label}</Badge>
    </div>
  );
}

function UploadDocDialog({ scope, onSaved }: { scope?: string[]; onSaved: () => void }) {
  const [open, setOpen]     = useState(false);
  const [title, setTitle]   = useState("");
  const [note, setNote]     = useState("");
  const [mod, setMod]       = useState((scope ?? MODULES)[0]);
  const [file, setFile]     = useState<File | null>(null);
  const [busy, setBusy]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_BYTES = 20 * 1024 * 1024;

  const reset = () => { setTitle(""); setNote(""); setFile(null); if (inputRef.current) inputRef.current.value = ""; };

  const submit = async () => {
    if (!title.trim() || !file) { toast.error("Title and file are required"); return; }
    if (file.size > MAX_BYTES) { toast.error(`File exceeds ${humanSize(MAX_BYTES)} limit`); return; }
    setBusy(true);
    try {
      await uploadEvidenceDocument({ title: title.trim(), note: note.trim(), module: mod, file });
      toast.success("Document attached to the audit trail");
      reset(); setOpen(false); onSaved();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Upload failed");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <FileUp className="h-3.5 w-3.5" /> Upload document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Attach evidence document
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. October fuel receipts" />
          </div>
          <div className="grid gap-1.5">
            <Label>Related module</Label>
            <Select value={mod} onValueChange={setMod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(scope ?? MODULES).map(m => <SelectItem key={m} value={m}>{friendlyAction(m)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Context, reference numbers, related event IDs…" />
          </div>
          <div className="grid gap-1.5">
            <Label>File <span className="text-muted-foreground font-normal">(max {humanSize(MAX_BYTES)})</span></Label>
            <div className="border border-dashed border-border/70 rounded-lg p-4 text-center">
              <input ref={inputRef} type="file" className="hidden" id="audit-file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <label htmlFor="audit-file" className="cursor-pointer inline-flex flex-col items-center gap-1.5">
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm">{file ? file.name : "Click to choose a file"}</span>
                {file && <span className="text-[11px] text-muted-foreground">{humanSize(file.size)}</span>}
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Uploading…" : "Attach document"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
