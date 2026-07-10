import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as can, f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { R as Lightbulb, bt as CalendarRange, ft as ChevronRight, lt as CircleCheck, n as Wrench, pt as ChevronLeft, ut as CircleAlert } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as getResourceAvailability, n as createBooking } from "./bookings-BMnMGXf-.mjs";
import { i as getResources } from "./resources-CdRZ6Kye.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.schedule-DRhVjpYj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var HOURS = [
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00"
];
function mondayOf(d) {
	const nd = new Date(d);
	const day = nd.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	nd.setDate(nd.getDate() + diff);
	nd.setHours(0, 0, 0, 0);
	return nd;
}
function addDays(d, n) {
	const nd = new Date(d);
	nd.setDate(nd.getDate() + n);
	return nd;
}
function ymd(d) {
	return d.toISOString().slice(0, 10);
}
function atTime(day, hhmm) {
	const [h, m] = hhmm.split(":").map(Number);
	const nd = new Date(day);
	nd.setHours(h, m, 0, 0);
	return nd;
}
function fmtDay(d) {
	return d.toLocaleDateString(void 0, {
		weekday: "short",
		day: "numeric",
		month: "short"
	});
}
var SCHEDULABLE_TYPES = ["lab", "general"];
function SchedulePage() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const canBook = can(user?.role, "action:bookResource");
	const { data: allResources = [], isLoading: loadingResources } = useQuery({
		queryKey: ["resources", "schedulable"],
		queryFn: () => getResources()
	});
	const resources = (0, import_react.useMemo)(() => allResources.filter((r) => SCHEDULABLE_TYPES.includes(String(r.type))), [allResources]);
	const [resourceId, setResourceId] = (0, import_react.useState)("");
	const resource = resources.find((r) => r._id === resourceId) ?? resources[0];
	const effectiveResourceId = resourceId || resources[0]?._id || "";
	const [weekOffset, setWeekOffset] = (0, import_react.useState)(0);
	const days = (0, import_react.useMemo)(() => {
		const monday = addDays(mondayOf(/* @__PURE__ */ new Date()), weekOffset * 7);
		return Array.from({ length: 5 }, (_, i) => addDays(monday, i));
	}, [weekOffset]);
	const weekStart = ymd(days[0]);
	const weekEnd = ymd(addDays(days[4], 1));
	const { data: availability = [], isLoading: loadingAvailability } = useQuery({
		queryKey: [
			"availability",
			effectiveResourceId,
			weekStart,
			weekEnd
		],
		queryFn: () => getResourceAvailability(effectiveResourceId, weekStart, weekEnd),
		enabled: !!effectiveResourceId
	});
	const underMaintenance = resource && resource.status !== "available";
	const grid = (0, import_react.useMemo)(() => {
		const g = days.map(() => HOURS.map(() => "free"));
		availability.forEach((slot) => {
			const s = new Date(slot.startTime);
			const e = new Date(slot.endTime);
			days.forEach((day, di) => {
				const dayEnd = addDays(day, 1);
				if (e <= day || s >= dayEnd) return;
				HOURS.forEach((h, hi) => {
					const cellStart = atTime(day, h);
					const cellEnd = new Date(cellStart.getTime() + 3600 * 1e3);
					if (s < cellEnd && e > cellStart) g[di][hi] = slot.status === "pending" && g[di][hi] !== "booked" ? "pending" : "booked";
				});
			});
		});
		return g;
	}, [availability, days]);
	const [dayIndex, setDayIndex] = (0, import_react.useState)(0);
	const [start, setStart] = (0, import_react.useState)("09:00");
	const [end, setEnd] = (0, import_react.useState)("11:00");
	const [purpose, setPurpose] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [lastSubmitted, setLastSubmitted] = (0, import_react.useState)(null);
	const conflict = (0, import_react.useMemo)(() => {
		const sIdx = HOURS.indexOf(start);
		const eIdx = HOURS.indexOf(end);
		if (sIdx < 0 || eIdx <= sIdx) return null;
		const clashHours = [];
		for (let h = sIdx; h < eIdx; h++) if (grid[dayIndex]?.[h] !== "free") clashHours.push(HOURS[h]);
		return clashHours.length ? { hours: clashHours } : null;
	}, [
		start,
		end,
		grid,
		dayIndex
	]);
	const suggestions = (0, import_react.useMemo)(() => {
		const len = HOURS.indexOf(end) - HOURS.indexOf(start);
		if (len <= 0) return [];
		const out = [];
		for (let di = 0; di < days.length && out.length < 3; di++) for (let h = 0; h + len <= HOURS.length && out.length < 3; h++) if (Array.from({ length: len }).every((_, k) => grid[di]?.[h + k] === "free")) out.push({
			dayIdx: di,
			start: HOURS[h],
			end: HOURS[h + len]
		});
		return out;
	}, [
		grid,
		days,
		start,
		end
	]);
	const submit = async (e) => {
		e.preventDefault();
		if (conflict || !canBook || !effectiveResourceId || underMaintenance) return;
		setSubmitting(true);
		try {
			const day = days[dayIndex];
			await createBooking({
				resource: effectiveResourceId,
				startTime: atTime(day, start).toISOString(),
				endTime: atTime(day, end).toISOString(),
				purpose: purpose.trim() || "Resource booking"
			});
			const label = `${fmtDay(day)} · ${start}–${end}`;
			toast.success(`Booking request submitted`, { description: `${resource?.name ?? "Resource"} · ${label}` });
			setLastSubmitted(label);
			setPurpose("");
			queryClient.invalidateQueries({ queryKey: ["availability", effectiveResourceId] });
		} catch (err) {
			toast.error(err instanceof ApiError ? err.message : "Failed to submit booking request");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Master Schedule",
		subtitle: "Live availability across every campus resource"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "bg-card/60 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { className: "h-4 w-4 text-primary" }), " Availability Matrix"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						resource?.name ?? (loadingResources ? "Loading…" : "No schedulable resources"),
						" · ",
						fmtDay(days[0]),
						" – ",
						fmtDay(days[4])
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-[11px] text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-3 rounded-sm bg-primary/80" }), "Booked"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-3 rounded-sm [background-image:repeating-linear-gradient(45deg,oklch(0.6_0.14_60)_0_3px,transparent_3px_6px)]" }), "Pending"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-3 rounded-sm bg-background border border-border" }), "Available"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-3 rounded-sm [background-image:repeating-linear-gradient(45deg,oklch(0.78_0.16_75)_0_3px,transparent_3px_6px)]" }), "Maintenance"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "overflow-x-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: effectiveResourceId,
							onValueChange: setResourceId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "w-56",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingResources ? "Loading…" : "Select resource" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: resources.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: r._id,
								children: r.name
							}, r._id)) })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "icon",
									variant: "outline",
									className: "h-7 w-7",
									onClick: () => setWeekOffset((w) => w - 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" })
								}),
								weekOffset !== 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setWeekOffset(0),
									className: "text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2",
									children: "This week"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "icon",
									variant: "outline",
									className: "h-7 w-7",
									onClick: () => setWeekOffset((w) => w + 1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })
								})
							]
						})]
					}),
					underMaintenance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-center gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-warning shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							resource?.name,
							" is currently under maintenance",
							resource?.maintenanceNote ? ` — ${resource.maintenanceNote}` : "",
							". Bookings are disabled until it's cleared."
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-[640px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[90px_repeat(10,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground mb-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}), HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center",
									children: h
								}, h))]
							}),
							days.map((d, di) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[90px_repeat(10,minmax(0,1fr))] gap-1 mb-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDayIndex(di),
									className: cn("text-xs font-medium self-center text-left px-1 rounded-md", di === dayIndex ? "text-primary" : "text-muted-foreground hover:text-foreground"),
									children: fmtDay(d)
								}), (underMaintenance ? HOURS.map(() => "maintenance") : grid[di] ?? HOURS.map(() => "free")).map((cell, hi) => {
									const inSel = di === dayIndex && hi >= HOURS.indexOf(start) && hi < HOURS.indexOf(end);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-9 rounded-md border transition-all", cell === "booked" && "bg-primary/80 border-primary", cell === "pending" && "border-warning/50 [background-image:repeating-linear-gradient(45deg,oklch(0.6_0.14_60_/_0.35)_0_4px,transparent_4px_8px)]", cell === "maintenance" && "border-warning/40 [background-image:repeating-linear-gradient(45deg,oklch(0.78_0.16_75_/_0.4)_0_4px,transparent_4px_8px)]", cell === "free" && "bg-background/30 border-border hover:bg-accent/40", inSel && cell === "free" && "ring-2 ring-success/70 bg-success/10 border-success/60", inSel && cell !== "free" && "ring-2 ring-destructive/80") }, hi);
								})]
							}, di)),
							loadingAvailability && !underMaintenance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground text-center py-2",
								children: "Loading availability…"
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "bg-card/60 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Request a resource"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Live conflict detection runs as you type"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Resource" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: effectiveResourceId,
							onValueChange: setResourceId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: loadingResources ? "Loading…" : "Select resource" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: resources.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: r._id,
								children: r.name
							}, r._id)) })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: String(dayIndex),
									onValueChange: (v) => setDayIndex(Number(v)),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: days.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: String(i),
										children: fmtDay(d)
									}, i)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: start,
									onValueChange: setStart,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: h,
										children: h
									}, h)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: end,
									onValueChange: setEnd,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: h,
										children: h
									}, h)) })]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Purpose" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: purpose,
							onChange: (e) => setPurpose(e.target.value),
							placeholder: "e.g. CS-401 lecture · 84 students"
						})]
					}),
					underMaintenance ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-warning/40 bg-warning/10 p-3.5 flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-warning mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "This resource is under maintenance and can't be booked right now."
						})]
					}) : conflict ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4 text-destructive mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-destructive",
									children: "Scheduling conflict"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-foreground/80",
									children: [
										resource?.name,
										" is unavailable ",
										fmtDay(days[dayIndex]),
										" at ",
										conflict.hours.join(", "),
										" — overlaps an existing booking."
									]
								})]
							})]
						}), suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-3 w-3" }), " Suggested alternative slots"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: suggestions.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setDayIndex(s.dayIdx);
									setStart(s.start);
									setEnd(s.end);
								},
								className: "text-[11px] px-2.5 py-1 rounded-md bg-background/70 border border-border hover:border-primary hover:bg-primary/10",
								children: [
									fmtDay(days[s.dayIdx]),
									" · ",
									s.start,
									"–",
									s.end
								]
							}, i))
						})] })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-success/30 bg-success/10 p-3 flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-success mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "Slot is clear. Submitting will create a pending booking request."
						})]
					}),
					!canBook && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground italic",
						children: "Students view the schedule in read-only mode — switch to Faculty or Admin via the Role Simulator to request resources."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: !canBook || !!conflict || !effectiveResourceId || underMaintenance || submitting,
						children: submitting ? "Submitting…" : "Submit booking request"
					}),
					lastSubmitted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "border-success/40 text-success",
						children: [
							"Booking queued · ",
							resource?.name,
							" ",
							lastSubmitted
						]
					})
				]
			}) })]
		})]
	})] });
}
//#endregion
export { SchedulePage as component };
