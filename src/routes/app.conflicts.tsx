import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, can } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, Clock, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { getBookings, overrideBooking } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/conflicts")({
  head: () => ({ meta: [{ title: "Conflict Resolution Centre — CRMS" }] }),
  component: ConflictsPage,
});

/* ---- clustering: two or more pending/approved bookings on the same
   resource with overlapping [startTime,endTime) form a "conflict" the
   Conflict Resolution Centre exists to resolve. Checked-out/returned/
   cancelled/rejected bookings aren't part of an active queue, so they're
   excluded — a resource already in someone's hands isn't a competing
   *request*, it's just current use. ---- */
function overlaps(a: any, b: any) {
  return new Date(a.startTime).getTime() < new Date(b.endTime).getTime()
      && new Date(b.startTime).getTime() < new Date(a.endTime).getTime();
}

function buildConflictClusters(bookings: any[]) {
  const active = bookings.filter(b => ["pending", "approved"].includes(b.status) && b.startTime && b.endTime);
  const byResource: Record<string, any[]> = {};
  active.forEach(b => {
    const rid = b.resource?._id ?? b.resource;
    if (!rid) return;
    (byResource[rid] ??= []).push(b);
  });

  const clusters: { key: string; resource: any; items: any[] }[] = [];
  Object.values(byResource).forEach(items => {
    items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    let group: any[] = [];
    let groupEnd = 0;
    const flush = () => {
      if (group.length >= 2) clusters.push({ key: group[0]._id, resource: group[0].resource, items: [...group] });
      group = []; groupEnd = 0;
    };
    items.forEach(it => {
      const s = new Date(it.startTime).getTime();
      const e = new Date(it.endTime).getTime();
      if (group.length === 0) { group.push(it); groupEnd = e; return; }
      if (s < groupEnd) { group.push(it); if (e > groupEnd) groupEnd = e; }
      else { flush(); group.push(it); groupEnd = e; }
    });
    flush();
  });
  return clusters;
}

