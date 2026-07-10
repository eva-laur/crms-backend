import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRole, ROLE_META, type Role } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Printer, FileSpreadsheet, FileText, FileCode2, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import { getBookings } from "@/lib/api/bookings";
import { getAllReservations } from "@/lib/api/bus";
import { getMaterials } from "@/lib/api/coursework";
import { getAttendance } from "@/lib/api/academic";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Departmental Reporting & Analytics — CRMS" }] }),
  component: ReportsPage,
});

type Scope = "weekly" | "monthly" | "yearly";
type Bucket = { k: string; v: number; v2: number; start: Date; end: Date };

const SCOPE_LABEL: Record<Scope, string> = { weekly: "Last 7 days", monthly: "Last 4 weeks", yearly: "Last 12 months" };

function startOfDay(d: Date) { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; }
function addDays(d: Date, n: number) { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; }

/** Builds empty, real-calendar-dated buckets for the chosen scope; counts are
 *  filled in afterwards from whatever real records apply to the viewer's role. */
function buildBuckets(scope: Scope): Bucket[] {
  const today = startOfDay(new Date());
  if (scope === "weekly") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      return { k: d.toLocaleDateString(undefined, { weekday: "short" }), v: 0, v2: 0, start: d, end: addDays(d, 1) };
    });
  }
  if (scope === "monthly") {
    const end = addDays(today, 1);
    return Array.from({ length: 4 }, (_, i) => ({
      k: `W-${i + 1}`, v: 0, v2: 0,
      start: addDays(end, -(4 - i) * 7), end: addDays(end, -(3 - i) * 7),
    }));
  }
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const s = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const e = new Date(now.getFullYear(), now.getMonth() - 11 + i + 1, 1);
    return { k: s.toLocaleDateString(undefined, { month: "short" }), v: 0, v2: 0, start: s, end: e };
  });
}
function fill(buckets: Bucket[], date: unknown, field: "v" | "v2", inc = 1) {
  if (!date) return;
  const t = new Date(date as string).getTime();
  if (Number.isNaN(t)) return;
  const b = buckets.find(b => t >= b.start.getTime() && t < b.end.getTime());
  if (b) b[field] += inc;
}

const ROLE_TERMS: Partial<Record<Role, { primary: string; secondary: string; ledger: string }>> = {
  library_manager:   { primary: "Loans issued",        secondary: "Returns processed",   ledger: "Circulation ledger" },
  logistics_manager: { primary: "Trips operated",      secondary: "Riders boarded",       ledger: "Fleet trip log" },
  it_manager:        { primary: "Equipment checkouts", secondary: "Equipment returns",    ledger: "Hardware checkout log" },
  lab_manager:       { primary: "Lab sessions",        secondary: "Reservations met",     ledger: "Lab usage log" },
  admin:             { primary: "Operations",          secondary: "Checkout transactions", ledger: "Master operations log" },
  faculty:           { primary: "Sessions taught",     secondary: "Materials uploaded",   ledger: "Teaching activity log" },
};

