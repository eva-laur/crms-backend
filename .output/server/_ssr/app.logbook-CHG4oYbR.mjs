import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { c as can, f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as LoaderCircle, Tt as BookOpen, a as UserPlus, d as Trash2, lt as CircleCheck, r as Users, ut as CircleAlert, w as Plus } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as enrollStudent, c as getCourses, d as markAttendance, f as unenrollStudent, i as createResult, l as getResults, n as createAttendance, o as getAttendance, p as updateAssessmentResult, r as createCourse, s as getAttendanceByCourse, t as addAssessmentResult, u as getResultsByCourse } from "./academic-ThiXMN6N.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { r as lookupUserByMatricule } from "./users-BpEolhg7.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.logbook-CHG4oYbR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LogbookPage() {
	const { user } = useRole();
	if (!user) return null;
	if (can(user.role, "action:logAttendance")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacultyLogbook, {});
	if (can(user.role, "nav:logbook")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentLogbook, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
}
var STATUS_LABEL = {
	P: "present",
	L: "late",
	A: "absent"
};
var CA_TITLE = "Continuous Assessment";
function FacultyLogbook() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const { data: allCourses = [], isLoading: loadingCourses } = useQuery({
		queryKey: ["courses", "all"],
		queryFn: getCourses
	});
	const myCourses = (0, import_react.useMemo)(() => allCourses.filter((c) => (c.lecturer?._id ?? c.lecturer) === user?._id), [allCourses, user]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!courseId && myCourses[0]) setCourseId(myCourses[0]._id);
	}, [myCourses, courseId]);
	const course = myCourses.find((c) => c._id === courseId);
	const roster = course?.students ?? [];
	const { data: sessions = [] } = useQuery({
		queryKey: [
			"attendance",
			"course",
			course?._id
		],
		queryFn: () => getAttendanceByCourse(course._id),
		enabled: !!course?._id
	});
	const { data: results = [] } = useQuery({
		queryKey: [
			"results",
			"course",
			course?._id
		],
		queryFn: () => getResultsByCourse(course._id),
		enabled: !!course?._id
	});
	const resultByStudent = (0, import_react.useMemo)(() => {
		const m = {};
		results.forEach((r) => {
			m[r.student?._id ?? r.student] = r;
		});
		return m;
	}, [results]);
	const [currentSession, setCurrentSession] = (0, import_react.useState)({});
	const [committing, setCommitting] = (0, import_react.useState)(false);
	const [marks, setMarks] = (0, import_react.useState)({});
	const [savingMark, setSavingMark] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setCurrentSession({});
	}, [courseId]);
	(0, import_react.useEffect)(() => {
		setMarks((prev) => {
			const next = { ...prev };
			roster.forEach((s) => {
				if (next[s._id] === void 0) {
					const ca = resultByStudent[s._id]?.assessments?.find((a) => a.title === CA_TITLE);
					next[s._id] = ca?.score ?? 14;
				}
			});
			return next;
		});
	}, [resultByStudent, courseId]);
	/** Attendance score = 20 - 2*absent - 1*late across every real committed
	*  session for this course, plus today's not-yet-committed pick. */
	const attendanceScore = (studentId) => {
		let score = 20;
		sessions.forEach((session) => {
			const rec = (session.records ?? []).find((r) => (r.student?._id ?? r.student) === studentId);
			if (rec?.status === "absent") score -= 2;
			else if (rec?.status === "late") score -= 1;
		});
		const today = currentSession[studentId];
		if (today === "A") score -= 2;
		else if (today === "L") score -= 1;
		return Math.max(0, score);
	};
	const tally = (0, import_react.useMemo)(() => {
		const t = {
			P: 0,
			A: 0,
			L: 0,
			none: 0
		};
		roster.forEach((s) => {
			const v = currentSession[s._id];
			if (v === "P") t.P++;
			else if (v === "A") t.A++;
			else if (v === "L") t.L++;
			else t.none++;
		});
		return t;
	}, [currentSession, roster]);
	const commitSession = async () => {
		if (!course || roster.length === 0) return;
		setCommitting(true);
		try {
			const created = await createAttendance({ course: course._id });
			for (const s of roster) {
				const v = currentSession[s._id] ?? "A";
				await markAttendance(created._id, {
					student: s._id,
					status: STATUS_LABEL[v]
				});
			}
			toast.success(`Session recorded · ${course.courseCode}`);
			setCurrentSession({});
			queryClient.invalidateQueries({ queryKey: [
				"attendance",
				"course",
				course._id
			] });
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to record session");
		} finally {
			setCommitting(false);
		}
	};
	const saveMark = async (studentId, value) => {
		if (!course) return;
		setSavingMark(studentId);
		try {
			let result = resultByStudent[studentId];
			if (!result) result = await createResult({
				student: studentId,
				course: course._id
			});
			const existing = result.assessments?.find((a) => a.title === CA_TITLE);
			if (existing) await updateAssessmentResult(result._id, existing._id, { score: value });
			else await addAssessmentResult(result._id, {
				title: CA_TITLE,
				type: "test",
				score: value,
				totalMarks: 20
			});
			queryClient.invalidateQueries({ queryKey: [
				"results",
				"course",
				course._id
			] });
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to save mark");
		} finally {
			setSavingMark(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Academic Logbook",
		subtitle: "Record attendance and CA marks — roster scoped to selected course's enrolled students"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourseManagementPanel, {}), loadingCourses ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground py-6 text-center",
			children: "Loading…"
		}) : !course ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "py-10 text-center text-sm text-muted-foreground",
			children: "Create a course above to begin taking attendance and recording marks."
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid sm:grid-cols-[1fr_auto] gap-3 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "text-xs text-muted-foreground",
					children: "Course"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: course._id,
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
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 text-[11px] items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-success/40 text-success",
						children: ["Present · ", tally.P]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-warning/40 text-warning",
						children: ["Late · ", tally.L]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-destructive/40 text-destructive",
						children: ["Absent · ", tally.A]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["Unmarked · ", tally.none]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: commitSession,
						disabled: committing || roster.length === 0,
						className: "ml-2 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50",
						children: committing ? "Saving…" : "Commit session"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4 text-primary" }),
				" Class roster — ",
				course.courseCode,
				" · ",
				course.title
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted-foreground",
			children: [roster.length, " enrolled students · attendance score starts at 20 and decrements by 2 (Absent) / 1 (Late)"]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[720px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-3 sm:px-5 py-2.5 font-medium",
							children: "Student"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-3 py-2.5 font-medium",
							children: "Matricule"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-center px-3 py-2.5 font-medium",
							children: "Attendance (today)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-3 py-2.5 font-medium w-28",
							children: "Attend /20"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-3 sm:px-5 py-2.5 font-medium w-28",
							children: "CA /20"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [roster.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "text-center py-6 text-muted-foreground",
					children: "No students enrolled — use \"Manage students\" above to add some."
				}) }), roster.map((s, idx) => {
					const cur = currentSession[s._id] ?? null;
					const score = attendanceScore(s._id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: cn(idx % 2 === 0 ? "bg-transparent" : "bg-background/20", "border-b border-border/60"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 sm:px-5 py-3 font-medium",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 font-mono text-[11px] text-muted-foreground",
								children: s.matricule ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex justify-center gap-1.5",
									children: [
										"P",
										"L",
										"A"
									].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrentSession((p) => ({
											...p,
											[s._id]: cur === opt ? null : opt
										})),
										className: cn("h-7 px-2 text-[11px] font-semibold rounded-md border transition-all", opt === "P" && cur === "P" && "bg-success/20 border-success/60 text-success", opt === "L" && cur === "L" && "bg-warning/20 border-warning/60 text-warning", opt === "A" && cur === "A" && "bg-destructive/20 border-destructive/60 text-destructive", cur !== opt && "border-border text-muted-foreground hover:bg-accent/40"),
										children: opt === "P" ? "Present" : opt === "L" ? "Late" : "Absent"
									}, opt))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono font-semibold", score >= 16 ? "text-success" : score >= 10 ? "text-warning" : "text-destructive"),
									children: score
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 sm:px-5 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 0,
										max: 20,
										value: marks[s._id] ?? 14,
										onChange: (e) => setMarks((p) => ({
											...p,
											[s._id]: Math.max(0, Math.min(20, Number(e.target.value) || 0))
										})),
										onBlur: (e) => saveMark(s._id, Math.max(0, Math.min(20, Number(e.target.value) || 0))),
										disabled: savingMark === s._id,
										className: "h-8 text-right pr-6"
									}), savingMark === s._id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3 w-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" })]
								})
							})
						]
					}, s._id);
				})] })]
			})
		})] })] })]
	})] });
}
var emptyCourseForm = {
	courseCode: "",
	title: "",
	description: "",
	semester: "",
	academicYear: ""
};
function CourseManagementPanel() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const { data: allCourses = [], isLoading } = useQuery({
		queryKey: ["courses", "all"],
		queryFn: getCourses
	});
	const myCourses = allCourses.filter((c) => (c.lecturer?._id ?? c.lecturer) === user?._id);
	const refresh = () => queryClient.invalidateQueries({ queryKey: ["courses"] });
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(emptyCourseForm);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const submitCreate = async () => {
		if (!form.courseCode.trim() || !form.title.trim() || !form.semester.trim() || !form.academicYear.trim()) {
			toast.error("Course code, title, semester and academic year are required");
			return;
		}
		setCreating(true);
		try {
			await createCourse(form);
			toast.success(`${form.courseCode.toUpperCase()} created`);
			setForm(emptyCourseForm);
			setCreateOpen(false);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to create course");
		} finally {
			setCreating(false);
		}
	};
	const [manageId, setManageId] = (0, import_react.useState)(null);
	const manageCourse = myCourses.find((c) => c._id === manageId) ?? null;
	const [matricule, setMatricule] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const addStudent = async () => {
		if (!manageCourse || !matricule.trim()) return;
		setBusy(true);
		try {
			const found = await lookupUserByMatricule(matricule.trim());
			if (found.role !== "student") {
				toast.error(`${found.name} is registered as ${found.role}, not a student`);
				return;
			}
			await enrollStudent(manageCourse._id, found._id);
			toast.success(`${found.name} enrolled in ${manageCourse.courseCode}`);
			setMatricule("");
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Student not found");
		} finally {
			setBusy(false);
		}
	};
	const removeStudent = async (studentId, name) => {
		if (!manageCourse) return;
		try {
			await unenrollStudent(manageCourse._id, studentId);
			toast.success(`${name} removed from ${manageCourse.courseCode}`);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to remove student");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-4 w-4 text-primary" }), " My Courses"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Create the courses you teach and manage who's enrolled"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: createOpen,
				onOpenChange: (o) => {
					setCreateOpen(o);
					if (!o) setForm(emptyCourseForm);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New course"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create a course" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.courseCode,
											onChange: (e) => setForm((f) => ({
												...f,
												courseCode: e.target.value
											})),
											placeholder: "CS-401"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Semester" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.semester,
											onChange: (e) => setForm((f) => ({
												...f,
												semester: e.target.value
											})),
											placeholder: "Fall 2026"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.title,
										onChange: (e) => setForm((f) => ({
											...f,
											title: e.target.value
										})),
										placeholder: "Distributed Systems"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Academic year" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.academicYear,
										onChange: (e) => setForm((f) => ({
											...f,
											academicYear: e.target.value
										})),
										placeholder: "2026/2027"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Description ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-normal",
										children: "(optional)"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: form.description,
										onChange: (e) => setForm((f) => ({
											...f,
											description: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setCreateOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submitCreate,
							disabled: creating,
							children: creating ? "Creating…" : "Create course"
						})] })
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground py-6 text-center",
			children: "Loading…"
		}) : myCourses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground py-6 text-center",
			children: "You haven't created any courses yet — click \"New course\" to add one."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-3 flex items-center justify-between gap-3 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium",
						children: [
							c.courseCode,
							" · ",
							c.title
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground",
						children: [
							c.semester,
							" · ",
							c.academicYear,
							" · ",
							c.students?.length ?? 0,
							" enrolled"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "gap-1.5",
					onClick: () => setManageId(c._id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }), " Manage students"]
				})]
			}, c._id))
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!manageCourse,
			onOpenChange: (o) => {
				if (!o) {
					setManageId(null);
					setMatricule("");
				}
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "sm:max-w-lg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
						manageCourse?.courseCode,
						" · ",
						manageCourse?.title,
						" — roster"
					] }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: matricule,
							onChange: (e) => setMatricule(e.target.value),
							placeholder: "Student matricule",
							onKeyDown: (e) => {
								if (e.key === "Enter") addStudent();
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: addStudent,
							disabled: busy || !matricule.trim(),
							className: "gap-1.5 shrink-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }),
								" ",
								busy ? "Adding…" : "Add"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "divide-y divide-border max-h-72 overflow-auto mt-2",
						children: [(manageCourse?.students ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground py-6 text-center",
							children: "No students enrolled yet."
						}), (manageCourse?.students ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-2.5 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: s.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground truncate",
									children: s.email
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0",
								onClick: () => removeStudent(s._id, s.name),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						}, s._id))]
					})
				]
			})
		})
	] });
}
function gradeTone(grade) {
	if (grade === "A" || grade === "B") return "border-success/40 text-success";
	if (grade === "C" || grade === "D") return "border-warning/40 text-warning";
	return "border-destructive/40 text-destructive";
}
function StudentLogbook() {
	const { user } = useRole();
	const { data: results = [], isLoading: loadingResults } = useQuery({
		queryKey: ["results", "mine"],
		queryFn: getResults,
		enabled: !!user
	});
	const { data: sessions = [], isLoading: loadingAttendance } = useQuery({
		queryKey: ["attendance", "mine"],
		queryFn: getAttendance,
		enabled: !!user
	});
	const courseMap = (0, import_react.useMemo)(() => {
		const m = /* @__PURE__ */ new Map();
		results.forEach((r) => {
			if (r.course?._id) m.set(r.course._id, r.course);
		});
		sessions.forEach((s) => {
			if (s.course?._id && !m.has(s.course._id)) m.set(s.course._id, s.course);
		});
		return m;
	}, [results, sessions]);
	const perCourseAttendance = (0, import_react.useMemo)(() => {
		const map = {};
		if (!user) return map;
		sessions.forEach((session) => {
			const cid = session.course?._id ?? session.course;
			if (!cid) return;
			const rec = (session.records ?? []).find((r) => (r.student?._id ?? r.student) === user._id);
			if (!rec) return;
			if (!map[cid]) map[cid] = {
				present: 0,
				late: 0,
				absent: 0,
				total: 0
			};
			map[cid].total++;
			if (rec.status === "present") map[cid].present++;
			else if (rec.status === "late") map[cid].late++;
			else if (rec.status === "absent") map[cid].absent++;
		});
		return map;
	}, [sessions, user]);
	if (!user) return null;
	const attendanceRows = Array.from(courseMap.values()).map((course) => {
		const a = perCourseAttendance[course._id];
		return {
			course,
			pct: a && a.total > 0 ? Math.round((a.present + a.late * .5) / a.total * 100) : null
		};
	}).filter((r) => r.pct !== null);
	const overall = attendanceRows.length ? Math.round(attendanceRows.reduce((s, r) => s + r.pct, 0) / attendanceRows.length) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "My Academic Logbook",
		subtitle: "Personal attendance and assessment record"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: user.name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground font-mono",
			children: user.matricule
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-5",
			children: loadingAttendance ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground py-6 text-center",
				children: "Loading…"
			}) : overall === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground py-6 text-center",
				children: "No attendance sessions recorded yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs mb-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Overall attendance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: [overall, "%"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-3 rounded-full bg-background overflow-hidden border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full rounded-full bg-primary",
						style: { width: `${overall}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5",
					children: overall >= 75 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-success" }), " Above 75% threshold required to sit final exams."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-3 w-3 text-destructive" }), " Below the 75% threshold required to sit final exams."] })
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground",
					children: "Per-course attendance"
				}), attendanceRows.map(({ course, pct }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [
							course.courseCode,
							" · ",
							course.title
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [pct, "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: pct,
					className: "h-1.5"
				})] }, course._id))]
			})] })
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Official grade breakdown"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Continuous assessment vs. exam, per enrolled course"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-0 overflow-x-auto",
			children: loadingResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground py-6 text-center",
				children: "Loading…"
			}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground py-6 text-center",
				children: "No results published yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm min-w-[480px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-[11px] uppercase tracking-wider text-muted-foreground bg-background/40 border-y border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-5 py-2.5 font-medium",
							children: "Course"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-3 py-2.5 font-medium",
							children: "CA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-3 py-2.5 font-medium",
							children: "Exam"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-3 py-2.5 font-medium",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-5 py-2.5 font-medium",
							children: "Grade"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: results.map((r, i) => {
					const assessments = r.assessments ?? [];
					const ca = assessments.filter((a) => a.type !== "exam");
					const exam = assessments.filter((a) => a.type === "exam");
					const caScore = ca.reduce((s, a) => s + a.score, 0);
					const caTotal = ca.reduce((s, a) => s + a.totalMarks, 0);
					const examScore = exam.reduce((s, a) => s + a.score, 0);
					const examTotal = exam.reduce((s, a) => s + a.totalMarks, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: cn(i % 2 === 0 ? "bg-transparent" : "bg-background/20", "border-b border-border/60"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 font-medium",
								children: [
									r.course?.courseCode,
									" · ",
									r.course?.title
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-mono",
								children: caTotal > 0 ? `${caScore}/${caTotal}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3 text-right font-mono",
								children: examTotal > 0 ? `${examScore}/${examTotal}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-3 py-3 text-right font-mono font-semibold",
								children: [r.finalScore, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: gradeTone(r.grade),
									children: r.grade
								})
							})
						]
					}, r._id);
				}) })]
			})
		})] })]
	})] });
}
//#endregion
export { LogbookPage as component };