function fmtWhen(items: any[]) {
  const s = new Date(Math.min(...items.map(i => new Date(i.startTime).getTime())));
  const e = new Date(Math.max(...items.map(i => new Date(i.endTime).getTime())));
  const day = s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const st = s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  const et = e.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} · ${st}–${et}`;
}

function formatDuration(ms: number) {
  const totalMin = Math.max(1, Math.round(ms / 60000));
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ConflictsPage() {
  const { user } = useRole();
  if (!can(user?.role, "nav:conflicts")) return <Navigate to="/app/dashboard" />;
  return <ConflictsInner />;
}

function ConflictsInner() {
  const { user } = useRole();
  const queryClient = useQueryClient();

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["bookings", "all"],
    queryFn: () => getBookings(),
    refetchInterval: 30000,
  });

  // lab_manager only administers "lab"-type resources — same scope the
  // backend itself enforces on the actual override call.
  const scoped = useMemo(() => {
    if (user?.role === "lab_manager") return (allBookings as any[]).filter(b => b.resource?.type === "lab");
    return allBookings as any[];
  }, [allBookings, user]);

  const clusters = useMemo(() => buildConflictClusters(scoped), [scoped]);

  const avgResolution = useMemo(() => {
    const resolved = (allBookings as any[]).filter(b => b.override?.at && b.createdAt);
    if (resolved.length === 0) return null;
    const totalMs = resolved.reduce((sum, b) => sum + (new Date(b.override.at).getTime() - new Date(b.createdAt).getTime()), 0);
    return totalMs / resolved.length;
  }, [allBookings]);

  const slaBreachRisk = useMemo(() =>
    clusters.filter(c => Math.min(...c.items.map(i => new Date(i.startTime).getTime())) - Date.now() < 48 * 3600 * 1000).length,
  [clusters]);

  const [selectedReq, setSelectedReq] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState<string | null>(null);

  const execute = async (clusterKey: string) => {
    const bookingId = selectedReq[clusterKey];
    const justification = (reasons[clusterKey] ?? "").trim();
    if (!bookingId || justification.length < 12) return;
    setExecuting(clusterKey);
    try {
      const res = await overrideBooking(bookingId, justification);
      toast.success(res.message, { description: "Decision committed to the audit log." });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to execute override");
    } finally {
      setExecuting(null);
    }
  };

  return (
    <>
      <AppHeader title="Conflict Resolution Centre" subtitle="Operational queue · administrative override journal" />
      <div className="px-5 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card/60"><CardContent className="p-5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Active queue</p>
            <p className="text-2xl font-semibold mt-1">{isLoading ? "…" : clusters.length}</p>
          </CardContent></Card>
          <Card className="bg-card/60"><CardContent className="p-5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Avg. resolution time</p>
            <p className="text-2xl font-semibold mt-1">{avgResolution === null ? "—" : formatDuration(avgResolution)}</p>
          </CardContent></Card>
          <Card className={cnRisk(slaBreachRisk)}><CardContent className="p-5">
            <p className={`text-[11px] uppercase tracking-wider ${slaBreachRisk > 0 ? "text-warning" : "text-muted-foreground"}`}>SLA breach risk</p>
            <p className="text-2xl font-semibold mt-1">{slaBreachRisk}</p>
          </CardContent></Card>
        </div>

        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-10">Loading…</p>
        ) : clusters.length === 0 ? (
          <Card className="bg-card/60"><CardContent className="p-10 text-center">
            <ShieldAlert className="h-8 w-8 text-success mx-auto" />
            <p className="mt-3 font-medium">Queue is clear</p>
            <p className="text-sm text-muted-foreground">No active resource clashes require override.</p>
          </CardContent></Card>
        ) : clusters.map(c => {
          const chosen = selectedReq[c.key];
          const reason = reasons[c.key] ?? "";
          const canExecute = !!chosen && reason.trim().length >= 12;
          return (
            <Card key={c.key} className="bg-card/60 backdrop-blur">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">#{c.key.slice(-6)}</Badge>
                    <Badge variant="outline" className="border-warning/40 text-warning text-[10px]">UNRESOLVED</Badge>
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" /> {c.resource?.name ?? "Resource"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3" /> {fmtWhen(c.items)}
                  </p>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Which request takes priority?</Label>
                  <RadioGroup
                    value={chosen ?? ""}
                    onValueChange={(v) => setSelectedReq(p => ({ ...p, [c.key]: v }))}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    {c.items.map((r: any) => {
                      const priority = r.status === "approved" ? "High" : "Medium";
                      return (
                        <Label key={r._id} htmlFor={`${c.key}-${r._id}`}
                          className="cursor-pointer rounded-xl border border-border bg-background/40 p-3.5 flex items-start gap-3 hover:bg-accent/40 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:ring-1 has-[:checked]:ring-primary/40">
                          <RadioGroupItem value={r._id} id={`${c.key}-${r._id}`} className="mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{r.purpose || "Resource booking"}</span>
                              <Badge variant={priority === "High" ? "destructive" : "outline"}
                                className={priority === "Medium" ? "border-warning/40 text-warning" : ""}>{priority}</Badge>
                              {r.status === "approved" && <Badge variant="secondary" className="text-[10px]">Already approved</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {r.user?.name ?? "Unknown"} · {r.user?.role?.replace(/_/g, " ") ?? "—"} · requested {timeAgo(r.createdAt)}
                            </p>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor={`reason-${c.key}`} className="text-xs">Administrative Override Justification Reason</Label>
                  <Textarea
                    id={`reason-${c.key}`}
                    placeholder="Document the rationale for this override — captured in the immutable audit log."
                    value={reason}
                    onChange={e => setReasons(p => ({ ...p, [c.key]: e.target.value }))}
                    rows={3}
                    className="mt-1.5 bg-input/40"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Min. 12 characters · {reason.length} entered</p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setReasons(p => ({ ...p, [c.key]: "" })); setSelectedReq(p => ({ ...p, [c.key]: "" })); }}>
                    Reset
                  </Button>
                  <Button size="sm" disabled={!canExecute || executing === c.key} onClick={() => execute(c.key)}>
                    {executing === c.key ? "Executing…" : "Execute Override"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function cnRisk(n: number) {
  return n > 0 ? "bg-card/60 ring-1 ring-warning/30" : "bg-card/60";
}
