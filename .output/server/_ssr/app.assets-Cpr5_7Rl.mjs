import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as ShieldCheck, vt as Calendar, wt as Boxes } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { r as getBookings } from "./bookings-BMnMGXf-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.assets-Cpr5_7Rl.js
var import_jsx_runtime = require_jsx_runtime();
function daysUntil(iso) {
	if (!iso) return null;
	return Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
}
function AssetsPage() {
	const { user } = useRole();
	if (user?.role !== "student") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const { data: bookings = [] } = useQuery({
		queryKey: ["bookings", "mine"],
		queryFn: () => getBookings()
	});
	const active = bookings.filter((b) => b.status === "checked_out");
	const history = bookings.filter((b) => b.status === "returned");
	const dueSoon = active.filter((b) => {
		const d = daysUntil(b.dueDate);
		return d !== null && d <= 3;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "My Borrowed Assets",
		subtitle: "Items currently in your custody"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "bg-card/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boxes, { className: "h-4 w-4 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-2xl font-semibold",
									children: active.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Currently borrowed"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: `bg-card/60 ${dueSoon.length > 0 ? "ring-1 ring-warning/30" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: `h-4 w-4 ${dueSoon.length > 0 ? "text-warning" : "text-muted-foreground"}` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-2xl font-semibold",
									children: dueSoon.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-[11px] ${dueSoon.length > 0 ? "text-warning" : "text-muted-foreground"}`,
									children: "Due within 3 days"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "bg-card/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-success" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-2xl font-semibold",
									children: "0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Outstanding fines"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Active loans"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "divide-y divide-border",
						children: [active.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-5 py-6 text-center text-sm text-muted-foreground",
							children: "No items currently checked out."
						}), active.map((it) => {
							const d = daysUntil(it.dueDate);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "px-5 py-4 flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium truncate",
										children: it.resource?.name ?? "Resource"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground font-mono",
										children: [
											it.resource?._id?.slice(-8) ?? "",
											" · checked out ",
											it.startTime ? new Date(it.startTime).toLocaleDateString() : "—"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-right",
									children: d !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: d <= 3 ? "border-warning/40 text-warning" : "",
										children: d < 0 ? "Overdue" : `Due in ${d} day${d === 1 ? "" : "s"}`
									})
								})]
							}, it._id);
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Recent returns"
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "divide-y divide-border",
						children: [history.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-5 py-6 text-center text-sm text-muted-foreground",
							children: "No return history yet."
						}), history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "px-5 py-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: h.resource?.name ?? "Resource"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground font-mono",
									children: h.resource?._id?.slice(-8) ?? ""
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "secondary",
									className: "border-success/30 text-success",
									children: ["Returned ", h.endTime ? new Date(h.endTime).toLocaleDateString() : ""]
								})
							})]
						}, h._id))]
					})
				})]
			})
		]
	})] });
}
//#endregion
export { AssetsPage as component };
