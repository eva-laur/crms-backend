import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Laptop, Search, Plus, Trash2, Projector, Camera, Mic, Tv, Cable, Tablet, Headphones, Wrench, PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ApiError } from "@/lib/api/client";
import { getResources, createResource, deleteResource, setResourceMaintenance, clearResourceMaintenance } from "@/lib/api/resources";
import { getBookings, createBooking, updateBookingStatus, checkOutBooking, returnBooking } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/it-equipment")({
  head: () => ({ meta: [{ title: "IT Equipment — CRMS" }] }),
  component: ITPage,
});

type Category = "Projector" | "Camera" | "Laptop" | "Microphone" | "Display" | "Tablet" | "Headset" | "Cabling";
type Condition = "Excellent" | "Good" | "Worn" | "Faulty";
type DisplayStatus = "available" | "checked_out" | "maintenance";

const CAT_ICON: Record<Category, typeof Laptop> = {
  Projector: Projector, Camera: Camera, Laptop: Laptop, Microphone: Mic,
  Display: Tv, Tablet: Tablet, Headset: Headphones, Cabling: Cable,
};
const CAT_COLOR: Record<Category, string> = {
  Projector: "oklch(0.62 0.16 155)",
  Camera: "oklch(0.82 0.16 88)",
  Laptop: "oklch(0.55 0.14 200)",
  Microphone: "oklch(0.68 0.18 30)",
  Display: "oklch(0.62 0.17 280)",
  Tablet: "oklch(0.72 0.14 160)",
  Headset: "oklch(0.55 0.10 100)",
  Cabling: "oklch(0.50 0.05 240)",
};

const CATEGORIES: Category[] = ["Projector", "Camera", "Laptop", "Microphone", "Display", "Tablet", "Headset", "Cabling"];
const CONDITIONS: Condition[] = ["Excellent", "Good", "Worn", "Faulty"];

function dueIso(days: number) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }

