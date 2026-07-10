import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { useLocalStore } from "@/lib/local-store";

export const Route = createFileRoute("/app/config")({
  head: () => ({ meta: [{ title: "System Configuration — CRMS" }] }),
  component: ConfigPage,
});

interface Config {
  bookingLimits: { amphi: number; lab: number; equipment: number; meeting: number };
  templates: { bookingConfirmed: string; cancellationAlert: string; checkoutReceipt: string };
}

const DEFAULT_CONFIG: Config = {
  bookingLimits: { amphi: 4, lab: 3, equipment: 7, meeting: 2 },
  templates: {
    bookingConfirmed: "Hello {{name}}, your booking for {{resource}} on {{date}} {{slot}} is confirmed.",
    cancellationAlert: "Notice: {{course}} scheduled for {{date}} {{slot}} has been cancelled by {{lecturer}}. Reason: {{reason}}.",
    checkoutReceipt: "Asset {{asset}} checked out to {{name}} ({{matricule}}). Return by {{due}}.",
  },
};

function ConfigPage() {
  const { can } = useRole();
  if (!can("action:editConfig")) return <Navigate to="/app/dashboard" />;
  const [cfg, setCfg] = useLocalStore<Config>("crms-config", DEFAULT_CONFIG);

  return (
    <>
      <AppHeader title="System Configuration" subtitle="Booking duration limits & notification templates" />
      <div className="px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Maximum booking duration (hours)</CardTitle>
            <p className="text-xs text-muted-foreground">Applied at booking creation across the platform.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {(Object.keys(cfg.bookingLimits) as Array<keyof Config["bookingLimits"]>).map(k => (
              <div key={k} className="grid gap-1.5">
                <Label className="capitalize">{k}</Label>
                <Input type="number" min={1} max={24} value={cfg.bookingLimits[k]}
                  onChange={e => setCfg({ ...cfg, bookingLimits: { ...cfg.bookingLimits, [k]: Math.max(1, Math.min(24, Number(e.target.value) || 1)) } })} />
              </div>
            ))}
            <div className="col-span-2">
              <Button onClick={() => toast.success("Booking limits saved")} className="gap-1.5"><Save className="h-4 w-4" /> Save limits</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification templates</CardTitle>
            <p className="text-xs text-muted-foreground">Use <code>{`{{placeholders}}`}</code> for dynamic values.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(cfg.templates) as Array<keyof Config["templates"]>).map(k => (
              <div key={k} className="grid gap-1.5">
                <Label className="capitalize">{k.replace(/([A-Z])/g, " $1")}</Label>
                <Textarea rows={3} value={cfg.templates[k]}
                  onChange={e => setCfg({ ...cfg, templates: { ...cfg.templates, [k]: e.target.value } })} />
              </div>
            ))}
            <Button onClick={() => toast.success("Templates saved")} className="gap-1.5"><Save className="h-4 w-4" /> Save templates</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