function ReportsPage() {
  const { user, can } = useRole();
  if (!can("nav:reports")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;
  return <ReportsInner role={user.role} userId={user._id ?? ""} />;
}

function ReportsInner({ role, userId }: { role: Role; userId: string }) {
  const [scope, setScope] = useState<Scope>("monthly");
  const terms = ROLE_TERMS[role] ?? { primary: "Activity", secondary: "Activity", ledger: "Activity log" };

  const bookingsNeeded = ["library_manager", "it_manager", "lab_manager", "admin"].includes(role);
  const { data: bookings = [], isLoading: lb } = useQuery({
    queryKey: ["bookings", "all"], queryFn: () => getBookings(), enabled: bookingsNeeded,
  });
  const { data: reservations = [], isLoading: lr } = useQuery({
    queryKey: ["bus", "reservations", "all"], queryFn: getAllReservations, enabled: role === "logistics_manager",
  });
  const { data: materials = [], isLoading: lm } = useQuery({
    queryKey: ["materials", "mine"], queryFn: getMaterials, enabled: role === "faculty",
  });
  const { data: sessions = [], isLoading: la } = useQuery({
    queryKey: ["attendance", "taught"], queryFn: getAttendance, enabled: role === "faculty",
  });

  const isLoading =
    (bookingsNeeded && lb) || (role === "logistics_manager" && lr) || (role === "faculty" && (lm || la));

  const buckets = useMemo(() => {
    const b = buildBuckets(scope);
    if (role === "library_manager") {
      (bookings as any[]).filter(x => x.resource?.type === "book").forEach(x => {
        fill(b, x.checkOutDate, "v");
        fill(b, x.returnDate, "v2");
      });
    } else if (role === "it_manager") {
      (bookings as any[]).filter(x => x.resource?.type === "equipment").forEach(x => {
        fill(b, x.checkOutDate, "v");
        fill(b, x.returnDate, "v2");
      });
    } else if (role === "lab_manager") {
      (bookings as any[]).filter(x => x.resource?.type === "lab" && !["cancelled", "rejected"].includes(x.status)).forEach(x => {
        fill(b, x.startTime, "v");
        if (["approved", "checked_out", "returned"].includes(x.status)) fill(b, x.startTime, "v2");
      });
    } else if (role === "admin") {
      (bookings as any[]).forEach(x => {
        fill(b, x.createdAt, "v");
        fill(b, x.checkOutDate, "v2");
      });
    } else if (role === "logistics_manager") {
      const confirmed = (reservations as any[]).filter(r => r.status === "confirmed");
      const seenTrip = new Set<string>();
      confirmed.forEach(r => {
        fill(b, r.travelDate, "v2"); // riders boarded
        const tripKey = `${r.route?._id ?? r.route}-${new Date(r.travelDate).toDateString()}`;
        if (!seenTrip.has(tripKey)) { seenTrip.add(tripKey); fill(b, r.travelDate, "v"); } // distinct trips
      });
    } else if (role === "faculty") {
      (sessions as any[]).forEach(s => fill(b, s.date ?? s.createdAt, "v"));
      (materials as any[]).filter(m => (m.uploadedBy?._id ?? m.uploadedBy) === userId).forEach(m => fill(b, m.createdAt, "v2"));
    }
    return b;
  }, [scope, role, bookings, reservations, materials, sessions, userId]);

  const totals = useMemo(() => {
    const sumA = buckets.reduce((a, r) => a + r.v, 0);
    const sumB = buckets.reduce((a, r) => a + r.v2, 0);
    const peak = Math.max(0, ...buckets.map(r => r.v));
    const first = buckets[0]?.v ?? 0;
    const last = buckets[buckets.length - 1]?.v ?? 0;
    const change = first === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - first) / first) * 100);
    return { sumA, sumB, peak, change };
  }, [buckets]);

  function download(fmt: "PDF" | "Excel" | "CSV") {
    const headers = ["period", terms.primary, terms.secondary];
    const stamp = new Date().toISOString().slice(0, 10);
    const base = `crms-${role}-${scope}-${stamp}`;
    if (fmt === "PDF") {
      toast.info("Opening print preview — choose 'Save as PDF'");
      setTimeout(() => window.print(), 250);
      return;
    }
    const csv = [headers.join(","), ...buckets.map(r => [r.k, r.v, r.v2].join(","))].join("\n");
    const ext = fmt === "Excel" ? "xls" : "csv";
    const mime = fmt === "Excel" ? "application/vnd.ms-excel" : "text/csv";
    const blob = new Blob([csv], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${base}.${ext}`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success(`${fmt} report downloaded`, { description: `${ROLE_META[role].label} · ${SCOPE_LABEL[scope]}` });
  }
  function print() {
    toast.info("Opening print preview");
    setTimeout(() => window.print(), 250);
  }

  return (
    <>
      <AppHeader title="Departmental Reporting & Analytics" subtitle={`${ROLE_META[role].label} · scoped to your service area`} />
      <div className="px-5 lg:px-8 py-6 space-y-6">

        {/* Action row */}
        <Card className="bg-card/60 no-print">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Report scope</p>
                <p className="text-[11px] text-muted-foreground">Charts and ledger refresh instantly</p>
              </div>
              <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
                <SelectTrigger className="h-9 w-[200px] ml-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">📅 Weekly Report</SelectItem>
                  <SelectItem value="monthly">📅 Monthly Report</SelectItem>
                  <SelectItem value="yearly">📅 Yearly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    <Download className="h-4 w-4 mr-1.5" /> Download Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => download("PDF")}><FileText className="h-4 w-4 mr-2" /> PDF document</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => download("Excel")}><FileSpreadsheet className="h-4 w-4 mr-2" /> Excel workbook</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => download("CSV")}><FileCode2 className="h-4 w-4 mr-2" /> CSV (raw)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" onClick={print}>
                <Printer className="h-4 w-4 mr-1.5" /> Print Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-10">Loading…</p>
        ) : (
          <>
            {/* Headline metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Headline label={`${terms.primary} · ${SCOPE_LABEL[scope]}`}   value={totals.sumA.toLocaleString()} />
              <Headline label={`${terms.secondary} · ${SCOPE_LABEL[scope]}`} value={totals.sumB.toLocaleString()} />
              <Headline label="Peak period"                                 value={totals.peak.toLocaleString()} />
              <Headline label="Change vs. period start"                     value={`${totals.change > 0 ? "+" : ""}${totals.change}%`} tone="primary" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card className="bg-card/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{terms.primary}</CardTitle>
                    <p className="text-xs text-muted-foreground">{SCOPE_LABEL[scope]}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">scope · {scope}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart data={buckets} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                        <XAxis dataKey="k" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "oklch(0.25 0.04 260)", border: "1px solid oklch(0.32 0.035 260)", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="v" fill="oklch(0.62 0.19 275)" radius={[6, 6, 0, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" />Trend · {terms.primary} vs. {terms.secondary}</CardTitle>
                    <p className="text-xs text-muted-foreground">{SCOPE_LABEL[scope]}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer>
                      <LineChart data={buckets} margin={{ left: -10, right: 8, top: 8 }}>
                        <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                        <XAxis dataKey="k" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "oklch(0.25 0.04 260)", border: "1px solid oklch(0.32 0.035 260)", borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" name={terms.primary}   dataKey="v"  stroke="oklch(0.62 0.19 275)" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" name={terms.secondary} dataKey="v2" stroke="oklch(0.70 0.17 160)" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ledger */}
            <Card className="bg-card/60">
              <CardHeader>
                <CardTitle className="text-base">{terms.ledger}</CardTitle>
                <p className="text-xs text-muted-foreground">Transaction log · {SCOPE_LABEL[scope]}</p>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                    <tr>
                      <th className="text-left  px-5 py-2.5 font-medium">Period</th>
                      <th className="text-right px-3 py-2.5 font-medium">{terms.primary}</th>
                      <th className="text-right px-3 py-2.5 font-medium">{terms.secondary}</th>
                      <th className="text-right px-5 py-2.5 font-medium">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buckets.map((r, i, arr) => {
                      const prev = arr[i - 1]?.v ?? r.v;
                      const delta = r.v - prev;
                      return (
                        <tr key={r.k + i} className="border-b border-border/60">
                          <td className="px-5 py-3 font-medium">{r.k}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{r.v}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{r.v2}</td>
                          <td className={`px-5 py-3 text-right tabular-nums ${delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                            {delta > 0 ? "+" : ""}{delta}
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

function Headline({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <Card className="bg-card/60">
      <CardContent className="p-5">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone === "primary" ? "text-primary" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
