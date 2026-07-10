import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, can } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { getResources, type ApiResource } from "@/lib/api/resources";
import { createBooking, getResourceAvailability } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/schedule")({
  head: () => ({ meta: [{ title: "Master Schedule — CRMS" }] }),
  component: SchedulePage,
});

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

/* ---- date helpers — the grid always shows real Mon–Fri calendar dates for
   whichever week is selected, not an abstract "Mon/Tue/Wed" label ---- */
function mondayOf(d: Date) {
  const nd = new Date(d);
  const day = nd.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nd.setDate(nd.getDate() + diff);
  nd.setHours(0, 0, 0, 0);
  return nd;
}
function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function atTime(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const nd = new Date(day);
  nd.setHours(h, m, 0, 0);
  return nd;
}
function fmtDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

type Cell = "free" | "pending" | "booked";
type Slot = { startTime: string; endTime: string; status: string };

// Time-slot bookings only apply to halls/labs (type "lab" / "general") —
// books and equipment use a dueDate checkout flow instead, handled by the
// Checkout Desk / My Borrowed Assets pages, not this scheduling grid.
const SCHEDULABLE_TYPES = ["lab", "general"];

function SchedulePage() {
  const { user } = useRole();
  const queryClient = useQueryClient();
  const canBook = can(user?.role, "action:bookResource");

  const { data: allResources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources", "schedulable"],
    queryFn: () => getResources(),
  });
  const resources = useMemo(
    () => allResources.filter(r => SCHEDULABLE_TYPES.includes(String((r as ApiResource).type))),
    [allResources]
  );

  const [resourceId, setResourceId] = useState<string>("");
  const resource = resources.find(r => r._id === resourceId) ?? resources[0];
  const effectiveResourceId = resourceId || resources[0]?._id || "";

  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => {
    const monday = addDays(mondayOf(new Date()), weekOffset * 7);
    return Array.from({ length: 5 }, (_, i) => addDays(monday, i));
  }, [weekOffset]);
  const weekStart = ymd(days[0]);
  const weekEnd = ymd(addDays(days[4], 1));

  const { data: availability = [], isLoading: loadingAvailability } = useQuery({
    queryKey: ["availability", effectiveResourceId, weekStart, weekEnd],
    queryFn: () => getResourceAvailability(effectiveResourceId, weekStart, weekEnd),
    enabled: !!effectiveResourceId,
  });

  const underMaintenance = resource && (resource as ApiResource).status !== "available";

  const grid = useMemo(() => {
    const g: Cell[][] = days.map(() => HOURS.map(() => "free" as Cell));
    (availability as Slot[]).forEach(slot => {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      days.forEach((day, di) => {
        const dayEnd = addDays(day, 1);
        if (e <= day || s >= dayEnd) return;
        HOURS.forEach((h, hi) => {
          const cellStart = atTime(day, h);
          const cellEnd = new Date(cellStart.getTime() + 60 * 60 * 1000);
          if (s < cellEnd && e > cellStart) {
            g[di][hi] = slot.status === "pending" && g[di][hi] !== "booked" ? "pending" : "booked";
          }
        });
      });
    });
    return g;
  }, [availability, days]);

  const [dayIndex, setDayIndex] = useState(0);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("11:00");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);

  const conflict = useMemo(() => {
    const sIdx = HOURS.indexOf(start);
    const eIdx = HOURS.indexOf(end);
    if (sIdx < 0 || eIdx <= sIdx) return null;
    const clashHours: string[] = [];
    for (let h = sIdx; h < eIdx; h++) {
      if (grid[dayIndex]?.[h] !== "free") clashHours.push(HOURS[h]);
    }
    return clashHours.length ? { hours: clashHours } : null;
  }, [start, end, grid, dayIndex]);

  const suggestions = useMemo(() => {
    const len = HOURS.indexOf(end) - HOURS.indexOf(start);
    if (len <= 0) return [];
    const out: { dayIdx: number; start: string; end: string }[] = [];
    for (let di = 0; di < days.length && out.length < 3; di++) {
      for (let h = 0; h + len <= HOURS.length && out.length < 3; h++) {
        const ok = Array.from({ length: len }).every((_, k) => grid[di]?.[h + k] === "free");
        if (ok) out.push({ dayIdx: di, start: HOURS[h], end: HOURS[h + len] });
      }
    }
    return out;
  }, [grid, days, start, end]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict || !canBook || !effectiveResourceId || underMaintenance) return;
    setSubmitting(true);
    try {
      const day = days[dayIndex];
      await createBooking({
        resource: effectiveResourceId,
        startTime: atTime(day, start).toISOString(),
        endTime: atTime(day, end).toISOString(),
        purpose: purpose.trim() || "Resource booking",
      });
      const label = `${fmtDay(day)} · ${start}–${end}`;
      toast.success(`Booking request submitted`, { description: `${resource?.name ?? "Resource"} · ${label}` });
      setLastSubmitted(label);
      setPurpose("");
      queryClient.invalidateQueries({ queryKey: ["availability", effectiveResourceId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit booking request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Master Schedule" subtitle="Live availability across every campus resource" />
      <div className="px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
        <Card className="bg-card/60 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><CalendarRange className="h-4 w-4 text-primary" /> Availability Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">
                {resource?.name ?? (loadingResources ? "Loading…" : "No schedulable resources")} · {fmtDay(days[0])} – {fmtDay(days[4])}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-primary/80"/>Booked</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm [background-image:repeating-linear-gradient(45deg,oklch(0.6_0.14_60)_0_3px,transparent_3px_6px)]"/>Pending</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-background border border-border"/>Available</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm [background-image:repeating-linear-gradient(45deg,oklch(0.78_0.16_75)_0_3px,transparent_3px_6px)]"/>Maintenance</span>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <Select value={effectiveResourceId} onValueChange={setResourceId}>
                <SelectTrigger className="w-56"><SelectValue placeholder={loadingResources ? "Loading…" : "Select resource"} /></SelectTrigger>
                <SelectContent>
                  {resources.map(r => <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <Button type="button" size="icon" variant="outline" className="h-7 w-7" onClick={() => setWeekOffset(w => w - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {weekOffset !== 0 && (
                  <button type="button" onClick={() => setWeekOffset(0)} className="text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2">
                    This week
                  </button>
                )}
                <Button type="button" size="icon" variant="outline" className="h-7 w-7" onClick={() => setWeekOffset(w => w + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {underMaintenance && (
              <div className="mb-3 rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-center gap-2 text-xs">
                <Wrench className="h-4 w-4 text-warning shrink-0" />
                <span>{resource?.name} is currently under maintenance{(resource as any)?.maintenanceNote ? ` — ${(resource as any).maintenanceNote}` : ""}. Bookings are disabled until it's cleared.</span>
              </div>
            )}

            <div className="min-w-[640px]">
              <div className="grid grid-cols-[90px_repeat(10,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground mb-1">
                <div></div>
                {HOURS.map(h => <div key={h} className="text-center">{h}</div>)}
              </div>
              {days.map((d, di) => (
                <div key={di} className="grid grid-cols-[90px_repeat(10,minmax(0,1fr))] gap-1 mb-1">
                  <button type="button" onClick={() => setDayIndex(di)}
                    className={cn("text-xs font-medium self-center text-left px-1 rounded-md",
                      di === dayIndex ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {fmtDay(d)}
                  </button>
                  {(underMaintenance ? HOURS.map(() => "maintenance" as const) : grid[di] ?? HOURS.map(() => "free" as const)).map((cell, hi) => {
                    const inSel = di === dayIndex && hi >= HOURS.indexOf(start) && hi < HOURS.indexOf(end);
                    return (
                      <div key={hi}
                        className={cn("h-9 rounded-md border transition-all",
                          cell === "booked"      && "bg-primary/80 border-primary",
                          cell === "pending"     && "border-warning/50 [background-image:repeating-linear-gradient(45deg,oklch(0.6_0.14_60_/_0.35)_0_4px,transparent_4px_8px)]",
                          cell === "maintenance" && "border-warning/40 [background-image:repeating-linear-gradient(45deg,oklch(0.78_0.16_75_/_0.4)_0_4px,transparent_4px_8px)]",
                          cell === "free"        && "bg-background/30 border-border hover:bg-accent/40",
                          inSel && cell === "free" && "ring-2 ring-success/70 bg-success/10 border-success/60",
                          inSel && cell !== "free" && "ring-2 ring-destructive/80",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
              {loadingAvailability && !underMaintenance && (
                <p className="text-[11px] text-muted-foreground text-center py-2">Loading availability…</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Request a resource</CardTitle>
            <p className="text-xs text-muted-foreground">Live conflict detection runs as you type</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label>Resource</Label>
                <Select value={effectiveResourceId} onValueChange={setResourceId}>
                  <SelectTrigger><SelectValue placeholder={loadingResources ? "Loading…" : "Select resource"} /></SelectTrigger>
                  <SelectContent>
                    {resources.map(r => <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label>Day</Label>
                  <Select value={String(dayIndex)} onValueChange={v => setDayIndex(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{days.map((d, i) => <SelectItem key={i} value={String(i)}>{fmtDay(d)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Start</Label>
                  <Select value={start} onValueChange={setStart}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>End</Label>
                  <Select value={end} onValueChange={setEnd}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Purpose</Label>
                <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. CS-401 lecture · 84 students" />
              </div>

              {underMaintenance ? (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-3.5 flex items-start gap-2">
                  <Wrench className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-xs">This resource is under maintenance and can't be booked right now.</p>
                </div>
              ) : conflict ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Scheduling conflict</p>
                      <p className="text-xs text-foreground/80">
                        {resource?.name} is unavailable {fmtDay(days[dayIndex])} at {conflict.hours.join(", ")} — overlaps an existing booking.
                      </p>
                    </div>
                  </div>
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3" /> Suggested alternative slots
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((s, i) => (
                          <button type="button" key={i}
                            onClick={() => { setDayIndex(s.dayIdx); setStart(s.start); setEnd(s.end); }}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-background/70 border border-border hover:border-primary hover:bg-primary/10">
                            {fmtDay(days[s.dayIdx])} · {s.start}–{s.end}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-success/30 bg-success/10 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                  <p className="text-xs">Slot is clear. Submitting will create a pending booking request.</p>
                </div>
              )}

              {!canBook && (
                <p className="text-[11px] text-muted-foreground italic">
                  Students view the schedule in read-only mode — switch to Faculty or Admin via the Role Simulator to request resources.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={!canBook || !!conflict || !effectiveResourceId || underMaintenance || submitting}>
                {submitting ? "Submitting…" : "Submit booking request"}
              </Button>

              {lastSubmitted && (
                <Badge variant="secondary" className="border-success/40 text-success">Booking queued · {resource?.name} {lastSubmitted}</Badge>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
