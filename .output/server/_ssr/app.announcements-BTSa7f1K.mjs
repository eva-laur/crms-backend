import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { j as Megaphone, y as Send } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as getCourses } from "./academic-ThiXMN6N.mjs";
import { a as getAnnouncements, t as createAnnouncement } from "./coursework-HLqxs39D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.announcements-BTSa7f1K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AnnouncementsPage() {
	const { user, can } = useRole();
	if (!can("nav:announcements")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	const canPost = can("action:postAnnouncement");
	const queryClient = useQueryClient();
	const { data: announcements = [], isLoading } = useQuery({
		queryKey: ["announcements"],
		queryFn: getAnnouncements
	});
	const { data: courses = [] } = useQuery({
		queryKey: ["courses"],
		queryFn: getCourses
	});
	const myCourses = (0, import_react.useMemo)(() => user.role === "faculty" ? courses.filter((c) => c.lecturer?._id === user._id) : courses, [courses, user]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [posting, setPosting] = (0, import_react.useState)(false);
	const activeCourseId = courseId || myCourses[0]?._id || "";
	const submit = async () => {
		if (!activeCourseId) return toast.error("No course available to post to");
		if (!title.trim() || !body.trim()) return toast.error("Title and body required");
		setPosting(true);
		try {
			await createAnnouncement({
				course: activeCourseId,
				title: title.trim(),
				body: body.trim()
			});
			queryClient.invalidateQueries({ queryKey: ["announcements"] });
			setTitle("");
			setBody("");
			toast.success("Announcement posted");
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to post announcement");
		} finally {
			setPosting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Announcements",
		subtitle: canPost ? "Reach the class enrolled in a specific course" : "Updates from your lecturers"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-[1fr_1.4fr] gap-5",
		children: [canPost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 text-primary" }), " Compose"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Only students enrolled in the selected course will see this."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
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
						}),
						myCourses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No courses found — create one first."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: title,
						onChange: (e) => setTitle(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 5,
						value: body,
						onChange: (e) => setBody(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: submit,
					disabled: posting,
					className: "gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }),
						" ",
						posting ? "Posting…" : "Post announcement"
					]
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: !canPost ? "xl:col-span-2" : "",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Inbox"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [isLoading ? "Loading…" : `${announcements.length} announcement(s)`, user.role === "admin" ? " · admin view: all courses" : ""]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "divide-y divide-border",
					children: [!isLoading && announcements.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-5 py-6 text-center text-sm text-muted-foreground",
						children: "No announcements."
					}), announcements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "px-3 sm:px-5 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: a.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px]",
									children: a.course?.courseCode ?? "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm mt-1.5 whitespace-pre-line",
								children: a.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground mt-2",
								children: [
									"— ",
									a.postedBy?.name ?? "Unknown",
									" · ",
									new Date(a.createdAt).toLocaleDateString()
								]
							})
						]
					}, a._id))]
				})
			})]
		})]
	})] });
}
//#endregion
export { AnnouncementsPage as component };
