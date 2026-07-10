import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bus, MapPin, Clock, Users, Fuel, Wrench, Plus, Trash2, Ticket,
  TrendingUp, AlertCircle, CheckCircle2, XCircle, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";

export const Route = createFileRoute("/app/bus")({
  head: () => ({ meta: [{ title: "Bus & Transport — CRMS" }] }),
  component: BusPage,
});

/* ---------------- Mock data ---------------- */

type BusStatus = "active" | "under_maintenance" | "inactive";
interface FleetBus {
  id: string; plateNumber: string; model: string; capacity: number; status: BusStatus;
}
interface RouteRow {
  id: string; name: string; origin: string; destination: string;
  departureTime: string; estimatedArrival: string; distanceKm: number;
  busId: string; days: string[]; isActive: boolean;
}
interface Reservation {
  id: string; routeId: string; passenger: string; matricule: string;
  travelDate: string; seatNumber: number; status: "confirmed" | "cancelled";
}
interface MileageLog {
  id: string; busId: string; routeId: string; driver: string;
  date: string; startOdo: number; endOdo: number;
  fuelLitres: number; pricePerLitre: number;
  verification: "pending" | "verified" | "rejected";
}
interface MaintenanceLog {
  id: string; busId: string; date: string; type: "Service" | "Repair" | "Inspection" | "Tyres" | "Bodywork";
  description: string; costXAF: number; nextDue: string; status: "scheduled" | "in_progress" | "completed";
}

const INITIAL_FLEET: FleetBus[] = [
  { id: "B-01", plateNumber: "LT-2871-AA", model: "Toyota Coaster",        capacity: 30, status: "active" },
  { id: "B-02", plateNumber: "LT-9134-BC", model: "Mercedes Sprinter",     capacity: 22, status: "active" },
  { id: "B-03", plateNumber: "CE-4421-XD", model: "Hyundai County",        capacity: 35, status: "under_maintenance" },
  { id: "B-04", plateNumber: "LT-5089-MM", model: "Isuzu Journey",         capacity: 28, status: "active" },
  { id: "B-05", plateNumber: "CE-7720-LK", model: "King Long XMQ6900",     capacity: 45, status: "inactive" },
];

const INITIAL_ROUTES: RouteRow[] = [
  { id: "R-01", name: "Campus ↔ Bonabéri",  origin: "Main Gate",  destination: "Bonabéri Terminus", departureTime: "06:45", estimatedArrival: "07:35", distanceKm: 18, busId: "B-01", days: ["Mon","Tue","Wed","Thu","Fri"], isActive: true },
  { id: "R-02", name: "Campus ↔ Akwa",      origin: "Main Gate",  destination: "Akwa Roundabout",   departureTime: "07:15", estimatedArrival: "07:55", distanceKm: 12, busId: "B-02", days: ["Mon","Tue","Wed","Thu","Fri","Sat"], isActive: true },
  { id: "R-03", name: "Campus ↔ Bonapriso", origin: "Main Gate",  destination: "Bonapriso Plaza",   departureTime: "17:30", estimatedArrival: "18:10", distanceKm: 14, busId: "B-04", days: ["Mon","Tue","Wed","Thu","Fri"], isActive: true },
  { id: "R-04", name: "Campus ↔ Yassa",     origin: "Main Gate",  destination: "Yassa Junction",    departureTime: "18:00", estimatedArrival: "18:50", distanceKm: 21, busId: "B-01", days: ["Fri","Sat","Sun"], isActive: false },
];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: "RS-1041", routeId: "R-01", passenger: "Amira N. Kone",   matricule: "IUC-2024-STU-0421", travelDate: "2026-06-24", seatNumber: 7,  status: "confirmed" },
  { id: "RS-1042", routeId: "R-02", passenger: "Dr. Samuel Etoa", matricule: "IUC-FAC-0098",      travelDate: "2026-06-24", seatNumber: 3,  status: "confirmed" },
  { id: "RS-1043", routeId: "R-01", passenger: "Eric Nkomo",      matricule: "IUC-ITE-0031",      travelDate: "2026-06-25", seatNumber: 12, status: "cancelled" },
  { id: "RS-1044", routeId: "R-03", passenger: "Marie Owono",     matricule: "IUC-LIB-0012",      travelDate: "2026-06-25", seatNumber: 9,  status: "confirmed" },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: "MX-501", busId: "B-03", date: "2026-06-20", type: "Repair",      description: "Clutch overhaul",            costXAF: 245000, nextDue: "2026-12-20", status: "in_progress" },
  { id: "MX-502", busId: "B-01", date: "2026-06-18", type: "Service",     description: "10,000 km full service",     costXAF:  85000, nextDue: "2026-09-18", status: "completed" },
  { id: "MX-503", busId: "B-02", date: "2026-06-30", type: "Inspection",  description: "Quarterly safety inspection",costXAF:  18000, nextDue: "2026-09-30", status: "scheduled" },
  { id: "MX-504", busId: "B-04", date: "2026-06-12", type: "Tyres",       description: "Replace front tyres (×2)",   costXAF: 160000, nextDue: "2027-06-12", status: "completed" },
];

