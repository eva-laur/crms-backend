/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useRole, ROLES, ROLE_META, type Role } from "@/lib/role-context";
import { getAllUsers, updateUser, deleteUser } from "@/lib/api/users";
import type { ApiUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Trash2, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/users")({
  head: () => ({ meta: [{ title: "User Management — CRMS" }] }),
  component: UsersPage,
});

const roleLabel = (role: string): string => (ROLE_META as Record<string, { label: string }>)[role]?.label ?? role;
const isKnownRole = (role: string): role is Role => role in ROLE_META;

function UsersPage() {
  const { user, can } = useRole();
  const [accounts, setAccounts] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const reload = () => {
    setLoading(true);
    getAllUsers()
      .then(setAccounts)
      .catch((e) => toast.error(e instanceof ApiError ? e.message : "Failed to load users"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  if (!user) return null;

  if (!can("action:manageUsers")) {
    return (
      <>
        <AppHeader title="User Management" subtitle="Access restricted" />
        <div className="px-3 sm:px-5 lg:px-8 py-6">
          <Card className="max-w-xl mx-auto mt-8">
            <CardContent className="p-8 text-center space-y-3">
              <ShieldAlert className="h-8 w-8 text-warning mx-auto" />
              <p className="font-medium">This account doesn't have admin access</p>
              <div className="text-xs text-muted-foreground bg-background/40 rounded-lg border border-border p-3 text-left font-mono space-y-1">
                <p>name: {user.name}</p>
                <p>matricule: {user.matricule}</p>
                <p>email: {user.email}</p>
                <p>role (as seen by this app right now): <span className="text-warning">{user.role}</span></p>
              </div>
              <p className="text-xs text-muted-foreground">
                If you changed this account's role directly in the database, confirm you edited the document with
                this exact matricule/email, in the same database the backend's <code>MONGO_URI</code> points to,
                and that the <code>role</code> field is exactly the lowercase string <code>admin</code> (no quotes
                mismatch, no extra whitespace, no capital letters).
              </p>
              <Button asChild size="sm" variant="outline"><Link to="/app/dashboard">Back to dashboard</Link></Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const filtered = accounts.filter(a => {
    if (roleFilter !== "all" && a.role !== roleFilter) return false;
    if (!q.trim()) return true;
    const n = q.trim().toLowerCase();
    return `${a.name} ${a.email} ${a.matricule}`.toLowerCase().includes(n);
  });

  const counts = ROLES.reduce<Record<Role, number>>((acc, r) => { acc[r] = accounts.filter(a => a.role === r).length; return acc; }, {} as Record<Role, number>);

  const changeRole = async (id: string, role: Role) => {
    try {
      await updateUser(id, { role });
      toast.success(`Role updated → ${ROLE_META[role].label}`);
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to update role");
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success("Account deleted");
      reload();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to delete account");
    }
  };

  return (
    <>
      <AppHeader title="User Management" subtitle="Assign roles, manage faculty & resource managers, decommission accounts" />
      <div className="px-3 sm:px-5 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          {ROLES.map(r => (
            <Card key={r}>
              <CardContent className="p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{ROLE_META[r].short}</p>
                <p className="text-xl font-semibold mt-1">{counts[r] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Registered users</CardTitle>
              <p className="text-xs text-muted-foreground">All accounts on the platform · admin-only console</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} className="pl-9" placeholder="Search name, email or matricule…" />
              </div>
              <Select value={roleFilter} onValueChange={v => setRoleFilter(v as Role | "all")}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Matricule</TableHead>
                  <TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Loading users…</TableCell></TableRow>}
                {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No accounts match.</TableCell></TableRow>}
                {!loading && filtered.map(a => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell className="text-xs font-mono">{a.email}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{a.matricule}</TableCell>
                    <TableCell>
                      {isKnownRole(a.role) ? (
                        <Select value={a.role} onValueChange={v => changeRole(a._id, v as Role)}>
                          <SelectTrigger className="h-8 w-52 text-xs">
                            <Badge variant="outline" className="border-primary/40 text-primary">{roleLabel(a.role)}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select onValueChange={v => changeRole(a._id, v as Role)}>
                          <SelectTrigger className="h-8 w-56 text-xs">
                            <Badge variant="outline" className="border-destructive/40 text-destructive">
                              Unknown role: "{a.role}" — click to fix
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => remove(a._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}