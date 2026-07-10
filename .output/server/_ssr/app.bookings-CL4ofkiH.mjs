import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as can, f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as Bus, at as ClipboardList } from "../_libs/lucide-react.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { r as getBookings } from "./bookings-BMnMGXf-.mjs";
import { r as getMyReservations } from "./bus-CesgH2y4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.bookings-CL4ofkiH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_TONE = {
	approved: "success",
	checked_out: "success",
	confirmed: "success",
	returned: "default",
	pending: "warning",
	rejected: "default",
	cancelled: "default"
};
var STATUS_LABEL = {
	approved: "Confirmed",
	checked_out: "Checked out",
	confirmed: "Confirmed",
	returned: "Completed",
	pending: "Pending",
	rejected: "Rejected",
	cancelled: "Cancelled"
};
function fmtWindow(b) {
	if (!b.startTime) return b.dueDate ? `Due ${new Date(b.dueDate).toLocaleString()}` : "—";
	const start = new Date(b.startTime);
	const end = b.endTime ? new Date(b.endTime) : null;
	const day = start.toLocaleDateString(void 0, { weekday: "short" });
	const startT = start.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
	const endT = end ? end.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	}) : "";
	return `${day} · ${startT}${endT ? `–${endT}` : ""}`;
}
function BookingsPage() {
	const { user } = useRole();
	if (!can(user?.role, "nav:bookings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const { data: bookings = [], isLoading: loadingBookings, isError: errorBookings } = useQuery({
		queryKey: ["bookings", "mine"],
		queryFn: () => getBookings()
	});
	const { data: reservations = [], isLoading: loadingReservations, isError: errorReservations } = useQuery({
		queryKey: [
			"bus",
			"reservations",
			"mine"
		],
		queryFn: getMyReservations
	});
	const isLoading = loadingBookings || loadingReservations;
	const isError = errorBookings || errorReservations;
	const rows = (0, import_react.useMemo)(() => {
		const resourceRows = bookings.map((b) => ({
			id: b._id,
			kind: "resource",
			name: b.resource?.name ?? "—",
			detail: b.purpose ?? "—",
			when: fmtWindow(b),
			status: b.status,
			createdAt: b.createdAt ?? ""
		}));
		const busRows = reservations.map((r) => ({
			id: r._id,
			kind: "bus",
			name: r.route?.name ?? `${r.route?.origin ?? "—"} → ${r.route?.destination ?? "—"}`,
			detail: `Seat ${r.seatNumber} · ${r.route?.departureTime ?? "—"}`,
			when: r.travelDate ? new Date(r.travelDate).toLocaleDateString(void 0, {
				weekday: "short",
				month: "short",
				day: "numeric"
			}) : "—",
			status: r.status,
			createdAt: r.createdAt ?? ""
		}));
		return [...resourceRows, ...busRows].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
	}, [bookings, reservations]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "My Bookings",
		subtitle: "Every reservation linked to your account — halls, labs, IT equipment, books & bus seats"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-5 lg:px-8 py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "bg-card/60 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 text-primary" }), " Personal booking log"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: isLoading ? "Loading…" : isError ? "Could not reach the server" : `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm min-w-[680px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-2.5 font-medium",
								children: "Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-medium",
								children: "Resource"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-medium",
								children: "Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-3 py-2.5 font-medium",
								children: "When"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-5 py-2.5 font-medium",
								children: "Status"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [!isLoading && rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 5,
						className: "text-center text-muted-foreground py-8",
						children: "No bookings yet."
					}) }), rows.map((r) => {
						const tone = STATUS_TONE[r.status] ?? "default";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "gap-1 font-normal",
										children: [r.kind === "bus" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bus, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3 w-3" }), r.kind === "bus" ? "Bus" : "Resource"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-medium",
									children: r.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-muted-foreground",
									children: r.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: r.when
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-5 py-3 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: tone === "success" ? "border-success/40 text-success" : tone === "warning" ? "border-warning/40 text-warning" : "",
										children: STATUS_LABEL[r.status] ?? r.status
									})
								})
							]
						}, `${r.kind}-${r.id}`);
					})] })]
				})
			})]
		})
	})] });
}
//#endregion
export { BookingsPage as component };
