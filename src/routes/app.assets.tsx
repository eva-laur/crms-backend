import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, Calendar, ShieldCheck } from "lucide-react";
import { getBookings } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/assets")({
  head: () => ({ meta: [{ title: "My Borrowed Assets — CRMS" }] }),
  component: AssetsPage,
});

function daysUntil(iso?: string) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function AssetsPage() {
  const { user } = useRole();
  if (user?.role !== "student") return <Navigate to="/app/dashboard" />;

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => getBookings(),
  });

  const active = bookings.filter((b) => b.status === "checked_out");
  const history = bookings.filter((b) => b.status === "returned");
  const dueSoon = active.filter((b) => {
    const d = daysUntil(b.dueDate as string | undefined);
    return d !== null && d <= 3;
  });

  return (
    <>
      <AppHeader title="My Borrowed Assets" subtitle="Items currently in your custody" />
      <div className="px-5 lg:px-8 py-6 space-y-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-card/60"><CardContent className="p-5">
            <Boxes className="h-4 w-4 text-primary"/>
            <p className="mt-3 text-2xl font-semibold">{active.length}</p>
            <p className="text-[11px] text-muted-foreground">Currently borrowed</p>
          </CardContent></Card>
          <Card className={`bg-card/60 ${dueSoon.length > 0 ? "ring-1 ring-warning/30" : ""}`}><CardContent className="p-5">
            <Calendar className={`h-4 w-4 ${dueSoon.length > 0 ? "text-warning" : "text-muted-foreground"}`}/>
            <p className="mt-3 text-2xl font-semibold">{dueSoon.length}</p>
            <p className={`text-[11px] ${dueSoon.length > 0 ? "text-warning" : "text-muted-foreground"}`}>Due within 3 days</p>
          </CardContent></Card>
          <Card className="bg-card/60"><CardContent className="p-5">
            <ShieldCheck className="h-4 w-4 text-success"/>
            <p className="mt-3 text-2xl font-semibold">0</p>
            <p className="text-[11px] text-muted-foreground">Outstanding fines</p>
          </CardContent></Card>
        </div>

        <Card className="bg-card/60 backdrop-blur">
          <CardHeader><CardTitle className="text-base">Active loans</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {active.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No items currently checked out.</li>}
              {active.map((it) => {
                const d = daysUntil(it.dueDate as string | undefined);
                return (
                  <li key={it._id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{it.resource?.name ?? "Resource"}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {it.resource?._id?.slice(-8) ?? ""} · checked out {it.startTime ? new Date(it.startTime as string).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      {d !== null && (
                        <Badge variant="outline" className={d <= 3 ? "border-warning/40 text-warning" : ""}>
                          {d < 0 ? "Overdue" : `Due in ${d} day${d === 1 ? "" : "s"}`}
                        </Badge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur">
          <CardHeader><CardTitle className="text-base">Recent returns</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {history.length === 0 && <li className="px-5 py-6 text-center text-sm text-muted-foreground">No return history yet.</li>}
              {history.map((h) => (
                <li key={h._id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{h.resource?.name ?? "Resource"}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{h.resource?._id?.slice(-8) ?? ""}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="border-success/30 text-success">
                      Returned {h.endTime ? new Date(h.endTime as string).toLocaleDateString() : ""}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
