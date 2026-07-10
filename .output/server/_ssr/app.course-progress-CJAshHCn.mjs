import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, s as apiRequest, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as ListChecks, d as Trash2, lt as CircleCheck, w as Plus } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as getCourses } from "./academic-ThiXMN6N.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.course-progress-CJAshHCn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getLogbookByCourse = (courseId) => apiRequest(`/logbooks/course/${courseId}`);
var createLogbook = (input) => apiRequest("/logbooks", {
	method: "POST",
	body: input
});
var addOutlineTopic = (id, input) => apiRequest(`/logbooks/${id}/outline`, {
	method: "POST",
	body: input
});
var updateOutlineStatus = (id, topicId, status) => apiRequest(`/logbooks/${id}/outline/${topicId}/status`, {
	method: "PATCH",
	body: { status }
});
var deleteOutlineTopic = (id, topicId) => apiRequest(`/logbooks/${id}/outline/${topicId}`, { method: "DELETE" });
function ProgressPage() {
	const { user, can } = useRole();
	if (!can("nav:courseProgress")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressInner, {
		userId: user._id ?? "",
		role: user.role,
		canEdit: can("action:editSyllabus")
	});
}
function ProgressInner({ userId, role, canEdit }) {
	const queryClient = useQueryClient();
	const { data: allCourses = [], isLoading: loadingCourses } = useQuery({
		queryKey: ["courses", "all"],
		queryFn: getCourses
	});
	const myCourses = (0, import_react.useMemo)(() => {
		if (role === "faculty") return allCourses.filter((c) => (c.lecturer?._id ?? c.lecturer) === userId);
		if (role === "student") return allCourses.filter((c) => (c.students ?? []).some((s) => (s._id ?? s) === userId));
		return allCourses;
	}, [
		allCourses,
		role,
		userId
	]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!courseId && myCourses[0]) setCourseId(myCourses[0]._id);
	}, [myCourses, courseId]);
	const course = myCourses.find((c) => c._id === courseId);
	const { data: logbooks = [], isLoading: loadingLogbook } = useQuery({
		queryKey: [
			"logbooks",
			"course",
			course?._id
		],
		queryFn: () => getLogbookByCourse(course._id),
		enabled: !!course?._id
	});
	const logbook = logbooks[0];
	const items = logbook?.outline ?? [];
	const covered = items.filter((i) => i.status === "covered").length;
	const pct = items.length ? Math.round(covered / items.length * 100) : 0;
	const refresh = () => queryClient.invalidateQueries({ queryKey: [
		"logbooks",
		"course",
		course?._id
	] });
	const [creating, setCreating] = (0, import_react.useState)(false);
	const ensureLogbook = async () => {
		if (!course) return;
		setCreating(true);
		try {
			await createLogbook({
				course: course._id,
				academicYear: course.academicYear,
				semester: course.semester
			});
			toast.success("Syllabus tracker created");
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to create syllabus tracker");
		} finally {
			setCreating(false);
		}
	};
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		week: 1,
		title: "",
		description: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const addLesson = async () => {
		if (!logbook) return;
		if (!form.title.trim()) {
			toast.error("Title required");
			return;
		}
		setSaving(true);
		try {
			await addOutlineTopic(logbook._id, {
				week: form.week,
				title: form.title.trim(),
				description: form.description.trim() || void 0
			});
			toast.success("Lesson added");
			setOpen(false);
			setForm({
				week: form.week + 1,
				title: "",
				description: ""
			});
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to add lesson");
		} finally {
			setSaving(false);
		}
	};
	const [togglingId, setTogglingId] = (0, import_react.useState)(null);
	const toggle = async (topic) => {
		if (!logbook) return;
		setTogglingId(topic._id);
		try {
			const next = topic.status === "covered" ? "pending" : "covered";
			await updateOutlineStatus(logbook._id, topic._id, next);
			toast.success(next === "covered" ? "Marked covered" : "Marked pending");
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to update");
		} finally {
			setTogglingId(null);
		}
	};
	const removeLesson = async (topic) => {
		if (!logbook) return;
		try {
			await deleteOutlineTopic(logbook._id, topic._id);
			toast.success("Removed");
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to remove");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Course Progress",
		subtitle: canEdit ? "Track lectures covered after each session" : "Track what your lecturer has covered to date"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 space-y-5",
		children: loadingCourses ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground text-center py-10",
			children: "Loading…"
		}) : myCourses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "No courses to show progress for yet."
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid sm:grid-cols-[1fr_auto] gap-3 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: course?._id ?? "",
					onValueChange: setCourseId,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: c._id,
						children: [
							c.courseCode,
							" · ",
							c.title
						]
					}, c._id)) })]
				})]
			}), canEdit && logbook && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add lesson"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add a syllabus lesson" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Week #" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "number",
									min: 1,
									value: form.week,
									onChange: (e) => setForm({
										...form,
										week: Math.max(1, Number(e.target.value) || 1)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lesson title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: addLesson,
						disabled: saving,
						children: saving ? "Adding…" : "Add lesson"
					}) })
				] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4 text-primary" }),
					" ",
					course?.courseCode,
					" · ",
					course?.title
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: loadingLogbook ? "Loading…" : logbook ? `${covered} of ${items.length} lessons covered` : "No syllabus tracker yet for this course"
			})] }), logbook && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: pct,
					className: "h-2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[10px] text-muted-foreground mt-1 text-right",
					children: [pct, "%"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0",
			children: loadingLogbook ? null : !logbook ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mb-3",
					children: "This course doesn't have a syllabus tracker yet."
				}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: ensureLogbook,
					disabled: creating,
					children: creating ? "Creating…" : "Create syllabus tracker"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "divide-y divide-border",
				children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-5 py-6 text-sm text-muted-foreground text-center",
					children: "No syllabus items yet."
				}), items.slice().sort((a, b) => a.week - b.week).map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "px-3 sm:px-5 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: !canEdit || togglingId === it._id,
							onClick: () => toggle(it),
							className: `h-7 w-7 rounded-md border flex items-center justify-center ${it.status === "covered" ? "bg-success/15 border-success text-success" : "border-border"}`,
							"aria-label": "Toggle covered",
							children: it.status === "covered" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: `text-sm font-medium truncate ${it.status === "covered" ? "line-through text-muted-foreground" : ""}`,
								children: [
									"Week ",
									it.week,
									" · ",
									it.title
								]
							}), it.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: it.description
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: it.status === "covered" ? "border-success/40 text-success" : "border-warning/40 text-warning",
								children: it.status === "covered" ? "Covered" : it.status === "partially_covered" ? "Partial" : "Pending"
							}), canEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "h-7 w-7 text-destructive",
								onClick: () => removeLesson(it),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						})
					]
				}, it._id))]
			})
		})] })] })
	})] });
}
//#endregion
export { ProgressPage as component };
