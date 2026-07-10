import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as TriangleAlert, yt as CalendarX } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as getCourses } from "./academic-ThiXMN6N.mjs";
import { n as createCancellation, o as getCancellations } from "./coursework-HLqxs39D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.cancellations-vCQUGCS2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIME_SLOTS = [
	"08:00–10:00",
	"10:00–12:00",
	"12:00–14:00",
	"14:00–16:00",
	"16:00–18:00"
];
function CancellationsPage() {
	const { user, can } = useRole();
	if (!can("nav:cancellations") && user?.role !== "student") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	const canCancel = can("action:cancelClass");
	const queryClient = useQueryClient();
	const { data: cancellations = [], isLoading } = useQuery({
		queryKey: ["cancellations"],
		queryFn: getCancellations
	});
	const { data: courses = [] } = useQuery({
		queryKey: ["courses"],
		queryFn: getCourses
	});
	const myCourses = (0, import_react.useMemo)(() => user.role === "faculty" ? courses.filter((c) => c.lecturer?._id === user._id) : courses, [courses, user]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [slot, setSlot] = (0, import_react.useState)(TIME_SLOTS[0]);
	const [reason, setReason] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const activeCourseId = courseId || myCourses[0]?._id || "";
	const submit = async () => {
		if (!activeCourseId) return toast.error("No course available to cancel");
		if (!reason.trim()) return toast.error("Provide a reason");
		setSubmitting(true);
		try {
			const created = await createCancellation({
				course: activeCourseId,
				date,
				timeSlot: slot,
				reason: reason.trim()
			});
			queryClient.invalidateQueries({ queryKey: ["cancellations"] });
			toast.success("Class cancellation broadcast", { description: `${created.course?.courseCode ?? ""} · ${date} · ${slot} — students notified` });
			setReason("");
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to cancel class");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Class Cancellations",
		subtitle: canCancel ? "Cancel a class on a date & time slot — concerned students are alerted" : "Cancellations affecting your enrolled courses"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-[1fr_1.3fr] gap-5",
		children: [canCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarX, { className: "h-4 w-4 text-destructive" }), " Cancel a class"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Notifies students enrolled in the course; admin is informed."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: activeCourseId,
						onValueChange: setCourseId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a course" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
							value: c._id,
							children: [
								c.courseCode,
								" · ",
								c.title
							]
						}, c._id)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Time slot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: slot,
							onValueChange: setSlot,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: TIME_SLOTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								children: s
							}, s)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 3,
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "Conference travel, illness, …"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "destructive",
					onClick: submit,
					disabled: submitting,
					children: submitting ? "Cancelling…" : "Cancel class & notify"
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: !canCancel ? "xl:col-span-2" : "",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Cancellation log"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: isLoading ? "Loading…" : `${cancellations.length} record(s)`
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "divide-y divide-border",
					children: [!isLoading && cancellations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-5 py-6 text-center text-sm text-muted-foreground",
						children: "No cancellations."
					}), cancellations.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-3 sm:px-5 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-semibold",
									children: [
										c.course?.courseCode ?? "—",
										" cancelled · ",
										c.date,
										" · ",
										c.timeSlot
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-1",
								children: c.reason
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground mt-1.5",
								children: [
									"— ",
									c.cancelledBy?.name ?? "Unknown",
									" · posted ",
									new Date(c.createdAt).toLocaleString()
								]
							})
						]
					}, c._id))]
				})
			})]
		})]
	})] });
}
//#endregion
export { CancellationsPage as component };
