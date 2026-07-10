import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as can, f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ShieldAlert, it as Clock, kt as ArrowRightLeft, l as TriangleAlert, ot as Circle } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as RadioGroupIndicator, r as RadioGroupItem$1, t as RadioGroup$1 } from "../_libs/@radix-ui/react-radio-group+[...].mjs";
import { o as overrideBooking, r as getBookings } from "./bookings-BMnMGXf-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.conflicts-CN4U7NxS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RadioGroup = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup$1, {
		className: cn("grid gap-2", className),
		...props,
		ref
	});
});
RadioGroup.displayName = RadioGroup$1.displayName;
var RadioGroupItem = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem$1, {
		ref,
		className: cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupIndicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-3.5 w-3.5 fill-primary" })
		})
	});
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
function buildConflictClusters(bookings) {
	const active = bookings.filter((b) => ["pending", "approved"].includes(b.status) && b.startTime && b.endTime);
	const byResource = {};
	active.forEach((b) => {
		const rid = b.resource?._id ?? b.resource;
		if (!rid) return;
		(byResource[rid] ??= []).push(b);
	});
	const clusters = [];
	Object.values(byResource).forEach((items) => {
		items.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
		let group = [];
		let groupEnd = 0;
		const flush = () => {
			if (group.length >= 2) clusters.push({
				key: group[0]._id,
				resource: group[0].resource,
				items: [...group]
			});
			group = [];
			groupEnd = 0;
		};
		items.forEach((it) => {
			const s = new Date(it.startTime).getTime();
			const e = new Date(it.endTime).getTime();
			if (group.length === 0) {
				group.push(it);
				groupEnd = e;
				return;
			}
			if (s < groupEnd) {
				group.push(it);
				if (e > groupEnd) groupEnd = e;
			} else {
				flush();
				group.push(it);
				groupEnd = e;
			}
		});
		flush();
	});
	return clusters;
}
function fmtWhen(items) {
	const s = new Date(Math.min(...items.map((i) => new Date(i.startTime).getTime())));
	const e = new Date(Math.max(...items.map((i) => new Date(i.endTime).getTime())));
	return `${s.toLocaleDateString(void 0, {
		weekday: "short",
		month: "short",
		day: "numeric"
	})} · ${s.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	})}–${e.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	})}`;
}
function formatDuration(ms) {
	const totalMin = Math.max(1, Math.round(ms / 6e4));
	if (totalMin < 60) return `${totalMin}m`;
	const h = Math.floor(totalMin / 60), m = totalMin % 60;
	return m ? `${h}h ${m}m` : `${h}h`;
}
function timeAgo(iso) {
	if (!iso) return "";
	const ms = Date.now() - new Date(iso).getTime();
	const min = Math.round(ms / 6e4);
	if (min < 60) return `${min}m ago`;
	const h = Math.round(min / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.round(h / 24)}d ago`;
}
function ConflictsPage() {
	const { user } = useRole();
	if (!can(user?.role, "nav:conflicts")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConflictsInner, {});
}
function ConflictsInner() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const { data: allBookings = [], isLoading } = useQuery({
		queryKey: ["bookings", "all"],
		queryFn: () => getBookings(),
		refetchInterval: 3e4
	});
	const scoped = (0, import_react.useMemo)(() => {
		if (user?.role === "lab_manager") return allBookings.filter((b) => b.resource?.type === "lab");
		return allBookings;
	}, [allBookings, user]);
	const clusters = (0, import_react.useMemo)(() => buildConflictClusters(scoped), [scoped]);
	const avgResolution = (0, import_react.useMemo)(() => {
		const resolved = allBookings.filter((b) => b.override?.at && b.createdAt);
		if (resolved.length === 0) return null;
		return resolved.reduce((sum, b) => sum + (new Date(b.override.at).getTime() - new Date(b.createdAt).getTime()), 0) / resolved.length;
	}, [allBookings]);
	const slaBreachRisk = (0, import_react.useMemo)(() => clusters.filter((c) => Math.min(...c.items.map((i) => new Date(i.startTime).getTime())) - Date.now() < 48 * 3600 * 1e3).length, [clusters]);
	const [selectedReq, setSelectedReq] = (0, import_react.useState)({});
	const [reasons, setReasons] = (0, import_react.useState)({});
	const [executing, setExecuting] = (0, import_react.useState)(null);
	const execute = async (clusterKey) => {
		const bookingId = selectedReq[clusterKey];
		const justification = (reasons[clusterKey] ?? "").trim();
		if (!bookingId || justification.length < 12) return;
		setExecuting(clusterKey);
		try {
			const res = await overrideBooking(bookingId, justification);
			toast.success(res.message, { description: "Decision committed to the audit log." });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to execute override");
		} finally {
			setExecuting(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Conflict Resolution Centre",
		subtitle: "Operational queue · administrative override journal"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-card/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground uppercase tracking-wider",
							children: "Active queue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold mt-1",
							children: isLoading ? "…" : clusters.length
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "bg-card/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground uppercase tracking-wider",
							children: "Avg. resolution time"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold mt-1",
							children: avgResolution === null ? "—" : formatDuration(avgResolution)
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: cnRisk(slaBreachRisk),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-[11px] uppercase tracking-wider ${slaBreachRisk > 0 ? "text-warning" : "text-muted-foreground"}`,
							children: "SLA breach risk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold mt-1",
							children: slaBreachRisk
						})]
					})
				})
			]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground text-center py-10",
			children: "Loading…"
		}) : clusters.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "bg-card/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-8 w-8 text-success mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-medium",
						children: "Queue is clear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No active resource clashes require override."
					})
				]
			})
		}) : clusters.map((c) => {
			const chosen = selectedReq[c.key];
			const reason = reasons[c.key] ?? "";
			const canExecute = !!chosen && reason.trim().length >= 12;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-card/60 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "font-mono text-[10px]",
								children: ["#", c.key.slice(-6)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "border-warning/40 text-warning text-[10px]",
								children: "UNRESOLVED"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base mt-2 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-warning" }),
								" ",
								c.resource?.name ?? "Resource"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
								" ",
								fmtWhen(c.items)
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4 text-muted-foreground" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground mb-2 block",
							children: "Which request takes priority?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroup, {
							value: chosen ?? "",
							onValueChange: (v) => setSelectedReq((p) => ({
								...p,
								[c.key]: v
							})),
							className: "grid grid-cols-1 md:grid-cols-2 gap-2",
							children: c.items.map((r) => {
								const priority = r.status === "approved" ? "High" : "Medium";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									htmlFor: `${c.key}-${r._id}`,
									className: "cursor-pointer rounded-xl border border-border bg-background/40 p-3.5 flex items-start gap-3 hover:bg-accent/40 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:ring-1 has-[:checked]:ring-primary/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadioGroupItem, {
										value: r._id,
										id: `${c.key}-${r._id}`,
										className: "mt-0.5"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 flex-wrap",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm font-medium",
													children: r.purpose || "Resource booking"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: priority === "High" ? "destructive" : "outline",
													className: priority === "Medium" ? "border-warning/40 text-warning" : "",
													children: priority
												}),
												r.status === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "text-[10px]",
													children: "Already approved"
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground mt-0.5",
											children: [
												r.user?.name ?? "Unknown",
												" · ",
												r.user?.role?.replace(/_/g, " ") ?? "—",
												" · requested ",
												timeAgo(r.createdAt)
											]
										})]
									})]
								}, r._id);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `reason-${c.key}`,
								className: "text-xs",
								children: "Administrative Override Justification Reason"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: `reason-${c.key}`,
								placeholder: "Document the rationale for this override — captured in the immutable audit log.",
								value: reason,
								onChange: (e) => setReasons((p) => ({
									...p,
									[c.key]: e.target.value
								})),
								rows: 3,
								className: "mt-1.5 bg-input/40"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground mt-1",
								children: [
									"Min. 12 characters · ",
									reason.length,
									" entered"
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => {
									setReasons((p) => ({
										...p,
										[c.key]: ""
									}));
									setSelectedReq((p) => ({
										...p,
										[c.key]: ""
									}));
								},
								children: "Reset"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: !canExecute || executing === c.key,
								onClick: () => execute(c.key),
								children: executing === c.key ? "Executing…" : "Execute Override"
							})]
						})
					]
				})]
			}, c.key);
		})]
	})] });
}
function cnRisk(n) {
	return n > 0 ? "bg-card/60 ring-1 ring-warning/30" : "bg-card/60";
}
//#endregion
export { ConflictsPage as component };
