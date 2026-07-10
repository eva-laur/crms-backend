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
import { BookOpen, Search, Plus, Trash2, BookMarked, Library as LibraryIcon, Hash, Layers } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { getResources, createResource, deleteResource, type ApiResource } from "@/lib/api/resources";
import { getBookings, createBooking, returnBooking, type ApiBooking } from "@/lib/api/bookings";

export const Route = createFileRoute("/app/library")({
  head: () => ({ meta: [{ title: "Library Catalog — CRMS" }] }),
  component: LibraryPage,
});

type BookCategory = "Academic Report" | "Textbook" | "Novel" | "Reference";
const CATEGORIES: BookCategory[] = ["Academic Report", "Textbook", "Novel", "Reference"];
const LEVELS = ["L1", "L2", "L3", "M1", "M2", "PhD", "General"];

function dueDate(days: number) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const STATUS_TONE: Record<string, string> = {
  pending: "border-warning/40 text-warning",
  approved: "border-primary/40 text-primary",
  checked_out: "border-primary/40 text-primary",
  returned: "border-success/40 text-success",
  overdue: "",
  rejected: "",
  cancelled: "",
};

function LibraryPage() {
  const { user, can } = useRole();
  if (!can("nav:library")) return <Navigate to="/app/dashboard" />;
  if (!user) return null;

  const canManage = can("action:manageLibrary");
  const canDelete = user.role === "admin"; // resources:delete is admin-only on the backend, library_manager doesn't hold it
  const queryClient = useQueryClient();

  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["resources", "book"], queryFn: () => getResources({ type: "book" }),
  });

  // Managers see every book currently checked out; everyone else sees the
  // full history of their own book bookings (pending/approved/checked_out/
  // returned) — self-scoped automatically server-side for student/faculty.
  const { data: loans = [], isLoading: loadingLoans } = useQuery({
    queryKey: ["bookings", "book", canManage ? "checked_out" : "mine"],
    queryFn: () => canManage ? getBookings({ status: "checked_out", resourceType: "book" }) : getBookings({ resourceType: "book" }),
  });
  const visibleLoans = canManage ? loans : loans.filter(l => !["cancelled", "rejected"].includes(l.status));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["resources", "book"] });
    queryClient.invalidateQueries({ queryKey: ["bookings", "book"] });
  };

  // Filters
  const [q, setQ] = useState("");
  const [field, setField] = useState<"all" | "title" | "author" | "isbn" | "speciality" | "level">("all");
  const [category, setCategory] = useState<BookCategory | "all">("all");
  const [level, setLevel] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b: any) => {
      if (category !== "all" && b.category !== category) return false;
      if (level !== "all" && b.level !== level) return false;
      if (!needle) return true;
      const haystacks: Record<typeof field, string> = {
        all: `${b.name} ${b.author ?? ""} ${b.isbn ?? ""} ${b.speciality ?? ""} ${b.level ?? ""} ${b.category ?? ""}`,
        title: b.name, author: b.author ?? "", isbn: b.isbn ?? "",
        speciality: b.speciality ?? "", level: b.level ?? "",
      };
      return haystacks[field].toLowerCase().includes(needle);
    });
  }, [books, q, field, category, level]);

  const metrics = useMemo(() => {
    const total = books.reduce((a: number, b: any) => a + (b.totalCopies ?? 0), 0);
    const available = books.reduce((a: number, b: any) => a + (b.availableCopies ?? 0), 0);
    const onLoan = total - available;
    const reports = books.filter((b: any) => b.category === "Academic Report").length;
    return { total, available, onLoan, reports, titles: books.length };
  }, [books]);

  // Add
  const [open, setOpen] = useState(false);
  const empty = { title: "", author: "", isbn: "", category: "Textbook" as BookCategory, speciality: "", level: "L1", location: "Central Library", copiesTotal: 1 };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const addBook = async () => {
    if (!form.title || !form.author || !form.isbn) { toast.error("Title, author and ISBN are required"); return; }
    setSaving(true);
    try {
      await createResource({
        name: form.title, author: form.author, isbn: form.isbn, type: "book",
        category: form.category, speciality: form.speciality, level: form.level,
        location: form.location, quantity: form.copiesTotal,
        totalCopies: form.copiesTotal, availableCopies: form.copiesTotal,
      });
      toast.success(`"${form.title}" added to catalog`);
      setForm(empty); setOpen(false);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to add catalog entry");
    } finally {
      setSaving(false);
    }
  };

  const removeBook = async (b: ApiResource) => {
    try {
      await deleteResource(b._id);
      toast.success("Entry removed");
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to remove entry");
    }
  };

  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const borrow = async (b: any) => {
    if ((b.availableCopies ?? 0) < 1) { toast.error("No copies available"); return; }
    setBorrowingId(b._id);
    try {
      await createBooking({ resource: b._id, dueDate: dueDate(14), purpose: "Library loan request" });
      toast.success(`Borrow request submitted · "${b.name}"`, { description: "Collect at the circulation desk once approved." });
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Failed to submit borrow request");
    } finally {
      setBorrowingId(null);
    }
  };

  const [returningId, setReturningId] = useState<string | null>(null);
  const checkin = async (loan: ApiBooking) => {
    setReturningId(loan._id);
    try {
      await returnBooking(loan._id);
      toast.success(`Check-in recorded · ${loan.resource?.name ?? "item"}`);
      refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Check-in failed");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <>
      <AppHeader title="Library Catalog" subtitle={canManage ? "Books · academic reports · novels — circulation & inventory" : "Search books, reports and novels — borrow with one click"} />
      <div className="px-5 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric icon={LibraryIcon} label="Titles in catalog"   value={loadingBooks ? "…" : `${metrics.titles}`} />
          <Metric icon={BookOpen}    label="Copies available"    value={loadingBooks ? "…" : `${metrics.available} / ${metrics.total}`} />
          <Metric icon={BookMarked}  label="Copies on loan"      value={loadingBooks ? "…" : `${metrics.onLoan}`} />
          <Metric icon={Hash}        label="Academic reports"    value={loadingBooks ? "…" : `${metrics.reports}`} />
        </div>

        {/* Search */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-primary" /> Catalog search</CardTitle>
              <p className="text-xs text-muted-foreground">Filter by title, author, ISBN, speciality or class level</p>
            </div>
            {canManage && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add book</Button></DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader><DialogTitle>Add a catalog entry</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <Field label="Title" wide><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
                    <Field label="Author"><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></Field>
                    <Field label="ISBN / Ref"><Input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="978-... or REP-..." /></Field>
                    <Field label="Category">
                      <Select value={form.category} onValueChange={(v: BookCategory) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Class / Level">
                      <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Speciality" wide><Input value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })} placeholder="Computer Science / EE / …" /></Field>
                    <Field label="Location"><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></Field>
                    <Field label="Copies"><Input type="number" min={1} value={form.copiesTotal} onChange={e => setForm({ ...form, copiesTotal: Math.max(1, Number(e.target.value)) })} /></Field>
                  </div>
                  <DialogFooter><Button onClick={addBook} disabled={saving}>{saving ? "Adding…" : "Add to catalog"}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_200px_140px] gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title, author, ISBN, speciality, class…" className="pl-9" />
              </div>
              <Select value={field} onValueChange={(v) => setField(v as typeof field)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fields</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="isbn">ISBN / Ref</SelectItem>
                  <SelectItem value="speciality">Speciality</SelectItem>
                  <SelectItem value="level">Class / Level</SelectItem>
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={(v) => setCategory(v as BookCategory | "all")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead><TableHead>Title</TableHead><TableHead>Author</TableHead>
                  <TableHead>ISBN / Ref</TableHead><TableHead>Category</TableHead>
                  <TableHead>Speciality · Level</TableHead><TableHead className="text-right">Avail</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBooks && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>
                )}
                {!loadingBooks && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No catalog entries match.</TableCell></TableRow>
                )}
                {filtered.map((b: any) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-mono text-[11px]">{b._id.slice(-6)}</TableCell>
                    <TableCell className="font-medium max-w-[260px] truncate" title={b.name}>{b.name}</TableCell>
                    <TableCell className="text-xs">{b.author}</TableCell>
                    <TableCell className="font-mono text-[11px]">{b.isbn}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{b.category}</Badge></TableCell>
                    <TableCell className="text-xs"><Layers className="inline h-3 w-3 mr-1 text-muted-foreground" />{b.speciality} · <span className="font-mono">{b.level}</span></TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={b.availableCopies === 0 ? "text-destructive" : b.availableCopies < 2 ? "text-warning" : "text-success"}>{b.availableCopies}</span> / {b.totalCopies}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="outline" disabled={(b.availableCopies ?? 0) < 1 || borrowingId === b._id}
                          onClick={() => borrow(b)}>{borrowingId === b._id ? "…" : "Borrow"}</Button>
                        {canDelete && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeBook(b)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Checkout list — all borrowed articles are tracked here */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{canManage ? "Checkout list · borrowed articles" : "My checkouts"}</CardTitle>
            <p className="text-xs text-muted-foreground">{canManage ? "Every book, report or novel currently out flows through this list" : "Books currently issued or requested on your account"}</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan</TableHead><TableHead>Title</TableHead>
                  {canManage && <TableHead>Borrower</TableHead>}
                  <TableHead>Due / Status</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingLoans && (
                  <TableRow><TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground py-6">Loading…</TableCell></TableRow>
                )}
                {!loadingLoans && visibleLoans.map((l: any) => {
                  const overdue = l.status === "checked_out" && l.dueDate && new Date(l.dueDate) < new Date();
                  return (
                    <TableRow key={l._id}>
                      <TableCell className="font-mono text-xs">{l._id.slice(-6)}</TableCell>
                      <TableCell>{l.resource?.name ?? "—"}</TableCell>
                      {canManage && <TableCell><p className="text-sm">{l.user?.name}</p><p className="text-[10px] text-muted-foreground font-mono">{l.user?.matricule ?? l.user?.email}</p></TableCell>}
                      <TableCell>
                        <Badge variant={overdue ? "destructive" : "outline"} className={!overdue ? STATUS_TONE[l.status] ?? "" : ""}>
                          {l.status === "checked_out" && l.dueDate ? `${l.dueDate.slice(0, 10)}${overdue ? " · overdue" : ""}` : l.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage && l.status === "checked_out" && (
                          <Button size="sm" variant="outline" disabled={returningId === l._id} onClick={() => checkin(l)}>
                            {returningId === l._id ? "…" : "Check in"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loadingLoans && visibleLoans.length === 0 && <TableRow><TableCell colSpan={canManage ? 5 : 4} className="text-center text-muted-foreground py-6">No active loans.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center"><Icon className="h-4.5 w-4.5 text-primary" /></div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid gap-1.5 ${wide ? "col-span-2" : ""}`}>
      <Label>{label}</Label>{children}
    </div>
  );
}