function ITPage() {
  const { user, can } = useRole();
  if (!can("nav:itequipment")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const canManage = can("action:manageIT");
  const canDelete = user.role === "admin"; // resources:delete is admin-only on the backend
  const queryClient = useQueryClient();

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["resources", "equipment"], queryFn: () => getResources({ type: "equipment" }),
  });
  // Unfiltered by status (self-scoped automatically for non-managers) so both
  // the requests queue and the checkout desk read from one source of truth.
  const { data: allBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["bookings", "equipment", "all"], queryFn: () => getBookings({ resourceType: "equipment" }),
  });
  const checkouts = (allBookings as any[]).filter(b => b.status === "checked_out");
  const requests  = (allBookings as any[]).filter(b => ["pending", "approved", "rejected"].includes(b.status));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["resources", "equipment"] });
    queryClient.invalidateQueries({ queryKey: ["bookings", "equipment"] });
  };

  const displayStatus = (it: any): DisplayStatus => {
    if (it.status === "under_maintenance") return "maintenance";
    if (checkouts.some(c => (c.resource?._id ?? c.resource) === it._id)) return "checked_out";
    return "available";
  };

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [status, setStatus] = useState<DisplayStatus | "all">("all");

  const filtered = useMemo(() => items.filter((it: any) => {
    if (cat !== "all" && it.category !== cat) return false;
    if (status !== "all" && displayStatus(it) !== status) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return `${it.assetTag ?? ""} ${it.name} ${it.brand ?? ""} ${it.category ?? ""} ${it.location ?? ""}`.toLowerCase().includes(needle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items, q, cat, status, checkouts]);

  const metrics = useMemo(() => ({
    total: items.reduce((a: number, i: any) => a + (i.quantity ?? 0), 0),
    available: items.filter((i: any) => displayStatus(i) === "available").reduce((a: number, i: any) => a + (i.quantity ?? 0), 0),
    out: checkouts.length,
    mx: items.filter((i: any) => i.status === "under_maintenance").length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items, checkouts, requests]);

  // Usage pie — counts current checkouts per category, falls back to
  // per-category checked-out items if there are no active checkouts to show.
  const usageData = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const c of checkouts) {
      const cat = c.resource?.category;
      if (!cat) continue;
      acc[cat] = (acc[cat] ?? 0) + 1;
    }
    if (Object.keys(acc).length === 0) {
      for (const it of items as any[]) if (displayStatus(it) === "checked_out") acc[it.category] = (acc[it.category] ?? 0) + 1;
    }
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, checkouts]);

  const empty = { assetTag: "", name: "", category: "Projector" as Category, brand: "", condition: "Excellent" as Condition, location: "", quantity: 1 };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const addItem = async () => {
    if (!form.assetTag || !form.name) { toast.error("Asset tag and name required"); return; }
    setSaving(true);
    try {
      await createResource({ name: form.name, assetTag: form.assetTag, type: "equipment", category: form.category, brand: form.brand, condition: form.condition, location: form.location, quantity: form.quantity });
      toast.success(`${form.assetTag} added (${form.quantity} unit${form.quantity > 1 ? "s" : ""})`);
      setForm(empty); setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  const [requestingId, setRequestingId] = useState<string | null>(null);
  const requestItem = async (it: any) => {
    setRequestingId(it._id);
    try {
      await createBooking({ resource: it._id, dueDate: dueIso(3), purpose: "User request" });
      toast.success(`Request submitted for ${it.assetTag ?? it.name}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to submit request");
    } finally {
      setRequestingId(null);
    }
  };

  const [decidingId, setDecidingId] = useState<string | null>(null);
  const decide = async (r: any, decision: "approved" | "rejected") => {
    setDecidingId(r._id);
    try {
      await updateBookingStatus(r._id, decision);
      if (decision === "approved") await checkOutBooking(r._id); // approval issues the checkout immediately
      toast.success(`Request ${decision}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update request");
    } finally {
      setDecidingId(null);
    }
  };

  const [returningId, setReturningId] = useState<string | null>(null);
  const checkin = async (c: any) => {
    setReturningId(c._id);
    try {
      await returnBooking(c._id);
      toast.success(`Returned · ${c.resource?.assetTag ?? c.resource?.name ?? "item"}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Return failed");
    } finally {
      setReturningId(null);
    }
  };

  const setItemStatus = async (it: any, next: "available" | "maintenance") => {
    try {
      if (next === "maintenance") {
        const note = window.prompt(`Maintenance note for ${it.assetTag ?? it.name}:`, "Under maintenance");
        if (note === null) return; // cancelled
        await setResourceMaintenance(it._id, note);
      } else {
        await clearResourceMaintenance(it._id);
      }
      toast.success(`${it.assetTag ?? it.name} → ${next === "maintenance" ? "under maintenance" : "available"}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update status");
    }
  };

  return (
    <>
      <AppHeader title="IT Equipment Inventory" subtitle={canManage ? "Projectors · cameras · laptops · mics · displays — issue & track" : "Browse available equipment and submit a request"} />
      <div className="px-3 sm:px-5 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Metric icon={Laptop}        label="Units tracked"     value={loadingItems ? "…" : `${metrics.total}`} />
          <Metric icon={Cable}         label="Available"         value={loadingItems ? "…" : `${metrics.available}`} tone="success" />
          <Metric icon={Camera}        label="Active checkouts"  value={loadingBookings ? "…" : `${metrics.out}`}    tone="primary" />
          <Metric icon={Wrench}        label="In maintenance"    value={loadingItems ? "…" : `${metrics.mx}`}     tone="warning" />
          <Metric icon={Mic}           label="Pending requests"  value={loadingBookings ? "…" : `${metrics.pending}`} tone="warning" />
        </div>

        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equipment usage by category</CardTitle>
              <p className="text-xs text-muted-foreground">Share of current checkouts across hardware types</p>
            </CardHeader>
            <CardContent>
              {usageData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No active checkouts to chart yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={usageData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                        {usageData.map(d => <Cell key={d.name} fill={CAT_COLOR[d.name as Category] ?? "oklch(0.55 0.05 160)"} stroke="none" />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="checkout">{canManage ? "Checkout desk" : "My checkouts"}</TabsTrigger>
            <TabsTrigger value="requests">{canManage ? "Requests" : "My requests"}</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Inventory</CardTitle>
                  <p className="text-xs text-muted-foreground">Search across asset tag, name, brand, category and storage location</p>
                </div>
                {canManage && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add item</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader><DialogTitle>Add an inventory item</DialogTitle></DialogHeader>
                      <div className="grid grid-cols-2 gap-3 py-2">
                        <Field label="Asset tag"><Input value={form.assetTag} onChange={e => setForm({ ...form, assetTag: e.target.value.toUpperCase() })} placeholder="PRJ-024" /></Field>
                        <Field label="Name"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
                        <Field label="Brand"><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></Field>
                        <Field label="Category">
                          <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Condition">
                          <Select value={form.condition} onValueChange={(v: Condition) => setForm({ ...form, condition: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Quantity"><Input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value) || 1) })} /></Field>
                        <Field label="Location"><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="AV Cage · A" /></Field>
                      </div>
                      <DialogFooter><Button onClick={addItem} disabled={saving}>{saving ? "Adding…" : "Add to inventory"}</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search asset tag, name, brand…" className="pl-9" />
                  </div>
                  <Select value={cat} onValueChange={(v) => setCat(v as Category | "all")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={(v) => setStatus(v as DisplayStatus | "all")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="checked_out">Checked out</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag</TableHead><TableHead>Item</TableHead><TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty</TableHead><TableHead>Condition</TableHead><TableHead>Location</TableHead>
                        <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingItems && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
                      {!loadingItems && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No items match.</TableCell></TableRow>}
                      {filtered.map((it: any) => {
                        const Icon = CAT_ICON[it.category as Category] ?? Laptop;
                        const st = displayStatus(it);
                        return (
                          <TableRow key={it._id}>
                            <TableCell className="font-mono text-[11px]">{it.assetTag ?? "—"}</TableCell>
                            <TableCell><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{it.name}</span><span className="text-[10px] text-muted-foreground">· {it.brand}</span></div></TableCell>
                            <TableCell><Badge variant="outline" className="text-[10px]">{it.category}</Badge></TableCell>
                            <TableCell className="text-right font-mono">{it.quantity}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                it.condition === "Excellent" ? "border-success/40 text-success"
                                : it.condition === "Good" ? "border-primary/40 text-primary"
                                : it.condition === "Worn" ? "border-warning/40 text-warning"
                                : "border-destructive/40 text-destructive"
                              }>{it.condition}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{it.location}</TableCell>
                            <TableCell>
                              {canManage && st !== "checked_out" ? (
                                <Select value={st === "maintenance" ? "maintenance" : "available"} onValueChange={(v: "available" | "maintenance") => setItemStatus(it, v)}>
                                  <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="outline" className={
                                  st === "available" ? "border-success/40 text-success"
                                  : st === "checked_out" ? "border-primary/40 text-primary"
                                  : "border-warning/40 text-warning"
                                }>{st.replace("_", " ")}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex gap-1">
                                {!canManage && <Button size="sm" variant="outline" disabled={st !== "available" || requestingId === it._id} onClick={() => requestItem(it)}>{requestingId === it._id ? "…" : "Request"}</Button>}
                                {canDelete && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                                    onClick={async () => {
                                      try { await deleteResource(it._id); toast.success("Item removed"); refresh(); }
                                      catch (e) { toast.error(e instanceof ApiError ? e.message : "Failed to remove item"); }
                                    }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkout">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /> {canManage ? "Active equipment checkouts" : "My equipment checkouts"}</CardTitle>
                <p className="text-xs text-muted-foreground">All borrowed IT assets flow through this desk.</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead><TableHead>Item</TableHead>
                      {canManage && <TableHead>Borrower</TableHead>}
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBookings && <TableRow><TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
                    {!loadingBookings && checkouts.map((c: any) => {
                      const overdue = c.dueDate && new Date(c.dueDate) < new Date();
                      return (
                        <TableRow key={c._id}>
                          <TableCell className="font-mono text-xs">{c._id.slice(-6)}</TableCell>
                          <TableCell>{c.resource?.assetTag} · {c.resource?.name}</TableCell>
                          {canManage && <TableCell><p className="text-sm">{c.user?.name}</p><p className="text-[10px] text-muted-foreground font-mono">{c.user?.matricule ?? c.user?.email}</p></TableCell>}
                          <TableCell>
                            {c.dueDate ? (
                              <Badge variant={overdue ? "destructive" : "outline"} className={!overdue ? "border-success/40 text-success" : ""}>
                                {String(c.dueDate).slice(0, 10)}{overdue && " · overdue"}
                              </Badge>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {canManage && <Button size="sm" variant="outline" disabled={returningId === c._id} onClick={() => checkin(c)}>{returningId === c._id ? "…" : "Check in"}</Button>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!loadingBookings && checkouts.length === 0 && <TableRow><TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground py-6">No active checkouts.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{canManage ? "Equipment requests" : "My requests"}</CardTitle>
                <p className="text-xs text-muted-foreground">{canManage ? "Approve or reject borrower requests; approval issues a checkout" : "Track the status of your submitted requests"}</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Req</TableHead><TableHead>Item</TableHead>
                      {canManage && <TableHead>Requester</TableHead>}
                      <TableHead>Need by</TableHead><TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingBookings && <TableRow><TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>}
                    {!loadingBookings && requests.map((r: any) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-mono text-xs">{r._id.slice(-6)}</TableCell>
                        <TableCell>{r.resource?.assetTag} · {r.resource?.name}</TableCell>
                        {canManage && <TableCell><p className="text-sm">{r.user?.name}</p><p className="text-[10px] text-muted-foreground font-mono">{r.user?.matricule ?? r.user?.email}</p></TableCell>}
                        <TableCell className="font-mono text-xs">{r.dueDate ? String(r.dueDate).slice(0, 10) : "—"}</TableCell>
                        <TableCell className="text-xs max-w-[260px] truncate" title={r.purpose}>{r.purpose}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            r.status === "approved" ? "border-success/40 text-success"
                            : r.status === "rejected" ? "border-destructive/40 text-destructive"
                            : "border-warning/40 text-warning"
                          }>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canManage && r.status === "pending" && (
                            <div className="inline-flex gap-1">
                              <Button size="sm" disabled={decidingId === r._id} onClick={() => decide(r, "approved")}>Approve</Button>
                              <Button size="sm" variant="outline" disabled={decidingId === r._id} onClick={() => decide(r, "rejected")}>Reject</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!loadingBookings && requests.length === 0 && <TableRow><TableCell colSpan={canManage ? 7 : 6} className="text-center text-muted-foreground py-6">No requests.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Laptop; label: string; value: string; tone?: "success" | "warning" | "primary" }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center"><Icon className="h-4.5 w-4.5 text-primary" /></div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className={`text-lg font-semibold leading-tight ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : ""}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label>{label}</Label>{children}</div>;
}
