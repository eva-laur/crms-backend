import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as FileText, d as Trash2, nt as Download, rt as CloudUpload, y as Send } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as getCourses } from "./academic-ThiXMN6N.mjs";
import { c as getSubmissions, d as uploadMaterial, i as deleteSubmission, l as recordMaterialDownload, r as deleteMaterial, s as getMaterials, u as submitAssignment } from "./coursework-HLqxs39D.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.course-materials-Cxr-gOi8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX_FILE_BYTES = 20 * 1024 * 1024;
var humanSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
function MaterialsPage() {
	const { user } = useRole();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	if (user.role !== "faculty" && user.role !== "student") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Course Materials",
		subtitle: "Upload lecture material and receive student submissions."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-5 lg:px-8 py-6",
		children: user.role === "faculty" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FacultyView, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentView, {})
	})] });
}
function FacultyView() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["materials"] });
		queryClient.invalidateQueries({ queryKey: ["submissions"] });
	};
	const { data: courses = [] } = useQuery({
		queryKey: ["courses"],
		queryFn: getCourses
	});
	const { data: materials = [] } = useQuery({
		queryKey: ["materials"],
		queryFn: getMaterials
	});
	const { data: submissions = [] } = useQuery({
		queryKey: ["submissions"],
		queryFn: getSubmissions
	});
	const myCourses = (0, import_react.useMemo)(() => courses.filter((c) => c.lecturer?._id === user._id), [courses, user]);
	const myMaterials = (0, import_react.useMemo)(() => materials.filter((m) => m.uploadedBy?._id === user._id), [materials, user]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const activeCourseId = courseId || myCourses[0]?._id || "";
	const upload = async () => {
		if (!activeCourseId || !title.trim() || !file) return toast.error("Course, title and file are required");
		if (file.size > MAX_FILE_BYTES) return toast.error("Max file size is 20 MB");
		setUploading(true);
		try {
			await uploadMaterial({
				course: activeCourseId,
				title: title.trim(),
				file
			});
			toast.success("Material uploaded");
			setTitle("");
			setFile(null);
			invalidate();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};
	const remove = async (id) => {
		try {
			await deleteMaterial(id);
			invalidate();
			toast.success("Deleted");
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Delete failed");
		}
	};
	const removeSubmission = async (id) => {
		try {
			await deleteSubmission(id);
			invalidate();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Delete failed");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "upload",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "upload",
					children: "Upload material"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "mine",
					children: [
						"My materials (",
						myMaterials.length,
						")"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "incoming",
					children: [
						"Student submissions (",
						submissions.length,
						")"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "upload",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4 text-primary" }), " New material"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid md:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: activeCourseId,
							onValueChange: setCourseId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select course" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: c._id,
								children: [
									c.courseCode,
									" — ",
									c.title
								]
							}, c._id)) })]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "Week 3 — TCP handshake"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "File (≤ 20 MB)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "file",
									onChange: (e) => setFile(e.target.files?.[0] ?? null)
								}),
								file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										file.name,
										" · ",
										humanSize(file.size)
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: upload,
								disabled: uploading,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4 mr-1.5" }),
									" ",
									uploading ? "Uploading…" : "Upload"
								]
							})
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "mine",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Course" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Size" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Downloads" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Actions"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [myMaterials.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 5,
						className: "text-center text-muted-foreground py-6",
						children: "No uploads yet."
					}) }), myMaterials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: m.course?.courseCode ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground",
							children: humanSize(m.fileSize)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.downloads.length }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right space-x-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: m.fileUrl,
									target: "_blank",
									rel: "noreferrer",
									download: m.fileName,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "text-destructive",
								onClick: () => remove(m._id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						})
					] }, m._id))] })] })
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "incoming",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "From" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Course" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Note" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "File" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Received" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [submissions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 6,
						className: "text-center text-muted-foreground py-6",
						children: "No submissions."
					}) }), submissions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: s.student?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-mono text-muted-foreground",
							children: s.student?.matricule
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: s.course?.courseCode ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "max-w-xs text-xs",
							children: s.note || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-xs",
							children: [
								s.fileName,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										"(",
										humanSize(s.fileSize),
										")"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-[11px] text-muted-foreground",
							children: new Date(s.createdAt).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right space-x-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: s.fileUrl,
									target: "_blank",
									rel: "noreferrer",
									download: s.fileName,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "text-destructive",
								onClick: () => removeSubmission(s._id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
							})]
						})
					] }, s._id))] })] })
				}) })
			})
		]
	});
}
function StudentView() {
	const { user } = useRole();
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["materials"] });
		queryClient.invalidateQueries({ queryKey: ["submissions"] });
	};
	const { data: courses = [] } = useQuery({
		queryKey: ["courses"],
		queryFn: getCourses
	});
	const { data: materials = [] } = useQuery({
		queryKey: ["materials"],
		queryFn: getMaterials
	});
	const { data: mySubs = [] } = useQuery({
		queryKey: ["submissions"],
		queryFn: getSubmissions
	});
	const myCourses = (0, import_react.useMemo)(() => courses.filter((c) => c.students?.some((s) => s._id === user._id)), [courses, user]);
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [sending, setSending] = (0, import_react.useState)(false);
	const activeCourseId = courseId || myCourses[0]?._id || "";
	const download = async (m) => {
		window.open(m.fileUrl, "_blank");
		try {
			await recordMaterialDownload(m._id);
			invalidate();
		} catch {}
	};
	const send = async () => {
		if (!activeCourseId || !file) return toast.error("Course and file required");
		if (file.size > MAX_FILE_BYTES) return toast.error("Max file size is 20 MB");
		setSending(true);
		try {
			await submitAssignment({
				course: activeCourseId,
				note,
				file
			});
			toast.success("Sent to lecturer");
			setNote("");
			setFile(null);
			invalidate();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Send failed");
		} finally {
			setSending(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "download",
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "download",
					children: [
						"Course materials (",
						materials.length,
						")"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "submit",
					children: "Send to lecturer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "mine",
					children: [
						"My submissions (",
						mySubs.length,
						")"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "download",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Course" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Lecturer" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Uploaded" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Size" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
							className: "text-right",
							children: "Action"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [materials.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 6,
						className: "text-center text-muted-foreground py-6",
						children: "No materials for your courses yet."
					}) }), materials.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: m.course?.courseCode ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-primary" }), m.title]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: m.uploadedBy?.name ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-[11px] text-muted-foreground",
							children: new Date(m.createdAt).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: humanSize(m.fileSize)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => download(m),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1" }), "Download"]
							})
						})
					] }, m._id))] })] })
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "submit",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "text-base flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 text-primary" }), " Send document to a lecturer"]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid md:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course (must be enrolled)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: activeCourseId,
									onValueChange: setCourseId,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select course" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: myCourses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: c._id,
										children: [
											c.courseCode,
											" — ",
											c.title,
											" (",
											c.lecturer?.name,
											")"
										]
									}, c._id)) })]
								}),
								myCourses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-1",
									children: "You're not enrolled in any course yet."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Note" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: note,
								onChange: (e) => setNote(e.target.value),
								placeholder: "Optional message to the lecturer"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "File (≤ 20 MB)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "file",
									onChange: (e) => setFile(e.target.files?.[0] ?? null)
								}),
								file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										file.name,
										" · ",
										humanSize(file.size)
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: send,
								disabled: sending,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4 mr-1.5" }),
									" ",
									sending ? "Sending…" : "Send"
								]
							})
						})
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "mine",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Course" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "File" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Sent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [mySubs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						colSpan: 4,
						className: "text-center text-muted-foreground py-6",
						children: "No submissions yet."
					}) }), mySubs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-mono text-xs",
							children: s.course?.courseCode ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs",
							children: s.fileName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-[11px] text-muted-foreground",
							children: new Date(s.createdAt).toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: s.fileUrl,
									target: "_blank",
									rel: "noreferrer",
									download: s.fileName,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
								})
							})
						})
					] }, s._id))] })] })
				}) })
			})
		]
	});
}
//#endregion
export { MaterialsPage as component };