const INITIAL_MILEAGE: MileageLog[] = [
  { id: "M-220", busId: "B-01", routeId: "R-01", driver: "K. Mbida",  date: "2026-06-22", startOdo: 84120, endOdo: 84176, fuelLitres: 18.4, pricePerLitre: 760, verification: "verified" },
  { id: "M-221", busId: "B-02", routeId: "R-02", driver: "T. Onana",  date: "2026-06-22", startOdo: 61209, endOdo: 61245, fuelLitres: 12.1, pricePerLitre: 760, verification: "pending"  },
  { id: "M-222", busId: "B-04", routeId: "R-03", driver: "P. Eteki",  date: "2026-06-22", startOdo: 39988, endOdo: 40036, fuelLitres: 16.2, pricePerLitre: 770, verification: "verified" },
  { id: "M-223", busId: "B-01", routeId: "R-04", driver: "K. Mbida",  date: "2026-06-21", startOdo: 84038, endOdo: 84120, fuelLitres: 22.7, pricePerLitre: 755, verification: "rejected" },
];

const STATUS_TONE: Record<BusStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  under_maintenance: "bg-warning/15 text-warning border-warning/30",
  inactive: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABEL: Record<BusStatus, string> = {
  active: "Active", under_maintenance: "Maintenance", inactive: "Inactive",
};

/* ---------------- Page ---------------- */

