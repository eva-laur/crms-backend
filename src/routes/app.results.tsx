import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, GraduationCap, ShieldCheck, FileText, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/results")({
  head: () => ({ meta: [{ title: "Academic Results Portal — CRMS" }] }),
  component: ResultsPage,
});

interface Subject {
  code: string;
  name: string;
  credits: number;
  ca: { attendance: number; tests: number; lab: number };
  exam: number;
}

const SUBJECTS: Subject[] = [
  { code: "CS-401", name: "Distributed Systems",   credits: 4, ca: { attendance: 9,  tests: 24, lab: 13 }, exam: 41 },
  { code: "CS-220", name: "Computer Networks",     credits: 3, ca: { attendance: 8,  tests: 22, lab: 14 }, exam: 38 },
  { code: "MA-310", name: "Linear Algebra",        credits: 3, ca: { attendance: 9,  tests: 20, lab: 0  }, exam: 36 },
  { code: "EE-150", name: "Signals & Systems",     credits: 3, ca: { attendance: 7,  tests: 18, lab: 11 }, exam: 30 },
  { code: "PH-202", name: "Engineering Physics",   credits: 2, ca: { attendance: 8,  tests: 19, lab: 10 }, exam: 33 },
];

function grade(total: number) {
  if (total >= 80) return { letter: "A", gpa: 4.0, status: "Passed", tone: "success" as const };
  if (total >= 70) return { letter: "B", gpa: 3.3, status: "Passed", tone: "success" as const };
  if (total >= 60) return { letter: "C", gpa: 2.7, status: "Passed", tone: "success" as const };
  if (total >= 50) return { letter: "D", gpa: 2.0, status: "Passed", tone: "warning" as const };
  if (total >= 45) return { letter: "E", gpa: 1.5, status: "Pending", tone: "warning" as const };
  return { letter: "F", gpa: 0, status: "Failed", tone: "destructive" as const };
}

function ResultsPage() {
  const { user, can } = useRole();
  if (!can("nav:results")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const rows = SUBJECTS.map(s => {
    const caTotal = s.ca.attendance + s.ca.tests + s.ca.lab;
    const total = caTotal + s.exam;
    const g = grade(total);
    return { ...s, caTotal, total, g };
  });

  const totalCredits = rows.reduce((a, r) => a + r.credits, 0);
  const weightedGPA  = rows.reduce((a, r) => a + r.g.gpa * r.credits, 0) / totalCredits;
  const cumulative   = rows.reduce((a, r) => a + r.total, 0) / rows.length;

  return (
    <>
      <AppHeader title="Academic Results Portal" subtitle="Off-campus access to your official semester record" />
      <div className="px-5 lg:px-8 py-6 space-y-6">

        <Card className="bg-card/60 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Official Academic Performance Portal</CardTitle>
                <p className="text-[11px] text-muted-foreground">Encrypted session · {user.matricule} · Spring Semester 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-success/40 text-success text-[10px]"><Lock className="h-3 w-3 mr-1" /> SECURE CHANNEL</Badge>
              <Button size="sm" onClick={() => toast.success("Transcript PDF queued", { description: `Sent to ${user.email}` })}>
                <Download className="h-4 w-4 mr-1.5" /> Download Digital Transcript (PDF)
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Semester GPA"        value={weightedGPA.toFixed(2)} hint="weighted by credits" />
              <Stat label="Average Total"       value={`${cumulative.toFixed(1)}%`} hint="across all subjects" />
              <Stat label="Credits Attempted"   value={`${totalCredits}`} hint={`${rows.length} subjects`} />
              <Stat label="Standing"            value="Good Standing" hint="Top 18% of cohort" tone="success" />
            </div>
          </CardContent>
        </Card>

        {/* CA breakdown */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> 1 · Continuous Assessment (CA) Marks</CardTitle>
            <p className="text-[11px] text-muted-foreground">Attendance · Tests · Lab Practical · weighted out of 50</p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Code</th>
                  <th className="text-left px-3 py-2.5 font-medium">Subject</th>
                  <th className="text-right px-3 py-2.5 font-medium">Attend. /10</th>
                  <th className="text-right px-3 py-2.5 font-medium">Tests /25</th>
                  <th className="text-right px-3 py-2.5 font-medium">Lab /15</th>
                  <th className="text-right px-5 py-2.5 font-medium">CA Total /50</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.code} className="border-b border-border/60">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{r.code}</td>
                    <td className="px-3 py-3">{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.ca.attendance}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.ca.tests}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.ca.lab || "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{r.caTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Final exams */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> 2 · Final Semester Exam Marks</CardTitle>
            <p className="text-[11px] text-muted-foreground">Centrally invigilated · weighted out of 50</p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium">Subject</th>
                  <th className="text-right px-3 py-2.5 font-medium">Exam /50</th>
                  <th className="text-left px-5 py-2.5 font-medium w-[40%]">Performance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.code} className="border-b border-border/60">
                    <td className="px-5 py-3"><span className="font-mono text-xs text-primary mr-2">{r.code}</span>{r.name}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{r.exam}</td>
                    <td className="px-5 py-3"><Progress value={(r.exam / 50) * 100} className="h-1.5" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> 3 · Computed Subject Totals &amp; Final Grade</CardTitle>
            <p className="text-[11px] text-muted-foreground">CA + Exam · letter grade · GPA contribution · status</p>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border">
                <tr>
                  <th className="text-left  px-5 py-2.5 font-medium">Subject</th>
                  <th className="text-right px-3 py-2.5 font-medium">Credits</th>
                  <th className="text-right px-3 py-2.5 font-medium">CA</th>
                  <th className="text-right px-3 py-2.5 font-medium">Exam</th>
                  <th className="text-right px-3 py-2.5 font-medium">Total /100</th>
                  <th className="text-center px-3 py-2.5 font-medium">Grade</th>
                  <th className="text-right px-3 py-2.5 font-medium">GPA</th>
                  <th className="text-right px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.code} className="border-b border-border/60">
                    <td className="px-5 py-3"><span className="font-mono text-xs text-primary mr-2">{r.code}</span>{r.name}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.credits}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.caTotal}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.exam}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{r.total}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-semibold ring-1 ring-primary/30">{r.g.letter}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.g.gpa.toFixed(1)}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge variant="outline" className={
                        r.g.tone === "success"     ? "border-success/40 text-success" :
                        r.g.tone === "warning"     ? "border-warning/40 text-warning" :
                                                     "border-destructive/40 text-destructive"
                      }>{r.g.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-background/40">
                  <td className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground" colSpan={4}>Weighted semester GPA</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{cumulative.toFixed(1)}</td>
                  <td />
                  <td className="px-3 py-3 text-right font-semibold text-primary tabular-nums">{weightedGPA.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-[11px] text-muted-foreground">/ 4.0</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "success" }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone === "success" ? "text-success" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}
