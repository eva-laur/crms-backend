import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Et as BookMarked, K as Hash, Tt as BookOpen, V as Layers, b as Search, d as Trash2, w as Plus, z as Library } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { n as createBooking, r as getBookings, s as returnBooking } from "./bookings-BMnMGXf-.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { i as getResources, n as createResource, r as deleteResource } from "./resources-CdRZ6Kye.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.library-ZiL8sdqZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	"Academic Report",
	"Textbook",
	"Novel",
	"Reference"
];
var LEVELS = [
	"L1",
	"L2",
	"L3",
	"M1",
	"M2",
	"PhD",
	"General"
];
function dueDate(days) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}
var STATUS_TONE = {
	pending: "border-warning/40 text-warning",
	approved: "border-primary/40 text-primary",
	checked_out: "border-primary/40 text-primary",
	returned: "border-success/40 text-success",
	overdue: "",
	rejected: "",
	cancelled: ""
};
function LibraryPage() {
	const { user, can } = useRole();
	if (!can("nav:library")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	const canManage = can("action:manageLibrary");
	const canDelete = user.role === "admin";
	const queryClient = useQueryClient();
	const { data: books = [], isLoading: loadingBooks } = useQuery({
		queryKey: ["resources", "book"],
		queryFn: () => getResources({ type: "book" })
	});
	const { data: loans = [], isLoading: loadingLoans } = useQuery({
		queryKey: [
			"bookings",
			"book",
			canManage ? "checked_out" : "mine"
		],
		queryFn: () => canManage ? getBookings({
			status: "checked_out",
			resourceType: "book"
		}) : getBookings({ resourceType: "book" })
	});
	const visibleLoans = canManage ? loans : loans.filter((l) => !["cancelled", "rejected"].includes(l.status));
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["resources", "book"] });
		queryClient.invalidateQueries({ queryKey: ["bookings", "book"] });
	};
	const [q, setQ] = (0, import_react.useState)("");
	const [field, setField] = (0, import_react.useState)("all");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [level, setLevel] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => {
		const needle = q.trim().toLowerCase();
		return books.filter((b) => {
			if (category !== "all" && b.category !== category) return false;
			if (level !== "all" && b.level !== level) return false;
			if (!needle) return true;
			return {
				all: `${b.name} ${b.author ?? ""} ${b.isbn ?? ""} ${b.speciality ?? ""} ${b.level ?? ""} ${b.category ?? ""}`,
				title: b.name,
				author: b.author ?? "",
				isbn: b.isbn ?? "",
				speciality: b.speciality ?? "",
				level: b.level ?? ""
			}[field].toLowerCase().includes(needle);
		});
	}, [
		books,
		q,
		field,
		category,
		level
	]);
	const metrics = (0, import_react.useMemo)(() => {
		const total = books.reduce((a, b) => a + (b.totalCopies ?? 0), 0);
		const available = books.reduce((a, b) => a + (b.availableCopies ?? 0), 0);
		return {
			total,
			available,
			onLoan: total - available,
			reports: books.filter((b) => b.category === "Academic Report").length,
			titles: books.length
		};
	}, [books]);
	const [open, setOpen] = (0, import_react.useState)(false);
	const empty = {
		title: "",
		author: "",
		isbn: "",
		category: "Textbook",
		speciality: "",
		level: "L1",
		location: "Central Library",
		copiesTotal: 1
	};
	const [form, setForm] = (0, import_react.useState)(empty);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const addBook = async () => {
		if (!form.title || !form.author || !form.isbn) {
			toast.error("Title, author and ISBN are required");
			return;
		}
		setSaving(true);
		try {
			await createResource({
				name: form.title,
				author: form.author,
				isbn: form.isbn,
				type: "book",
				category: form.category,
				speciality: form.speciality,
				level: form.level,
				location: form.location,
				quantity: form.copiesTotal,
				totalCopies: form.copiesTotal,
				availableCopies: form.copiesTotal
			});
			toast.success(`"${form.title}" added to catalog`);
			setForm(empty);
			setOpen(false);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to add catalog entry");
		} finally {
			setSaving(false);
		}
	};
	const removeBook = async (b) => {
		try {
			await deleteResource(b._id);
			toast.success("Entry removed");
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to remove entry");
		}
	};
	const [borrowingId, setBorrowingId] = (0, import_react.useState)(null);
	const borrow = async (b) => {
		if ((b.availableCopies ?? 0) < 1) {
			toast.error("No copies available");
			return;
		}
		setBorrowingId(b._id);
		try {
			await createBooking({
				resource: b._id,
				dueDate: dueDate(14),
				purpose: "Library loan request"
			});
			toast.success(`Borrow request submitted · "${b.name}"`, { description: "Collect at the circulation desk once approved." });
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to submit borrow request");
		} finally {
			setBorrowingId(null);
		}
	};
	const [returningId, setReturningId] = (0, import_react.useState)(null);
	const checkin = async (loan) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Library Catalog",
		subtitle: canManage ? "Books · academic reports · novels — circulation & inventory" : "Search books, reports and novels — borrow with one click"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Library,
						label: "Titles in catalog",
						value: loadingBooks ? "…" : `${metrics.titles}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: BookOpen,
						label: "Copies available",
						value: loadingBooks ? "…" : `${metrics.available} / ${metrics.total}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: BookMarked,
						label: "Copies on loan",
						value: loadingBooks ? "…" : `${metrics.onLoan}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Hash,
						label: "Academic reports",
						value: loadingBooks ? "…" : `${metrics.reports}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-primary" }), " Catalog search"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Filter by title, author, ISBN, speciality or class level"
				})] }), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add book"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "sm:max-w-lg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a catalog entry" }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Title",
										wide: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.title,
											onChange: (e) => setForm({
												...form,
												title: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Author",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.author,
											onChange: (e) => setForm({
												...form,
												author: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "ISBN / Ref",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.isbn,
											onChange: (e) => setForm({
												...form,
												isbn: e.target.value
											}),
											placeholder: "978-... or REP-..."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Category",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.category,
											onValueChange: (v) => setForm({
												...form,
												category: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c,
												children: c
											}, c)) })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Class / Level",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.level,
											onValueChange: (v) => setForm({
												...form,
												level: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: l,
												children: l
											}, l)) })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Speciality",
										wide: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.speciality,
											onChange: (e) => setForm({
												...form,
												speciality: e.target.value
											}),
											placeholder: "Computer Science / EE / …"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Location",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.location,
											onChange: (e) => setForm({
												...form,
												location: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Copies",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											value: form.copiesTotal,
											onChange: (e) => setForm({
												...form,
												copiesTotal: Math.max(1, Number(e.target.value))
											})
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: addBook,
								disabled: saving,
								children: saving ? "Adding…" : "Add to catalog"
							}) })
						]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 md:grid-cols-[1fr_180px_200px_140px] gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search title, author, ISBN, speciality, class…",
								className: "pl-9"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: field,
							onValueChange: (v) => setField(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All fields"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "title",
									children: "Title"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "author",
									children: "Author"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "isbn",
									children: "ISBN / Ref"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "speciality",
									children: "Speciality"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "level",
									children: "Class / Level"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: category,
							onValueChange: (v) => setCategory(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All categories"
							}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c,
								children: c
							}, c))] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: level,
							onValueChange: setLevel,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All levels"
							}), LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: l,
								children: l
							}, l))] })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ref" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Author" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "ISBN / Ref" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Speciality · Level" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Avail"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
					loadingBooks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 8,
						className: "text-center text-muted-foreground py-6",
						children: "Loading…"
					}) }),
					!loadingBooks && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 8,
						className: "text-center text-muted-foreground py-6",
						children: "No catalog entries match."
					}) }),
					filtered.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-[11px]",
							children: b._id.slice(-6)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium max-w-[260px] truncate",
							title: b.name,
							children: b.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: b.author
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-[11px]",
							children: b.isbn
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px]",
							children: b.category
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "inline h-3 w-3 mr-1 text-muted-foreground" }),
								b.speciality,
								" · ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono",
									children: b.level
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right tabular-nums",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: b.availableCopies === 0 ? "text-destructive" : b.availableCopies < 2 ? "text-warning" : "text-success",
									children: b.availableCopies
								}),
								" / ",
								b.totalCopies
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									disabled: (b.availableCopies ?? 0) < 1 || borrowingId === b._id,
									onClick: () => borrow(b),
									children: borrowingId === b._id ? "…" : "Borrow"
								}), canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon",
									variant: "ghost",
									className: "h-7 w-7 text-destructive",
									onClick: () => removeBook(b),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})]
							})
						})
					] }, b._id))
				] })] })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: canManage ? "Checkout list · borrowed articles" : "My checkouts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: canManage ? "Every book, report or novel currently out flows through this list" : "Books currently issued or requested on your account"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Loan" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
				canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Borrower" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Due / Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Action"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
				loadingLoans && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: canManage ? 5 : 4,
					className: "text-center text-muted-foreground py-6",
					children: "Loading…"
				}) }),
				!loadingLoans && visibleLoans.map((l) => {
					const overdue = l.status === "checked_out" && l.dueDate && new Date(l.dueDate) < /* @__PURE__ */ new Date();
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: l._id.slice(-6)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: l.resource?.name ?? "—" }),
						canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: l.user?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground font-mono",
							children: l.user?.matricule ?? l.user?.email
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: overdue ? "destructive" : "outline",
							className: !overdue ? STATUS_TONE[l.status] ?? "" : "",
							children: l.status === "checked_out" && l.dueDate ? `${l.dueDate.slice(0, 10)}${overdue ? " · overdue" : ""}` : l.status.replace(/_/g, " ")
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: canManage && l.status === "checked_out" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: returningId === l._id,
								onClick: () => checkin(l),
								children: returningId === l._id ? "…" : "Check in"
							})
						})
					] }, l._id);
				}),
				!loadingLoans && visibleLoans.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: canManage ? 5 : 4,
					className: "text-center text-muted-foreground py-6",
					children: "No active loans."
				}) })
			] })] }) })] })
		]
	})] });
}
function Metric({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-4 flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4.5 w-4.5 text-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-semibold leading-tight",
				children: value
			})]
		})]
	}) });
}
function Field({ label, wide, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid gap-1.5 ${wide ? "col-span-2" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { LibraryPage as component };
