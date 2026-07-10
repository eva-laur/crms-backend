import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, IdCard, ShieldCheck, ArrowRight, CheckCircle2, User, Mail } from "lucide-react";
import iucCampus from "@/assets/iuc-campus.jpg";
import { useRole, type Role } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Gateway — IUC / SEAS CRMS" },
      { name: "description", content: "Sign in or register on the IUC / SEAS Campus Resource Management System." },
    ],
  }),
  component: LoginPage,
});

const ROLE_HOME: Record<Role, string> = {
  student: "/app/dashboard",
  faculty: "/app/dashboard",
  library_manager: "/app/library",
  logistics_manager: "/app/bus",
  it_manager: "/app/it-equipment",
  lab_manager: "/app/schedule",
  admin: "/app/dashboard",
};

function LoginPage() {
  const { user, loginWithCredentials, register } = useRole();
  const navigate = useNavigate();

  const [loginMatricule, setLoginMatricule] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMatricule, setRegMatricule] = useState("");
  const [regPassword, setRegPassword] = useState("");

  if (user) return <Navigate to={ROLE_HOME[user.role]} />;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginMatricule.trim()) return toast.error("Matricule is required");
    const res = await loginWithCredentials(loginMatricule, loginPassword);
    if (!res.ok) return toast.error(res.error);
    toast.success("Welcome back");
    navigate({ to: ROLE_HOME[res.role] });
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regMatricule.trim()) return toast.error("Matricule is required");
    const res = await register({ name: regName, email: regEmail, password: regPassword, matricule: regMatricule });
    if (!res.ok) return toast.error(res.error);
    toast.success("Student account created — welcome!");
    navigate({ to: "/app/dashboard" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${iucCampus})`, filter: "blur(8px)", transform: "scale(1.05)" }}
      />
      <div className="absolute inset-0 bg-black/40 dark:bg-black/55" />

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-[1.05fr_1fr] gap-6">
        <div className="hidden md:flex flex-col justify-between rounded-3xl p-10 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[var(--shadow-elevated)]">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 ring-1 ring-white/40 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">IUC / SEAS</p>
                <h1 className="text-lg font-semibold">Campus Resource Management</h1>
              </div>
            </div>
            <h2 className="mt-12 text-4xl font-semibold leading-tight tracking-tight">
              One operating system for <span className="text-accent">every campus resource.</span>
            </h2>
            <p className="mt-4 text-white/80 max-w-md">
              Register as a student to get started. Faculty and resource-manager roles are assigned by the Administrator after registration.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            {["Sign in with your matricule and password",
              "Live conflict detection on every booking",
              "Role-aware interface — zero feature leakage"].map(t => (
              <li key={t} className="flex items-center gap-2 text-white/80">
                <CheckCircle2 className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl p-6 md:p-8 bg-white/10 dark:bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-[var(--shadow-elevated)]">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 p-1">
              <TabsTrigger value="login" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">Sign in</TabsTrigger>
              <TabsTrigger value="register" className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white">Create student account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-5">
              <h2 className="text-xl font-semibold tracking-tight text-white">Welcome back</h2>
              <p className="text-sm text-white/70 mt-0.5">Enter your matricule (student number / staff ID) and password.</p>
              <form className="mt-6 space-y-4" onSubmit={onLogin}>
                <Field label="Matricule" icon={IdCard}>
                  <Input placeholder="e.g. IUC-2024-STU-0421"
                    value={loginMatricule} onChange={e => setLoginMatricule(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </Field>
                <Field label="Password" icon={KeyRound}>
                  <Input type="password" placeholder="••••••••"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </Field>
                <Button type="submit" className="w-full h-11">
                  Sign in <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <p className="text-[11px] text-white/70 text-center">
                  Sign in with the matricule/password of a user created via registration or the <span className="font-mono text-white">seed:demo</span> script.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="register" className="pt-5">
              <h2 className="text-xl font-semibold tracking-tight text-white">Create your student account</h2>
              <p className="text-sm text-white/70 mt-0.5">All new accounts start as <span className="font-medium text-white">Student</span>. The Administrator promotes faculty and resource managers from the User Management console.</p>
              <form className="mt-5 space-y-4" onSubmit={onRegister}>
                <Field label="Full name" icon={User}>
                  <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jane Doe" className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Email" icon={Mail}>
                    <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@iuc.edu" className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  </Field>
                  <Field label="Matricule *" icon={IdCard}>
                    <Input value={regMatricule} onChange={e => setRegMatricule(e.target.value)} placeholder="IUC-2026-STU-xxxx" required className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                  </Field>
                </div>
                <Field label="Password" icon={KeyRound}>
                  <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="min. 6 characters" className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </Field>

                <Button type="submit" className="w-full h-11">
                  Create account <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <p className="text-[11px] text-white/70 text-center">
                  By registering you agree to the campus IT acceptable-use policy.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/90">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
        {children}
      </div>
    </div>
  );
}