function BusPage() {
  const { user, can } = useRole();
  if (!can("nav:bus")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const canManage = can("action:manageBus");
  const canReserve = can("action:reserveBus");

  const [fleet, setFleet] = useState<FleetBus[]>(INITIAL_FLEET);
  const [routes, setRoutes] = useState<RouteRow[]>(INITIAL_ROUTES);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [mileage, setMileage] = useState<MileageLog[]>(INITIAL_MILEAGE);
  const [maintenance, setMaintenance] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE);

  const metrics = useMemo(() => {
    const activeBuses = fleet.filter(b => b.status === "active").length;
    const totalSeats = fleet.reduce((a, b) => a + b.capacity, 0);
    const todayConfirmed = reservations.filter(r => r.status === "confirmed").length;
    const occupancyPct = totalSeats ? Math.round((todayConfirmed / totalSeats) * 100) : 0;
    const totalKm = mileage.reduce((a, m) => a + (m.endOdo - m.startOdo), 0);
    const totalCost = mileage.reduce((a, m) => a + m.fuelLitres * m.pricePerLitre, 0);
    return { activeBuses, totalSeats, todayConfirmed, occupancyPct, totalKm, totalCost };
  }, [fleet, reservations, mileage]);

  const defaultTab = canManage ? "fleet" : "availability";

  return (
    <>
      <AppHeader
        title="Bus & Transport Operations"
        subtitle={canManage ? "Fleet, routes, reservations & mileage telemetry" : "Browse routes and reserve your seat"}
      />

      <div className="p-5 lg:p-8 space-y-6">
        {/* Metrics — fuel cost only visible to logistics manager / admin */}
        <div className={`grid grid-cols-2 ${canManage ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
          <MetricCard icon={Bus}   label="Active buses"     value={`${metrics.activeBuses} / ${fleet.length}`} />
          <MetricCard icon={Users} label="Seats deployed"   value={`${metrics.totalSeats}`} hint={`${metrics.occupancyPct}% confirmed today`} />
          <MetricCard icon={Gauge} label="Fleet km logged"  value={`${metrics.totalKm.toLocaleString()} km`} />
          {canManage && <MetricCard icon={Fuel} label="Fuel logged (litres)" value={`${mileage.reduce((a,m)=>a+m.fuelLitres,0).toFixed(1)} L`} />}
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-5">
          <TabsList className="bg-card/60 border border-border">
            {canManage && <TabsTrigger value="fleet">Fleet</TabsTrigger>}
            {canManage && <TabsTrigger value="routes">Routes</TabsTrigger>}
            <TabsTrigger value="availability">Seat Availability</TabsTrigger>
            <TabsTrigger value="reservations">{canManage ? "All Reservations" : "My Reservations"}</TabsTrigger>
            {canManage && <TabsTrigger value="mileage">Mileage & Fuel</TabsTrigger>}
            {canManage && <TabsTrigger value="maintenance">Maintenance</TabsTrigger>}
            {canManage && <TabsTrigger value="drivers">Drivers</TabsTrigger>}
            {canManage && <TabsTrigger value="analytics">Trip Analytics</TabsTrigger>}
          </TabsList>

          {/* FLEET */}
          {canManage && (
            <TabsContent value="fleet">
              <FleetPanel fleet={fleet} setFleet={setFleet} />
            </TabsContent>
          )}

          {/* ROUTES */}
          {canManage && (
            <TabsContent value="routes">
              <RoutesPanel routes={routes} setRoutes={setRoutes} fleet={fleet} />
            </TabsContent>
          )}

          {/* AVAILABILITY */}
          <TabsContent value="availability">
            <AvailabilityPanel
              routes={routes}
              fleet={fleet}
              reservations={reservations}
              canReserve={canReserve}
              onReserve={(r) => setReservations(prev => [r, ...prev])}
              currentUser={user}
            />
          </TabsContent>

          {/* RESERVATIONS */}
          <TabsContent value="reservations">
            <ReservationsPanel
              reservations={reservations}
              routes={routes}
              canManage={canManage}
              currentMatricule={user.matricule}
              onCancel={(id) => {
                setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
                toast.success(`Reservation ${id} cancelled`);
              }}
            />
          </TabsContent>

          {/* MILEAGE */}
          {canManage && (
            <TabsContent value="mileage">
              <MileagePanel mileage={mileage} setMileage={setMileage} fleet={fleet} routes={routes} />
            </TabsContent>
          )}

          {/* MAINTENANCE */}
          {canManage && (
            <TabsContent value="maintenance">
              <MaintenancePanel maintenance={maintenance} setMaintenance={setMaintenance} fleet={fleet} />
            </TabsContent>
          )}

          {/* DRIVERS */}
          {canManage && (
            <TabsContent value="drivers">
              <DriversPanel fleet={fleet} />
            </TabsContent>
          )}



          {/* ANALYTICS */}
          {canManage && (
            <TabsContent value="analytics">
              <AnalyticsPanel mileage={mileage} reservations={reservations} routes={routes} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}

/* ---------------- Sub-components ---------------- */

function MetricCard({ icon: Icon, label, value, hint }: { icon: typeof Bus; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold leading-tight">{value}</p>
            {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FleetPanel({ fleet, setFleet }: { fleet: FleetBus[]; setFleet: React.Dispatch<React.SetStateAction<FleetBus[]>> }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ plateNumber: "", model: "", capacity: 30, status: "active" as BusStatus });

  const submit = () => {
    if (!form.plateNumber || !form.model) return toast.error("Plate number and model are required");
    const id = `B-${String(fleet.length + 1).padStart(2, "0")}`;
    setFleet(prev => [{ id, ...form }, ...prev]);
    toast.success(`Bus ${form.plateNumber} added to fleet`);
    setOpen(false); setForm({ plateNumber: "", model: "", capacity: 30, status: "active" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Fleet Registry</CardTitle>
          <p className="text-xs text-muted-foreground">All buses tracked by plate, capacity and operating status</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add bus</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register a new bus</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5"><Label>Plate number</Label><Input value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} placeholder="LT-1234-AB" /></div>
              <div className="grid gap-1.5"><Label>Model</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Toyota Coaster" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
                <div className="grid gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: BusStatus) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="under_maintenance">Under maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Register bus</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead><TableHead>Plate</TableHead><TableHead>Model</TableHead>
              <TableHead className="text-right">Capacity</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fleet.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">{b.id}</TableCell>
                <TableCell className="font-medium">{b.plateNumber}</TableCell>
                <TableCell>{b.model}</TableCell>
                <TableCell className="text-right">{b.capacity}</TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v: BusStatus) => {
                    setFleet(prev => prev.map(x => x.id === b.id ? { ...x, status: v } : x));
                    toast.success(`${b.plateNumber} → ${STATUS_LABEL[v]}`);
                  }}>
                    <SelectTrigger className={`h-7 w-[160px] text-xs ${STATUS_TONE[b.status]}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="under_maintenance">Under maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                    onClick={() => { setFleet(prev => prev.filter(x => x.id !== b.id)); toast.success(`${b.plateNumber} removed`); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RoutesPanel({ routes, setRoutes, fleet }: { routes: RouteRow[]; setRoutes: React.Dispatch<React.SetStateAction<RouteRow[]>>; fleet: FleetBus[] }) {
  const busLabel = (id: string) => fleet.find(b => b.id === id)?.plateNumber ?? id;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Routes</CardTitle>
        <p className="text-xs text-muted-foreground">Departure schedules and assigned vehicles</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead><TableHead>Origin → Destination</TableHead>
              <TableHead>Depart</TableHead><TableHead>ETA</TableHead>
              <TableHead className="text-right">Km</TableHead>
              <TableHead>Days</TableHead><TableHead>Bus</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3 w-3" />{r.origin}</span> → {r.destination}</TableCell>
                <TableCell className="font-mono text-xs"><Clock className="inline h-3 w-3 mr-1" />{r.departureTime}</TableCell>
                <TableCell className="font-mono text-xs">{r.estimatedArrival}</TableCell>
                <TableCell className="text-right">{r.distanceKm}</TableCell>
                <TableCell className="text-xs">{r.days.join(" · ")}</TableCell>
                <TableCell className="font-mono text-xs">{busLabel(r.busId)}</TableCell>
                <TableCell>
                  <button onClick={() => {
                    setRoutes(prev => prev.map(x => x.id === r.id ? { ...x, isActive: !x.isActive } : x));
                    toast.success(`${r.name} ${r.isActive ? "deactivated" : "activated"}`);
                  }}>
                    <Badge variant="outline" className={r.isActive ? "border-success/40 text-success" : "border-border text-muted-foreground"}>
                      {r.isActive ? "Operating" : "Paused"}
                    </Badge>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AvailabilityPanel({
  routes, fleet, reservations, canReserve, onReserve, currentUser,
}: {
  routes: RouteRow[]; fleet: FleetBus[]; reservations: Reservation[];
  canReserve: boolean; onReserve: (r: Reservation) => void;
  currentUser: { name: string; matricule: string };
}) {
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [travelDate, setTravelDate] = useState(new Date().toISOString().slice(0, 10));
  const route = routes.find(r => r.id === routeId);
  const bus = fleet.find(b => b.id === route?.busId);
  const capacity = bus?.capacity ?? 0;

  const taken = useMemo(() => {
    return new Set(
      reservations
        .filter(r => r.routeId === routeId && r.travelDate === travelDate && r.status === "confirmed")
        .map(r => r.seatNumber)
    );
  }, [reservations, routeId, travelDate]);

  const reserve = (seat: number) => {
    if (!canReserve || !route) return;
    const id = `RS-${Math.floor(1000 + Math.random() * 9000)}`;
    onReserve({
      id, routeId, passenger: currentUser.name, matricule: currentUser.matricule,
      travelDate, seatNumber: seat, status: "confirmed",
    });
    toast.success(`Seat ${seat} reserved on ${route.name} · ${travelDate}`);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[320px,1fr]">
      <Card>
        <CardHeader><CardTitle className="text-base">Trip selector</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1.5">
            <Label>Route</Label>
            <Select value={routeId} onValueChange={setRouteId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name} — {r.departureTime}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Travel date</Label>
            <Input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
          </div>
          {route && bus && (
            <div className="rounded-lg border border-border bg-card/40 p-3 text-xs space-y-1.5">
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Bus</span><span className="font-mono">{bus.plateNumber}</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Capacity</span><span>{capacity} seats</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Available</span><span className="text-success font-medium">{capacity - taken.size} free</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">Confirmed</span><span>{taken.size}</span></p>
            </div>
          )}
          {!canReserve && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Read-only view. Reservation requires a passenger account.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Seat map</CardTitle>
            <p className="text-xs text-muted-foreground">{route?.name} · {travelDate}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success/30 border border-success/50" />Free</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500/30 border border-rose-500/50" />Booked</span>
          </div>
        </CardHeader>
        <CardContent>
          {capacity === 0 ? (
            <p className="text-sm text-muted-foreground">Select a route to view its seat map.</p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: capacity }, (_, i) => i + 1).map(seat => {
                const isTaken = taken.has(seat);
                return (
                  <button
                    key={seat}
                    disabled={isTaken || !canReserve}
                    onClick={() => reserve(seat)}
                    className={`aspect-square rounded-md border text-[11px] font-medium transition-colors ${
                      isTaken
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-300 cursor-not-allowed"
                        : canReserve
                          ? "bg-success/10 border-success/30 text-success hover:bg-success/20"
                          : "bg-success/5 border-success/20 text-success/70 cursor-default"
                    }`}
                  >{seat}</button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReservationsPanel({
  reservations, routes, canManage, currentMatricule, onCancel,
}: {
  reservations: Reservation[]; routes: RouteRow[]; canManage: boolean;
  currentMatricule: string; onCancel: (id: string) => void;
}) {
  const visible = canManage ? reservations : reservations.filter(r => r.matricule === currentMatricule);
  const routeName = (id: string) => routes.find(r => r.id === id)?.name ?? id;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{canManage ? "All reservations" : "My reservations"}</CardTitle>
        <p className="text-xs text-muted-foreground">{visible.length} record(s)</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead><TableHead>Route</TableHead>
              {canManage && <TableHead>Passenger</TableHead>}
              <TableHead>Travel date</TableHead><TableHead className="text-right">Seat</TableHead>
              <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow><TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground py-6">No reservations yet.</TableCell></TableRow>
            )}
            {visible.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs"><Ticket className="inline h-3 w-3 mr-1" />{r.id}</TableCell>
                <TableCell>{routeName(r.routeId)}</TableCell>
                {canManage && <TableCell><p className="text-sm">{r.passenger}</p><p className="text-[10px] text-muted-foreground font-mono">{r.matricule}</p></TableCell>}
                <TableCell className="font-mono text-xs">{r.travelDate}</TableCell>
                <TableCell className="text-right">{r.seatNumber}</TableCell>
                <TableCell>
                  {r.status === "confirmed"
                    ? <Badge className="bg-success/15 text-success border-success/30">Confirmed</Badge>
                    : <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  {r.status === "confirmed" && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onCancel(r.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function MileagePanel({
  mileage, setMileage, fleet, routes,
}: {
  mileage: MileageLog[]; setMileage: React.Dispatch<React.SetStateAction<MileageLog[]>>;
  fleet: FleetBus[]; routes: RouteRow[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    busId: fleet[0]?.id ?? "", routeId: routes[0]?.id ?? "", driver: "",
    date: new Date().toISOString().slice(0, 10),
    startOdo: 0, endOdo: 0, fuelLitres: 0, pricePerLitre: 760,
  });

  const busPlate = (id: string) => fleet.find(b => b.id === id)?.plateNumber ?? id;
  const routeName = (id: string) => routes.find(r => r.id === id)?.name ?? id;

  const submit = () => {
    if (form.endOdo <= form.startOdo) return toast.error("End odometer must exceed start");
    if (!form.driver) return toast.error("Driver name required");
    const id = `M-${Math.floor(200 + Math.random() * 800)}`;
    setMileage(prev => [{ ...form, id, verification: "pending" }, ...prev]);
    toast.success(`Fuel log ${id} submitted for verification`);
    setOpen(false);
  };

  const verify = (id: string, status: MileageLog["verification"]) => {
    setMileage(prev => prev.map(m => m.id === id ? { ...m, verification: status } : m));
    toast.success(`Log ${id} → ${status}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Fuel className="h-4 w-4 text-primary" /> Mileage & Fuel Ledger</CardTitle>
          <p className="text-xs text-muted-foreground">Auto-computed distance · cost · consumption per trip</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New fuel log</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record fuel & odometer</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Bus</Label>
                  <Select value={form.busId} onValueChange={(v) => setForm({ ...form, busId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fleet.map(b => <SelectItem key={b.id} value={b.id}>{b.plateNumber}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Route</Label>
                  <Select value={form.routeId} onValueChange={(v) => setForm({ ...form, routeId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Driver</Label><Input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Start odo (km)</Label><Input type="number" value={form.startOdo} onChange={(e) => setForm({ ...form, startOdo: Number(e.target.value) })} /></div>
                <div className="grid gap-1.5"><Label>End odo (km)</Label><Input type="number" value={form.endOdo} onChange={(e) => setForm({ ...form, endOdo: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Fuel (litres)</Label><Input type="number" step="0.1" value={form.fuelLitres} onChange={(e) => setForm({ ...form, fuelLitres: Number(e.target.value) })} /></div>
                <div className="grid gap-1.5"><Label>Price / litre (XAF)</Label><Input type="number" value={form.pricePerLitre} onChange={(e) => setForm({ ...form, pricePerLitre: Number(e.target.value) })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Submit log</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log</TableHead><TableHead>Date</TableHead><TableHead>Bus</TableHead><TableHead>Route</TableHead><TableHead>Driver</TableHead>
              <TableHead className="text-right">Distance</TableHead><TableHead className="text-right">L / 100km</TableHead><TableHead className="text-right">Cost</TableHead>
              <TableHead>Verification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mileage.map(m => {
              const dist = m.endOdo - m.startOdo;
              const cons = dist > 0 ? (m.fuelLitres / dist) * 100 : 0;
              const cost = m.fuelLitres * m.pricePerLitre;
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-mono text-xs">{m.date}</TableCell>
                  <TableCell className="font-mono text-xs">{busPlate(m.busId)}</TableCell>
                  <TableCell className="text-xs">{routeName(m.routeId)}</TableCell>
                  <TableCell className="text-xs">{m.driver}</TableCell>
                  <TableCell className="text-right">{dist.toFixed(1)} km</TableCell>
                  <TableCell className="text-right">{cons.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{Math.round(cost).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={
                        m.verification === "verified" ? "border-success/40 text-success"
                        : m.verification === "rejected" ? "border-destructive/40 text-destructive"
                        : "border-warning/40 text-warning"
                      }>
                        {m.verification}
                      </Badge>
                      {m.verification === "pending" && (
                        <>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-success" onClick={() => verify(m.id, "verified")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => verify(m.id, "rejected")}><XCircle className="h-3.5 w-3.5" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AnalyticsPanel({ mileage, reservations, routes }: { mileage: MileageLog[]; reservations: Reservation[]; routes: RouteRow[] }) {
  const occupancyByRoute = routes.map(r => {
    const confirmed = reservations.filter(x => x.routeId === r.id && x.status === "confirmed").length;
    return { route: r.name.replace("Campus ↔ ", ""), reservations: confirmed };
  });
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const consumptionTrend = days.map((d, i) => ({
    day: d,
    consumption: +(8 + Math.abs(Math.sin(i)) * 6).toFixed(1),
    cost: Math.round(8000 + Math.abs(Math.cos(i)) * 4000),
  }));
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Route utilization</CardTitle></CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={occupancyByRoute}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="route" stroke="oklch(0.7 0 0)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0 0)" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="reservations" fill="#6366F1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Fuel consumption trend</CardTitle></CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="day" stroke="oklch(0.7 0 0)" fontSize={11} />
              <YAxis stroke="oklch(0.7 0 0)" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="consumption" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="L / 100km" />
              <Line type="monotone" dataKey="cost"        stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="XAF cost" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Pending verifications</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {mileage.filter(m => m.verification === "pending").length} fuel log(s) awaiting manager review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenancePanel({
  maintenance, setMaintenance, fleet,
}: {
  maintenance: MaintenanceLog[];
  setMaintenance: React.Dispatch<React.SetStateAction<MaintenanceLog[]>>;
  fleet: FleetBus[];
}) {
  const [open, setOpen] = useState(false);
  const empty = {
    busId: fleet[0]?.id ?? "", date: new Date().toISOString().slice(0, 10),
    type: "Service" as MaintenanceLog["type"], description: "", costXAF: 0,
    nextDue: "", status: "scheduled" as MaintenanceLog["status"],
  };
  const [form, setForm] = useState(empty);

  const plate = (id: string) => fleet.find(b => b.id === id)?.plateNumber ?? id;

  const submit = () => {
    if (!form.description) return toast.error("Description required");
    const id = `MX-${Math.floor(500 + Math.random() * 500)}`;
    setMaintenance(prev => [{ id, ...form }, ...prev]);
    toast.success(`Maintenance entry ${id} recorded`);
    setOpen(false); setForm(empty);
  };

  const totalCost = maintenance.reduce((a, m) => a + m.costXAF, 0);
  const open_ = maintenance.filter(m => m.status !== "completed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard icon={Wrench} label="Open maintenance"     value={`${open_}`} />
        <MetricCard icon={Bus}    label="Buses on bench today" value={`${fleet.filter(b => b.status === "under_maintenance").length}`} />
        <MetricCard icon={Fuel}   label="YTD maintenance cost" value={`${totalCost.toLocaleString()} XAF`} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Maintenance ledger</CardTitle>
            <p className="text-xs text-muted-foreground">Service · repair · inspection history per bus</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> New entry</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log maintenance activity</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="grid gap-1.5"><Label>Bus</Label>
                  <Select value={form.busId} onValueChange={(v) => setForm({ ...form, busId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{fleet.map(b => <SelectItem key={b.id} value={b.id}>{b.plateNumber}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: MaintenanceLog["type"]) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Service","Repair","Inspection","Tyres","Bodywork"] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: MaintenanceLog["status"]) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5 col-span-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Clutch overhaul, brake pads…" /></div>
                <div className="grid gap-1.5"><Label>Cost (XAF)</Label><Input type="number" value={form.costXAF} onChange={(e) => setForm({ ...form, costXAF: Number(e.target.value) })} /></div>
                <div className="grid gap-1.5"><Label>Next due</Label><Input type="date" value={form.nextDue} onChange={(e) => setForm({ ...form, nextDue: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit}>Save entry</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead><TableHead>Date</TableHead><TableHead>Bus</TableHead>
                <TableHead>Type</TableHead><TableHead>Description</TableHead>
                <TableHead className="text-right">Cost</TableHead><TableHead>Next due</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenance.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-mono text-xs">{m.date}</TableCell>
                  <TableCell className="font-mono text-xs">{plate(m.busId)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{m.type}</Badge></TableCell>
                  <TableCell className="text-sm max-w-[280px] truncate" title={m.description}>{m.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.costXAF.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{m.nextDue || "—"}</TableCell>
                  <TableCell>
                    <Select value={m.status} onValueChange={(v: MaintenanceLog["status"]) => {
                      setMaintenance(prev => prev.map(x => x.id === m.id ? { ...x, status: v } : x));
                      toast.success(`${m.id} → ${v}`);
                    }}>
                      <SelectTrigger className={`h-7 w-[140px] text-xs ${
                        m.status === "completed" ? "border-success/40 text-success"
                        : m.status === "in_progress" ? "border-warning/40 text-warning"
                        : "border-primary/40 text-primary"
                      }`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {maintenance.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No maintenance recorded.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Drivers ---------------- */

interface DriverShift {
  id: string;
  driver: string;
  busId: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  odoStart: number;
  odoEnd: number;
  fuelLitres: number;
}

const SEED_DRIVERS: DriverShift[] = [
  { id: "DR-1001", driver: "K. Mbida", busId: "B-01", date: "2026-06-22", departureTime: "06:30", arrivalTime: "18:10", odoStart: 84120, odoEnd: 84324, fuelLitres: 24.5 },
  { id: "DR-1002", driver: "T. Onana", busId: "B-02", date: "2026-06-22", departureTime: "07:00", arrivalTime: "18:30", odoStart: 61209, odoEnd: 61362, fuelLitres: 18.7 },
  { id: "DR-1003", driver: "P. Eteki", busId: "B-04", date: "2026-06-22", departureTime: "06:45", arrivalTime: "19:00", odoStart: 39988, odoEnd: 40158, fuelLitres: 22.2 },
];

function DriversPanel({ fleet }: { fleet: FleetBus[] }) {
  const [shifts, setShifts] = useState<DriverShift[]>(SEED_DRIVERS);
  const [open, setOpen] = useState(false);
  const empty: Omit<DriverShift, "id"> = {
    driver: "", busId: fleet[0]?.id ?? "", date: new Date().toISOString().slice(0, 10),
    departureTime: "06:30", arrivalTime: "18:00", odoStart: 0, odoEnd: 0, fuelLitres: 0,
  };
  const [form, setForm] = useState(empty);
  const plate = (id: string) => fleet.find(b => b.id === id)?.plateNumber ?? id;
  const submit = () => {
    if (!form.driver) return toast.error("Driver name required");
    if (form.odoEnd < form.odoStart) return toast.error("End odo must be ≥ start");
    const id = `DR-${1000 + shifts.length + 1}`;
    setShifts(prev => [{ id, ...form }, ...prev]);
    toast.success(`Driver shift ${id} logged`);
    setOpen(false); setForm(empty);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Driver shifts</CardTitle>
          <p className="text-xs text-muted-foreground">Bus assignment · departure / arrival · odometer before & after · consumption</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Log shift</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log a driver shift</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="grid gap-1.5"><Label>Driver</Label><Input value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Bus</Label>
                <Select value={form.busId} onValueChange={v => setForm({ ...form, busId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{fleet.map(b => <SelectItem key={b.id} value={b.id}>{b.plateNumber}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Fuel (L)</Label><Input type="number" step="0.1" value={form.fuelLitres} onChange={e => setForm({ ...form, fuelLitres: Number(e.target.value) })} /></div>
              <div className="grid gap-1.5"><Label>Departure time</Label><Input type="time" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Arrival time</Label><Input type="time" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Odo start (km)</Label><Input type="number" value={form.odoStart} onChange={e => setForm({ ...form, odoStart: Number(e.target.value) })} /></div>
              <div className="grid gap-1.5"><Label>Odo end (km)</Label><Input type="number" value={form.odoEnd} onChange={e => setForm({ ...form, odoEnd: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button onClick={submit}>Save shift</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shift</TableHead><TableHead>Date</TableHead><TableHead>Driver</TableHead><TableHead>Bus</TableHead>
              <TableHead>Departure</TableHead><TableHead>Arrival</TableHead>
              <TableHead className="text-right">Odo start</TableHead><TableHead className="text-right">Odo end</TableHead>
              <TableHead className="text-right">Distance</TableHead><TableHead className="text-right">Fuel (L)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.id}</TableCell>
                <TableCell className="font-mono text-xs">{s.date}</TableCell>
                <TableCell className="font-medium">{s.driver}</TableCell>
                <TableCell className="font-mono text-xs">{plate(s.busId)}</TableCell>
                <TableCell className="font-mono text-xs">{s.departureTime}</TableCell>
                <TableCell className="font-mono text-xs">{s.arrivalTime}</TableCell>
                <TableCell className="text-right tabular-nums">{s.odoStart.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{s.odoEnd.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{(s.odoEnd - s.odoStart).toFixed(0)} km</TableCell>
                <TableCell className="text-right tabular-nums">{s.fuelLitres.toFixed(1)}</TableCell>
              </TableRow>
            ))}
            {shifts.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-6">No shifts recorded.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
