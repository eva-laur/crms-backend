import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useRole, can } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Bus } from "lucide-react";
import { getBookings, type ApiBooking } from "@/lib/api/bookings";
import { getMyReservations } from "@/lib/api/bus";

export const Route = createFileRoute("/app/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — CRMS" }] }),
  component: BookingsPage,
});

const STATUS_TONE: Record<string, "success" | "warning" | "default"> = {
  approved: "success",
  checked_out: "success",
  confirmed: "success",
  returned: "default",
  pending: "warning",
  rejected: "default",
  cancelled: "default",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "Confirmed",
  checked_out: "Checked out",
  confirmed: "Confirmed",
  returned: "Completed",
  pending: "Pending",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function fmtWindow(b: ApiBooking) {
  if (!b.startTime) return b.dueDate ? `Due ${new Date(b.dueDate as string).toLocaleString()}` : "—";
  const start = new Date(b.startTime as string);
  const end = b.endTime ? new Date(b.endTime as string) : null;
  const day = start.toLocaleDateString(undefined, { weekday: "short" });
  const startT = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endT = end ? end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
  return `${day} · ${startT}${endT ? `–${endT}` : ""}`;
}

/** A single normalized row shape so resource bookings (halls, labs, IT
 * equipment, books) and bus reservations — two entirely separate backend
 * modules — can be rendered in one unified "My Bookings" table. */
type Row = {
  id: string;
  kind: "resource" | "bus";
  name: string;
  detail: string;
  when: string;
  status: string;
  createdAt: string;
};

function BookingsPage() {
  const { user } = useRole();
  if (!can(user?.role, "nav:bookings")) return <Navigate to="/app/dashboard" />;

  const { data: bookings = [], isLoading: loadingBookings, isError: errorBookings } = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => getBookings(),
  });
  const { data: reservations = [], isLoading: loadingReservations, isError: errorReservations } = useQuery({
    queryKey: ["bus", "reservations", "mine"],
    queryFn: getMyReservations,
  });

  const isLoading = loadingBookings || loadingReservations;
  const isError = errorBookings || errorReservations;

  const rows: Row[] = useMemo(() => {
    const resourceRows: Row[] = bookings.map((b) => ({
      id: b._id,
      kind: "resource",
      name: b.resource?.name ?? "—",
      detail: b.purpose ?? "—",
      when: fmtWindow(b),
      status: b.status,
      createdAt: (b as any).createdAt ?? "",
    }));
    const busRows: Row[] = reservations.map((r: any) => ({
      id: r._id,
      kind: "bus",
      name: r.route?.name ?? `${r.route?.origin ?? "—"} → ${r.route?.destination ?? "—"}`,
      detail: `Seat ${r.seatNumber} · ${r.route?.departureTime ?? "—"}`,
      when: r.travelDate ? new Date(r.travelDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : "—",
      status: r.status,
      createdAt: r.createdAt ?? "",
    }));
    return [...resourceRows, ...busRows].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }, [bookings, reservations]);

  return (
    <>
      <AppHeader title="My Bookings" subtitle="Every reservation linked to your account — halls, labs, IT equipment, books & bus seats" />
      <div className="px-5 lg:px-8 py-6">
        <Card className="bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary"/> Personal booking log</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading…" : isError ? "Could not reach the server" : `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`}
            </p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Type</th>
                  <th className="text-left px-3 py-2.5 font-medium">Resource</th>
                  <th className="text-left px-3 py-2.5 font-medium">Details</th>
                  <th className="text-left px-3 py-2.5 font-medium">When</th>
                  <th className="text-right px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && rows.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No bookings yet.</td></tr>
                )}
                {rows.map((r) => {
                  const tone = STATUS_TONE[r.status] ?? "default";
                  return (
                    <tr key={`${r.kind}-${r.id}`} className="border-b border-border/60">
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="gap-1 font-normal">
                          {r.kind === "bus" ? <Bus className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />}
                          {r.kind === "bus" ? "Bus" : "Resource"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-medium">{r.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{r.detail}</td>
                      <td className="px-3 py-3">{r.when}</td>
                      <td className="px-5 py-3 text-right">
                        <Badge variant="outline" className={
                          tone === "success" ? "border-success/40 text-success" :
                          tone === "warning" ? "border-warning/40 text-warning" : ""
                        }>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
