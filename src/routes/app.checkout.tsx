import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, can } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PackageCheck, UserCheck, Search, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { lookupUserByMatricule } from "@/lib/api/users";
import type { ApiUser } from "@/lib/api/auth";
import { getResources, type ApiResource } from "@/lib/api/resources";
import { createBooking, updateBookingStatus, checkOutBooking, returnBooking, getBookings, type ApiBooking } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/checkout")({
  head: () => ({ meta: [{ title: "Asset Checkout Desk — CRMS" }] }),
  component: CheckoutPage,
});

const CONDITIONS = ["Excellent", "Good", "Worn"] as const;

// Which resource type this checkout desk is scoped to, by role — a
// library_manager only ever sees/checks out "book" resources, an
// it_manager only "equipment". Mirrors ROLE_RESOURCE_TYPE on the backend
// (shared/constants/roles.js), which is what actually enforces this — this
// is just so the desk only ever *offers* the manager's own resources in the
// first place, rather than relying solely on a 403 after the fact.
const SCOPED_TYPE: Record<string, "book" | "equipment"> = {
  library_manager: "book",
  it_manager: "equipment",
};

function fmtDue(iso?: string) {
  if (!iso) return { text: "No due date", overdue: false };
  const d = new Date(iso);
  const overdue = d.getTime() < Date.now();
  return { text: `${overdue ? "Overdue since" : "Due"} ${d.toLocaleDateString()}`, overdue };
}

