import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRole, isManager, ROLE_META } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, Boxes, PackageCheck, AlertTriangle,
  Wrench, Activity, BookOpen, CalendarClock, GraduationCap, CheckCircle2,
  Library, Bus, Laptop, FlaskConical,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { getBookings, getOverdueBookings, type ApiBooking } from "@/lib/api/bookings";
import { getResources } from "@/lib/api/resources";
import { getAllUsers } from "@/lib/api/users";
import { getAuditLogs, getResourceTypeUtilization } from "@/lib/api/reports";
import { getCourses, getResults, getAttendance } from "@/lib/api/academic";
import { getFleet, getAllReservations, getRoutes } from "@/lib/api/bus";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CRMS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useRole();
  if (!user) return null;
  if (user.role === "admin") return <OperationsDashboard />;
  if (user.role === "lab_manager") return <OperationsDashboard />;
  if (isManager(user.role)) return <ScopedManagerDashboard />;
  if (user.role === "faculty") return <FacultyDashboard />;
  return <StudentDashboard />;
}

/* ---------------- shared helpers ---------------- */

const PALETTE = [
  "oklch(0.62 0.16 155)", "oklch(0.82 0.17 85)", "oklch(0.55 0.12 170)",
  "oklch(0.7 0.14 110)", "oklch(0.6 0.18 30)", "oklch(0.65 0.15 260)",
];

