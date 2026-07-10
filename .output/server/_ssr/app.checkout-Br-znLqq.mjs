import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as can, f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as PackageCheck, b as Search, lt as CircleCheck, o as UserCheck, s as Undo2 } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as updateBookingStatus, n as createBooking, r as getBookings, s as returnBooking, t as checkOutBooking } from "./bookings-BMnMGXf-.mjs";
import { r as lookupUserByMatricule } from "./users-BpEolhg7.mjs";
import { i as getResources } from "./resources-CdRZ6Kye.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.checkout-Br-znLqq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CONDITIONS = [
	"Excellent",
	"Good",
	"Worn"
];
var SCOPED_TYPE = {
	library_manager: "book",
	it_manager: "equipment"
};
function fmtDue(iso) {
	if (!iso) return {
		text: "No due date",
		overdue: false
	};
	const d = new Date(iso);
	const overdue = d.getTime() < Date.now();
	return {
		text: `${overdue ? "Overdue since" : "Due"} ${d.toLocaleDateString()}`,
		overdue
	};
}
function CheckoutPage() {
	const { user } = useRole();
	if (!can(user?.role, "action:checkoutAsset")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const scopedType = user ? SCOPED_TYPE[user.role] : void 0;
	if (!scopedType) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const queryClient = useQueryClient();
	const { data: resources = [], isLoading: loadingResources } = useQuery({
		queryKey: ["resources", scopedType],
		queryFn: () => getResources({ type: scopedType })
	});
	const borrowable = resources.filter((r) => r.status === "available" && (scopedType !== "book" || Number(r.availableCopies ?? 1) > 0));
	const { data: activeCheckouts = [], isLoading: loadingActive } = useQuery({
		queryKey: [
			"bookings",
			"checked_out",
			scopedType
		],
		queryFn: () => getBookings({
			status: "checked_out",
			resourceType: scopedType
		})
	});
	const refreshAll = () => {
		queryClient.invalidateQueries({ queryKey: ["bookings"] });
		queryClient.invalidateQueries({ queryKey: ["resources"] });
	};
	const [matricule, setMatricule] = (0, import_react.useState)("");
	const [borrower, setBorrower] = (0, import_react.useState)(null);
	const [lookupError, setLookupError] = (0, import_react.useState)(null);
	const [looking, setLooking] = (0, import_react.useState)(false);
	const runLookup = async () => {
		const m = matricule.trim();
		if (!m) return;
		setLooking(true);
		setLookupError(null);
		setBorrower(null);
		try {
			const found = await lookupUserByMatricule(m);
			setBorrower(found);
		} catch (e) {
			setLookupError(e instanceof ApiError ? e.message : "No record found for that matricule");
		} finally {
			setLooking(false);
		}
	};
	const [resourceId, setResourceId] = (0, import_react.useState)("");
	const [due, setDue] = (0, import_react.useState)("");
	const [condition, setCondition] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const canSubmit = !!borrower && !!resourceId && !!due && !!condition && !submitting;
	const reset = () => {
		setMatricule("");
		setBorrower(null);
		setLookupError(null);
		setResourceId("");
		setDue("");
		setCondition("");
	};
	const submit = async (e) => {
		e.preventDefault();
		if (!canSubmit || !borrower) return;
		const chosen = borrowable.find((r) => r._id === resourceId);
		setSubmitting(true);
		try {
			const created = await createBooking({
				resource: resourceId,
				dueDate: due,
				purpose: "Checkout desk",
				onBehalfOf: borrower._id
			});
			await updateBookingStatus(created._id, "approved");
			await checkOutBooking(created._id, void 0, condition);
			toast.success(`Checked out · ${chosen?.name ?? "item"}`, { description: `${borrower.name} · due ${due}` });
			reset();
			refreshAll();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Checkout failed");
		} finally {
			setSubmitting(false);
		}
	};
	const [returningId, setReturningId] = (0, import_react.useState)(null);
	const processReturn = async (booking) => {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Asset Checkout Desk",
		subtitle: `Manage ${scopedType === "book" ? "library" : "equipment"} handoffs with verified borrower records`
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "bg-card/60 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-4 w-4 text-primary" }), " New checkout"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Verify borrower → select ",
					typeLabel,
					" → log condition"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-5",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "mat",
							children: "Borrower matricule"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "mat",
									value: matricule,
									onChange: (e) => {
										setMatricule(e.target.value);
										setBorrower(null);
										setLookupError(null);
									},
									onKeyDown: (e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											runLookup();
										}
									},
									placeholder: "IUC-2024-STU-0421",
									className: "pl-9 pr-20 font-mono text-sm bg-input/40"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: runLookup,
									disabled: looking || !matricule.trim(),
									className: "absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary border border-border rounded-md disabled:opacity-50",
									children: looking ? "Looking…" : "Verify"
								})
							]
						})]
					}),
					borrower ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-success/40 bg-success/10 p-4 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-11 w-11 rounded-full bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center text-sm font-semibold",
							children: borrower.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: borrower.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "border-success/40 text-success text-[10px] gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3 w-3" }), " Record Verified"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground truncate",
								children: [
									borrower.email,
									" · ",
									borrower.role.replace(/_/g, " ")
								]
							})]
						})]
					}) : lookupError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs",
						children: lookupError
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: scopedType === "book" ? "Book" : "Equipment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: resourceId,
								onValueChange: setResourceId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingResources ? "Loading…" : "Select item" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [borrowable.length === 0 && !loadingResources && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "px-2 py-1.5 text-xs text-muted-foreground",
									children: "Nothing available right now"
								}), borrowable.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: r._id,
									children: [r.name, scopedType === "book" ? ` · ${r.availableCopies ?? 1} available` : ""]
								}, r._id))] })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "due",
								children: "Expected return"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "due",
								type: "date",
								value: due,
								onChange: (e) => setDue(e.target.value),
								className: "bg-input/40"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "mb-2 block",
						children: "Initial item state"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: CONDITIONS.map((c) => {
							const active = condition === c;
							const tone = c === "Excellent" ? "success" : c === "Good" ? "warning" : "destructive";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCondition(c),
								className: cn("text-xs text-left p-3 rounded-xl border transition-all", active ? tone === "success" ? "border-success/60 bg-success/15 ring-1 ring-success/40" : tone === "warning" ? "border-warning/60 bg-warning/15 ring-1 ring-warning/40" : "border-destructive/60 bg-destructive/15 ring-1 ring-destructive/40" : "border-border bg-background/40 hover:bg-accent/40"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 font-medium",
									children: [active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), c]
								})
							}, c);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: !canSubmit,
						children: submitting ? "Checking out…" : "Confirm checkout"
					})
				]
			}) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "bg-card/60 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Active checkouts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: loadingActive ? "Loading…" : `${activeCheckouts.length} ${typeLabel}${activeCheckouts.length === 1 ? "" : "s"} currently in circulation`
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "pt-0",
				children: [!loadingActive && activeCheckouts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground text-center py-8",
					children: "Nothing currently checked out."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: activeCheckouts.map((b) => {
						const due = fmtDue(b.dueDate);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: b.resource?.name ?? "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground truncate",
									children: [
										b.user?.name ?? "—",
										" · ",
										String(b.checkoutCondition ?? "—")
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: due.overdue ? "destructive" : "secondary",
									className: !due.overdue ? "border-success/30 text-success" : "",
									children: due.text
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1",
									disabled: returningId === b._id,
									onClick: () => processReturn(b),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3 w-3" }),
										" ",
										returningId === b._id ? "…" : "Return"
									]
								})]
							})]
						}, b._id);
					})
				})]
			})]
		})]
	})] });
}
//#endregion
export { CheckoutPage as component };