function CheckoutPage() {
  const { user } = useRole();
  if (!can(user?.role, "action:checkoutAsset")) return <Navigate to="/app/dashboard" />;
  const scopedType = user ? SCOPED_TYPE[user.role] : undefined;
  if (!scopedType) return <Navigate to="/app/dashboard" />;

  const queryClient = useQueryClient();

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ["resources", scopedType],
    queryFn: () => getResources({ type: scopedType }),
  });
  const borrowable = resources.filter(r =>
    r.status === "available" && (scopedType !== "book" || Number(r.availableCopies ?? 1) > 0)
  );

  const { data: activeCheckouts = [], isLoading: loadingActive } = useQuery({
    queryKey: ["bookings", "checked_out", scopedType],
    queryFn: () => getBookings({ status: "checked_out", resourceType: scopedType }),
  });
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
    queryClient.invalidateQueries({ queryKey: ["resources"] });
  };

  const [matricule, setMatricule] = useState("");
  const [borrower, setBorrower] = useState<ApiUser | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  const runLookup = async () => {
    const m = matricule.trim();
    if (!m) return;
    setLooking(true); setLookupError(null); setBorrower(null);
    try {
      const found = await lookupUserByMatricule(m);
      setBorrower(found);
    } catch (e) {
      setLookupError(e instanceof ApiError ? e.message : "No record found for that matricule");
    } finally {
      setLooking(false);
    }
  };

  const [resourceId, setResourceId] = useState("");
  const [due, setDue] = useState("");
  const [condition, setCondition] = useState<typeof CONDITIONS[number] | "">("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!borrower && !!resourceId && !!due && !!condition && !submitting;

  const reset = () => { setMatricule(""); setBorrower(null); setLookupError(null); setResourceId(""); setDue(""); setCondition(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !borrower) return;
    const chosen = borrowable.find(r => r._id === resourceId);
    setSubmitting(true);
    try {
      // Staff-initiated checkout desk flow: create the booking on the
      // borrower's behalf, immediately approve it, then check it out — all
      // 3 steps are scope-checked server-side (bookings.controller.js) to
      // this manager's own resource type, so this can't be used to hand out
      // another manager's resources even if the client were tampered with.
      const created = await createBooking({
        resource: resourceId, dueDate: due, purpose: "Checkout desk", onBehalfOf: borrower._id,
      });
      await updateBookingStatus(created._id, "approved");
      await checkOutBooking(created._id, undefined, condition);
      toast.success(`Checked out · ${chosen?.name ?? "item"}`, { description: `${borrower.name} · due ${due}` });
      reset();
      refreshAll();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  const [returningId, setReturningId] = useState<string | null>(null);
  const processReturn = async (booking: ApiBooking) => {
    setReturningId(booking._id);
    try {
      await returnBooking(booking._id);
      toast.success(`${booking.resource?.name ?? "Item"} returned`);
      refreshAll();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Return failed");
    } finally {
      setReturningId(null);
    }
  };

  const typeLabel = scopedType === "book" ? "book" : "equipment item";

  return (
    <>
      <AppHeader title="Asset Checkout Desk" subtitle={`Manage ${scopedType === "book" ? "library" : "equipment"} handoffs with verified borrower records`} />
      <div className="px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5">
        <Card className="bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary"/> New checkout</CardTitle>
            <p className="text-xs text-muted-foreground">Verify borrower → select {typeLabel} → log condition</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="mat">Borrower matricule</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="mat" value={matricule}
                    onChange={e => { setMatricule(e.target.value); setBorrower(null); setLookupError(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); runLookup(); } }}
                    placeholder="IUC-2024-STU-0421" className="pl-9 pr-20 font-mono text-sm bg-input/40" />
                  <button type="button" onClick={runLookup} disabled={looking || !matricule.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary border border-border rounded-md disabled:opacity-50">
                    {looking ? "Looking…" : "Verify"}
                  </button>
                </div>
              </div>

              {borrower ? (
                <div className="rounded-xl border border-success/40 bg-success/10 p-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center text-sm font-semibold">
                    {borrower.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{borrower.name}</p>
                      <Badge variant="outline" className="border-success/40 text-success text-[10px] gap-1"><UserCheck className="h-3 w-3"/> Record Verified</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{borrower.email} · {borrower.role.replace(/_/g, " ")}</p>
                  </div>
                </div>
              ) : lookupError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs">
                  {lookupError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{scopedType === "book" ? "Book" : "Equipment"}</Label>
                  <Select value={resourceId} onValueChange={setResourceId}>
                    <SelectTrigger><SelectValue placeholder={loadingResources ? "Loading…" : "Select item"} /></SelectTrigger>
                    <SelectContent>
                      {borrowable.length === 0 && !loadingResources && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">Nothing available right now</div>
                      )}
                      {borrowable.map(r => (
                        <SelectItem key={r._id} value={r._id}>
                          {r.name}{scopedType === "book" ? ` · ${r.availableCopies ?? 1} available` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="due">Expected return</Label>
                  <Input id="due" type="date" value={due} onChange={e => setDue(e.target.value)} className="bg-input/40" />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Initial item state</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CONDITIONS.map(c => {
                    const active = condition === c;
                    const tone = c === "Excellent" ? "success" : c === "Good" ? "warning" : "destructive";
                    return (
                      <button type="button" key={c} onClick={() => setCondition(c)}
                        className={cn("text-xs text-left p-3 rounded-xl border transition-all",
                          active
                            ? tone === "success"     ? "border-success/60 bg-success/15 ring-1 ring-success/40"
                              : tone === "warning"   ? "border-warning/60 bg-warning/15 ring-1 ring-warning/40"
                                                     : "border-destructive/60 bg-destructive/15 ring-1 ring-destructive/40"
                            : "border-border bg-background/40 hover:bg-accent/40")}>
                        <div className="flex items-center gap-1.5 font-medium">
                          {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {c}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? "Checking out…" : "Confirm checkout"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Active checkouts</CardTitle>
            <p className="text-xs text-muted-foreground">
              {loadingActive ? "Loading…" : `${activeCheckouts.length} ${typeLabel}${activeCheckouts.length === 1 ? "" : "s"} currently in circulation`}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {!loadingActive && activeCheckouts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">Nothing currently checked out.</p>
            )}
            <ul className="divide-y divide-border">
              {activeCheckouts.map((b) => {
                const due = fmtDue(b.dueDate as string | undefined);
                return (
                  <li key={b._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{b.resource?.name ?? "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{b.user?.name ?? "—"} · {String(b.checkoutCondition ?? "—")}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={due.overdue ? "destructive" : "secondary"} className={!due.overdue ? "border-success/30 text-success" : ""}>
                        {due.text}
                      </Badge>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        disabled={returningId === b._id} onClick={() => processReturn(b)}>
                        <Undo2 className="h-3 w-3" /> {returningId === b._id ? "…" : "Return"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