function isToday(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function fmtWindow(b: ApiBooking) {
  if (!b.startTime) return b.dueDate ? `Due ${new Date(b.dueDate as string).toLocaleDateString()}` : "—";
  const start = new Date(b.startTime as string);
  const end = b.endTime ? new Date(b.endTime as string) : null;
  const day = start.toLocaleDateString(undefined, { weekday: "short" });
  const startT = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endT = end ? end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
  return `${day} · ${startT}${endT ? `–${endT}` : ""}`;
}

/* ---------------- Scoped manager dashboards (only their own domain) ---------------- */

function ScopedManagerDashboard() {
  const { user } = useRole();
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "mine"], queryFn: () => getBookings(),
  });
  const { data: overdue = [] } = useQuery({
    queryKey: ["bookings", "overdue"], queryFn: () => getOverdueBookings(),
  });

  const isLibrary = user?.role === "library_manager";
  const isIT = user?.role === "it_manager";
  const isLogistics = user?.role === "logistics_manager";

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources", isLibrary ? "book" : "equipment"],
    queryFn: () => getResources({ type: isLibrary ? "book" : "equipment" }),
    enabled: !isLogistics,
  });

  const { data: fleet = [] } = useQuery({ queryKey: ["bus", "fleet"], queryFn: getFleet, enabled: isLogistics });
  const { data: reservations = [] } = useQuery({ queryKey: ["bus", "reservations"], queryFn: getAllReservations, enabled: isLogistics });
  const { data: routes = [] } = useQuery({ queryKey: ["bus", "routes"], queryFn: getRoutes, enabled: isLogistics });

  if (!user) return null;

  let title = "", subtitle = "", workspaceTo: "/app/library" | "/app/bus" | "/app/it-equipment" = "/app/library";
  let workspaceLabel = "";
  let Icon = Library;
  let metrics: { label: string; value: string; hint?: string; tone?: "success" | "warning" | "primary" }[] = [];

  if (isLibrary) {
    Icon = Library;
    title = "Library Catalog Console";
    subtitle = "Books, academic reports & novels — circulation & inventory";
    workspaceTo = "/app/library"; workspaceLabel = "Open Library Catalog";
    const totalCopies = resources.reduce((s, r) => s + Number((r as any).totalCopies ?? (r as any).quantity ?? 0), 0);
    const availableCopies = resources.reduce((s, r) => s + Number((r as any).availableCopies ?? 0), 0);
    const activeLoans = bookings.filter(b => b.resource?.type === "book" && ["approved", "checked_out"].includes(b.status)).length;
    const overdueBooks = overdue.filter(b => b.resource?.type === "book").length;
    metrics = [
      { label: "Titles in catalog", value: String(resources.length) },
      { label: "Copies available", value: String(availableCopies || totalCopies), tone: "success" },
      { label: "Active loans", value: String(activeLoans), tone: "primary" },
      { label: "Overdue returns", value: String(overdueBooks), tone: overdueBooks > 0 ? "warning" : undefined },
    ];
  } else if (isIT) {
    Icon = Laptop;
    title = "IT Equipment Console";
    subtitle = "Projectors · cameras · laptops · microphones · displays";
    workspaceTo = "/app/it-equipment"; workspaceLabel = "Open IT Equipment";
    const available = resources.filter(r => r.status === "available").length;
    const checkedOut = bookings.filter(b => b.resource?.type === "equipment" && b.status === "checked_out").length;
    const pending = bookings.filter(b => b.resource?.type === "equipment" && b.status === "pending").length;
    metrics = [
      { label: "Items tracked", value: String(resources.length) },
      { label: "Available", value: String(available), tone: "success" },
      { label: "Checked out", value: String(checkedOut), tone: "primary" },
      { label: "Pending requests", value: String(pending), tone: pending > 0 ? "warning" : undefined },
    ];
  } else if (isLogistics) {
    Icon = Bus;
    title = "Fleet & Logistics Console";
    subtitle = "Fleet · routes · reservations · fuel & mileage · maintenance";
    workspaceTo = "/app/bus"; workspaceLabel = "Open Bus & Transport";
    const active = fleet.filter((b: any) => b.status === "active").length;
    const maintenanceOpen = fleet.filter((b: any) => b.status === "under_maintenance").length;
    const confirmedSeats = reservations.filter((r: any) => r.status === "confirmed").length;
    const activeRoutes = routes.filter((r: any) => r.isActive).length;
    metrics = [
      { label: "Buses active", value: `${active} / ${fleet.length}`, tone: "success" },
      { label: "Active routes", value: String(activeRoutes) },
      { label: "Seats confirmed", value: String(confirmedSeats), tone: "primary" },
      { label: "Maintenance open", value: String(maintenanceOpen), tone: maintenanceOpen > 0 ? "warning" : undefined },
    ];
  }

  const loading = loadingBookings || (!isLogistics && loadingResources);

  return (
    <>
      <AppHeader title={title} subtitle={subtitle} />
      <div className="px-5 lg:px-8 py-6 space-y-6">
        <Card className="bg-card/60">
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{ROLE_META[user.role].label}</p>
                <p className="text-[11px] text-muted-foreground">{ROLE_META[user.role].tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">SCOPED VIEW</Badge>
              <a href={workspaceTo} className="text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90">
                {workspaceLabel}
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card/60"><CardContent className="p-5"><p className="text-2xl font-semibold text-muted-foreground">…</p></CardContent></Card>
              ))
            : metrics.map(m => (
              <Card key={m.label} className={`bg-card/60 ${m.tone === "warning" ? "ring-1 ring-warning/30" : ""}`}>
                <CardContent className="p-5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                  <p className={`mt-3 text-2xl font-semibold tracking-tight ${
                    m.tone === "warning" ? "text-warning"
                    : m.tone === "success" ? "text-success"
                    : m.tone === "primary" ? "text-primary" : ""
                  }`}>{m.value}</p>
                </CardContent>
              </Card>
            ))}
        </div>

        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Your workspace</CardTitle>
            <p className="text-xs text-muted-foreground">
              You only see {ROLE_META[user.role].short.toLowerCase()} resources — other domains are managed by their respective managers.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              <li className="rounded-lg border border-border p-3"><a href={workspaceTo} className="font-medium text-primary hover:underline">→ {workspaceLabel}</a><p className="text-[11px] text-muted-foreground mt-0.5">Manage inventory, requests and circulation.</p></li>
              <li className="rounded-lg border border-border p-3"><a href="/app/reports" className="font-medium text-primary hover:underline">→ Departmental Reports & Analytics</a><p className="text-[11px] text-muted-foreground mt-0.5">Weekly · monthly · yearly · with PDF/Excel/CSV export.</p></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ---------------- OPERATIONS (Admin + Lab Manager, role-gated panels) ---------------- */

function OperationsDashboard() {
  const { user, can } = useRole();
  const showUsers = can("nav:users");
  const showAudit = can("nav:audit");

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "mine"], queryFn: () => getBookings(),
  });
  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources", "all"], queryFn: () => getResources(),
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users", "all"], queryFn: getAllUsers, enabled: showUsers,
  });
  const { data: typeUtilization = [] } = useQuery({
    queryKey: ["reports", "utilization", "by-type"], queryFn: getResourceTypeUtilization,
  });
  const { data: auditData } = useQuery({
    queryKey: ["audit", "recent"], queryFn: () => getAuditLogs({ limit: 8 }), enabled: showAudit,
  });

  if (!user) return null;

  const isLabManager = user.role === "lab_manager";
  const labResources = resources.filter(r => r.type === "lab");
  const now = Date.now();
  const labsOccupiedNow = bookings.filter(b =>
    b.resource?.type === "lab" && b.startTime && b.endTime &&
    new Date(b.startTime as string).getTime() <= now && new Date(b.endTime as string).getTime() >= now &&
    ["approved", "checked_out"].includes(b.status)
  ).length;
  const labOccupancyPct = labResources.length ? Math.round((labsOccupiedNow / labResources.length) * 100) : 0;

  const headerTitle = isLabManager ? "Lab Halls Console" : (showAudit ? "Operations Console" : "Resource Operations");

  const bookingsToday = bookings.filter(b => isToday(b.startTime as string | undefined)).length;
  const activeCheckouts = bookings.filter(b => b.status === "checked_out").length;
  const pendingRequests = bookings.filter(b => b.status === "pending").length;

  const maintenanceItems = resources.filter(r => r.status === "under_maintenance");

  const utilizationData = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    const count = bookings.filter(b => {
      if (!b.startTime) return false;
      const d = new Date(b.startTime as string);
      return isToday(b.startTime as string) && d.getHours() === hour;
    }).length;
    return {
      hour: `${hour}:00`,
      bookings: count,
      occupancy: resources.length ? Math.round((count / resources.length) * 100) : 0,
    };
  });

  const categoryData = typeUtilization.map((t: any, i: number) => ({
    name: t.resourceType ? String(t.resourceType).replace(/^\w/, (c: string) => c.toUpperCase()) : "Other",
    value: t.bookingCount ?? 0,
    color: PALETTE[i % PALETTE.length],
  }));

  const auditRows = (auditData?.logs ?? []).map((a: any) => ({
    t: new Date(a.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    a: (a.action || "").split("_")[0] || "EVENT",
    who: a.actor?.name ?? a.actorRole ?? "system",
    msg: `${a.action ?? ""} · ${a.module ?? ""}${a.status && a.status >= 400 ? " (failed)" : ""}`,
  }));

  return (
    <>
      <AppHeader
        title={headerTitle}
        subtitle={showAudit
          ? "Live overview of campus resources, conflicts and infrastructure"
          : isLabManager
            ? `${ROLE_META[user.role].label} workspace — ${ROLE_META[user.role].tagline}`
            : "Resource utilization, checkouts and conflict queue"}
      />
      <div className="px-5 lg:px-8 py-6 space-y-6">
        {isLabManager && (
          <Card className="bg-card/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-8 flex-1">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Lab rooms supervised</p>
                  <p className="text-2xl font-semibold tracking-tight">{loadingResources ? "…" : labResources.length}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Occupancy now</p>
                  <p className="text-2xl font-semibold tracking-tight">{loadingBookings ? "…" : `${labOccupancyPct}%`}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">SPECIALIZED</Badge>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {showUsers
            ? <MetricCard icon={Users} label="Total Managed Users" value={String(users.length)} delta="Across all roles" />
            : <MetricCard icon={CalendarClock} label="Bookings Today" value={String(bookingsToday)} delta="Starting today" />}
          <MetricCard icon={Boxes} label="Total Institutional Resources" value={loadingResources ? "…" : String(resources.length)} delta="Tracked in catalog" />
          <MetricCard icon={PackageCheck} label="Active Physical Checkouts" value={loadingBookings ? "…" : String(activeCheckouts)} delta="Currently checked out" />
          <MetricCard icon={AlertTriangle} label="Pending Booking Requests" value={loadingBookings ? "…" : String(pendingRequests)} delta="Awaiting review" tone={pendingRequests > 0 ? "warning" : undefined} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Peak Resource Utilization</CardTitle>
                <p className="text-xs text-muted-foreground">Hourly bookings and derived occupancy across all facilities · today</p>
              </div>
              <Badge variant="outline" className="text-[10px]">LIVE</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer>
                  <ComposedChart data={utilizationData} margin={{ left: -10, right: 8, top: 8 }}>
                    <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                    <XAxis dataKey="hour" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "oklch(0.21 0.03 160)", border: "1px solid oklch(0.32 0.03 160)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="bookings" fill="oklch(0.62 0.16 155 / 0.7)" radius={[6,6,0,0]} barSize={18} />
                    <Line type="monotone" dataKey="occupancy" stroke="oklch(0.82 0.17 85)" strokeWidth={2.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Allocation by Category</CardTitle>
              <p className="text-xs text-muted-foreground">Share of booked hours by resource type</p>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {categoryData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No booking activity yet</div>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {categoryData.map((d: any) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                      </Pie>
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-warning"/> Maintenance Registry</CardTitle>
                <p className="text-xs text-muted-foreground">Resources currently under maintenance</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{maintenanceItems.length} OPEN</Badge>
            </CardHeader>
            <CardContent className="pt-0">
              {maintenanceItems.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Nothing under maintenance right now.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {maintenanceItems.map(m => (
                    <li key={m._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.name} · {m.location}</p>
                        <p className="text-[11px] text-muted-foreground">{m.maintenanceNote || "No note provided"}</p>
                      </div>
                      <Badge variant="outline" className="border-warning/40 text-warning">Under maintenance</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {showAudit && (
          <Card id="audit" className="bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-success"/> Audit Engine Terminal</CardTitle>
                <p className="text-xs text-muted-foreground">Live infrastructure & security feed</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-success/40 text-success">● STREAMING</Badge>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-background/60 font-mono text-[11px] leading-relaxed p-3 max-h-72 overflow-auto">
                {auditRows.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">No recent activity.</p>
                ) : auditRows.map((row: any, i: number) => (
                  <div key={i} className="flex gap-3 py-0.5">
                    <span className="text-muted-foreground shrink-0">{row.t}</span>
                    <span className="shrink-0 w-[90px] font-semibold text-primary">{row.a}</span>
                    <span className="shrink-0 w-[110px] text-muted-foreground truncate">{row.who}</span>
                    <span className="text-foreground/90 truncate">{row.msg}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </>
  );
}

function MetricCard({ icon: Icon, label, value, delta, trend = "up", tone }: {
  icon: typeof Users; label: string; value: string; delta: string;
  trend?: "up" | "down"; tone?: "warning";
}) {
  return (
    <Card className={`bg-card/60 backdrop-blur ${tone === "warning" ? "ring-1 ring-warning/40" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
            tone === "warning" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          {tone !== "warning" && (
            <span className="text-[11px] inline-flex items-center gap-0.5 text-muted-foreground">
              {delta}
            </span>
          )}
          {tone === "warning" && (
            <span className="text-[11px] inline-flex items-center gap-0.5 text-warning">{delta}</span>
          )}
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

/* ---------------- FACULTY ---------------- */

function FacultyDashboard() {
  const { user } = useRole();
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "mine"], queryFn: () => getBookings(),
  });
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["courses", "all"], queryFn: getCourses,
  });
  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance", "mine"], queryFn: getAttendance,
  });

  const myCourses = courses.filter((c: any) => c.lecturer?._id === user?._id || c.lecturer === user?._id);
  const studentIds = new Set<string>();
  myCourses.forEach((c: any) => (c.students ?? []).forEach((s: any) => studentIds.add(typeof s === "string" ? s : s._id)));

  const upcoming = bookings
    .filter(b => ["pending", "approved"].includes(b.status) && b.startTime && new Date(b.startTime as string).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startTime as string).getTime() - new Date(b.startTime as string).getTime())
    .slice(0, 6);

  let present = 0, total = 0;
  attendance.forEach((session: any) => {
    (session.records ?? []).forEach((r: any) => {
      total += 1;
      if (r.status === "present") present += 1;
    });
  });
  const attendancePct = total ? Math.round((present / total) * 100) : null;

  return (
    <>
      <AppHeader title="Faculty Workspace" subtitle="Resource bookings and academic logbook at a glance" />
      <div className="px-5 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={CalendarClock} label="My Upcoming Bookings" value={loadingBookings ? "…" : String(upcoming.length)} delta="Pending or approved" />
          <MetricCard icon={BookOpen}      label="Active Courses"        value={loadingCourses ? "…" : String(myCourses.length)} delta="Currently teaching" />
          <MetricCard icon={GraduationCap} label="Students Under Review" value={loadingCourses ? "…" : String(studentIds.size)} delta="Enrolled across your courses" />
          <MetricCard icon={CheckCircle2}  label="Attendance Logged"     value={attendancePct === null ? "—" : `${attendancePct}%`} delta="All sessions to date" trend="up" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 bg-card/60">
            <CardHeader><CardTitle className="text-base">My Upcoming Resource Bookings</CardTitle></CardHeader>
            <CardContent className="pt-0">
              {loadingBookings ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
              ) : upcoming.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No upcoming bookings.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.map((b) => (
                    <li key={b._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{b.resource?.name ?? "—"}</p>
                        <p className="text-[11px] text-muted-foreground">{b.purpose ?? "—"} · {fmtWindow(b)}</p>
                      </div>
                      <Badge variant={b.status === "pending" ? "outline" : "secondary"}
                        className={b.status === "pending" ? "border-warning/40 text-warning" : "border-success/40 text-success"}>
                        {b.status === "pending" ? "Pending" : "Confirmed"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Open Master Schedule", href: "/app/schedule" },
                { label: "Log today's attendance", href: "/app/logbook" },
                { label: "Update marks", href: "/app/results" },
                { label: "Request a resource", href: "/app/schedule" },
              ].map(a => (
                <a key={a.label} href={a.href} className="block w-full text-left px-3 py-2.5 rounded-lg border border-border bg-background/40 hover:bg-accent text-sm">
                  {a.label}
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------------- STUDENT ---------------- */

function StudentDashboard() {
  const { user } = useRole();
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "mine"], queryFn: () => getBookings(),
  });
  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ["results", "mine"], queryFn: getResults,
  });
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ["attendance", "mine"], queryFn: getAttendance,
  });

  const activeBookings = bookings.filter(b => ["pending", "approved", "checked_out"].includes(b.status));
  const borrowedAssets = bookings.filter(b => b.status === "checked_out" && ["book", "equipment"].includes(b.resource?.type));
  const soonestDue = borrowedAssets
    .map(b => b.dueDate ? new Date(b.dueDate as string) : null)
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  let present = 0, total = 0;
  attendance.forEach((session: any) => {
    const mine = (session.records ?? []).find((r: any) => (r.student?._id ?? r.student) === user?._id);
    if (mine) { total += 1; if (mine.status === "present") present += 1; }
  });
  const attendancePct = total ? Math.round((present / total) * 100) : null;

  const avgScore = results.length
    ? Math.round(results.reduce((s: number, r: any) => s + (r.finalScore ?? 0), 0) / results.length)
    : null;

  // Per-course progress: join results (grade) with attendance (rate) by course id.
  const byCourse = new Map<string, { name: string; grade: number; present: number; total: number }>();
  results.forEach((r: any) => {
    const id = r.course?._id ?? r.course;
    const name = r.course?.title ? `${r.course.courseCode ?? ""} · ${r.course.title}`.replace(/^ · /, "") : "Course";
    byCourse.set(id, { name, grade: Math.round(r.finalScore ?? 0), present: 0, total: 0 });
  });
  attendance.forEach((session: any) => {
    const courseId = session.course?._id ?? session.course;
    const mine = (session.records ?? []).find((r: any) => (r.student?._id ?? r.student) === user?._id);
    if (!mine || !byCourse.has(courseId)) return;
    const entry = byCourse.get(courseId)!;
    entry.total += 1;
    if (mine.status === "present") entry.present += 1;
  });
  const courseProgress = Array.from(byCourse.values());

  const today = bookings
    .filter(b => (isToday(b.startTime as string | undefined) || isToday(b.dueDate as string | undefined)) &&
      ["pending", "approved", "checked_out"].includes(b.status))
    .slice(0, 5);

  return (
    <>
      <AppHeader title="My Campus" subtitle="Personal bookings, borrowed assets and academic progress" />
      <div className="px-5 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={CalendarClock} label="My Active Bookings" value={loadingBookings ? "…" : String(activeBookings.length)} delta="Pending, approved or out" />
          <MetricCard icon={Boxes}         label="Borrowed Assets"     value={loadingBookings ? "…" : String(borrowedAssets.length)}
            delta={soonestDue ? `Next due ${soonestDue.toLocaleDateString()}` : "None due"} tone={soonestDue ? "warning" : undefined} />
          <MetricCard icon={CheckCircle2}  label="Attendance Rate"     value={attendancePct === null ? "—" : `${attendancePct}%`} delta="All sessions to date" trend="up" />
          <MetricCard icon={GraduationCap} label="Average Score"       value={avgScore === null ? "—" : `${avgScore}%`} delta="Across graded courses" trend="up" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base">Course Progress</CardTitle>
              <p className="text-xs text-muted-foreground">Continuous assessment & attendance per course</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingResults || loadingAttendance ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
              ) : courseProgress.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">No graded courses yet.</p>
              ) : courseProgress.map(c => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium">{c.name}</p>
                    <span className="text-xs text-muted-foreground">
                      grade {c.grade}% {c.total > 0 ? `· attendance ${Math.round((c.present / c.total) * 100)}%` : ""}
                    </span>
                  </div>
                  <Progress value={c.grade} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/60">
            <CardHeader><CardTitle className="text-base">Today</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loadingBookings ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Loading…</p>
              ) : today.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Nothing scheduled today.</p>
              ) : today.map(b => (
                <div key={b._id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
                  <div className="text-xs font-mono text-primary w-12">
                    {b.startTime ? new Date(b.startTime as string).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "Due"}
                  </div>
                  <div className="text-sm">{b.resource?.name ?? "—"}{b.purpose ? ` · ${b.purpose}` : ""}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
