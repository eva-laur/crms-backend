import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as ROLE_META, f as useRole, l as changePasswordRequest, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as User, nt as Download, rt as CloudUpload, x as Save } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as AvatarFallback$1, r as AvatarImage$1, t as Avatar$1 } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { i as updateUser } from "./users-BpEolhg7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.profile-CDbSOkvG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
var MATERIALS_KEY = "crms-materials";
var SUBMISSIONS_KEY = "crms-submissions";
function read(key) {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(window.localStorage.getItem(key) ?? "[]");
	} catch {
		return [];
	}
}
var listMaterials = () => read(MATERIALS_KEY);
var listSubmissions = () => read(SUBMISSIONS_KEY);
function fileToBlob(file) {
	return new Promise((res, rej) => {
		const reader = new FileReader();
		reader.onload = () => res({
			name: file.name,
			type: file.type || "application/octet-stream",
			size: file.size,
			dataUrl: String(reader.result)
		});
		reader.onerror = () => rej(reader.error);
		reader.readAsDataURL(file);
	});
}
function triggerDownload(blob) {
	const a = document.createElement("a");
	a.href = blob.dataUrl;
	a.download = blob.name;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
function humanSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
var CLASS_LEVELS = [
	"Y1",
	"Y2",
	"Y3",
	"Y4",
	"M1",
	"M2"
];
var SPECIALTIES = [
	"Computer Science",
	"Electrical Engineering",
	"Data Science",
	"Civil Engineering",
	"Mechanical Engineering",
	"Other"
];
function ProfilePage() {
	const { user, updateProfile } = useRole();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const [name, setName] = (0, import_react.useState)(user.name);
	const [phone, setPhone] = (0, import_react.useState)(user.phone ?? "");
	const [avatar, setAvatar] = (0, import_react.useState)(user.avatar ?? "");
	const [classLevel, setClassLevel] = (0, import_react.useState)(user.classLevel ?? "Y1");
	const [specialty, setSpecialty] = (0, import_react.useState)(user.specialty ?? "Computer Science");
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const uploads = (0, import_react.useMemo)(() => {
		if (user.role === "faculty") return listMaterials().filter((m) => m.lecturerEmail.toLowerCase() === user.email.toLowerCase());
		return listSubmissions().filter((s) => s.studentEmail.toLowerCase() === user.email.toLowerCase());
	}, [user]);
	const downloads = (0, import_react.useMemo)(() => {
		if (user.role === "student") return listMaterials().filter((m) => m.downloads.includes(user.matricule));
		if (user.role === "faculty") return listSubmissions().filter((s) => s.lecturerEmail.toLowerCase() === user.email.toLowerCase());
		return [];
	}, [user]);
	const onAvatar = async (f) => {
		if (!f) return;
		if (f.size > 500 * 1024) return toast.error("Avatar must be ≤ 500 KB");
		const b = await fileToBlob(f);
		setAvatar(b.dataUrl);
	};
	const save = async () => {
		if (!user._id) return toast.error("Missing user id — please sign in again.");
		setSaving(true);
		try {
			const patch = {
				name,
				phone,
				avatar
			};
			if (user.role === "student") {
				patch.classLevel = classLevel;
				patch.specialty = specialty;
			}
			const updated = await updateUser(user._id, patch);
			updateProfile({
				name: updated.name,
				phone: updated.phone,
				avatar: updated.avatar,
				classLevel: updated.classLevel,
				specialty: updated.specialty
			});
			if (newPassword) {
				if (!currentPassword) throw new Error("Enter your current password to set a new one.");
				await changePasswordRequest(currentPassword, newPassword);
				setCurrentPassword("");
				setNewPassword("");
			}
			toast.success("Profile updated");
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Save failed");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "My Profile",
		subtitle: "Manage your account. Your role can only be changed by an administrator."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-8 py-6 space-y-6 max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-primary" }), " Personal information"]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid md:grid-cols-[auto_1fr] gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						className: "h-24 w-24 ring-2 ring-primary/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: avatar }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: user.name.split(" ").map((n) => n[0]).slice(0, 2).join("") })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-xs text-primary cursor-pointer hover:underline",
						children: ["Change photo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							hidden: true,
							onChange: (e) => onAvatar(e.target.files?.[0] ?? null)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "border-primary/40 text-primary",
						children: ROLE_META[user.role].label
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid sm:grid-cols-2 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Matricule (read-only)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: user.matricule,
						disabled: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email (read-only)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: user.email,
						disabled: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: phone,
						onChange: (e) => setPhone(e.target.value),
						placeholder: "+237 ..."
					})] }),
					user.role === "student" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Class level" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: classLevel,
						onValueChange: setClassLevel,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CLASS_LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: l,
							children: l
						}, l)) })]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Specialty" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: specialty,
						onValueChange: setSpecialty,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SPECIALTIES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: s,
							children: s
						}, s)) })]
					})] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Current password" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: currentPassword,
						onChange: (e) => setCurrentPassword(e.target.value),
						placeholder: "required to change password"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New password (leave blank to keep current)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: newPassword,
						onChange: (e) => setNewPassword(e.target.value),
						placeholder: "min. 6 characters"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2 flex gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: save,
							disabled: saving,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4 mr-1.5" }),
								" ",
								saving ? "Saving…" : "Save changes"
							]
						})
					})
				]
			})]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid md:grid-cols-2 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-4 w-4 text-primary" }), " My uploads"]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2 text-sm",
				children: [uploads.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-xs",
					children: "No uploads yet."
				}), uploads.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-border p-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium truncate",
							children: u.title ?? u.file?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground",
							children: [
								u.courseCode,
								" · ",
								humanSize(u.file.size)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => triggerDownload(u.file),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
					})]
				}, u.id))]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4 text-primary" }),
					" ",
					user.role === "faculty" ? "Submissions received" : "My downloads"
				]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-2 text-sm",
				children: [downloads.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-xs",
					children: "Nothing yet."
				}), downloads.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-border p-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium truncate",
							children: u.title ?? u.file?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] text-muted-foreground",
							children: [
								u.courseCode,
								" · ",
								humanSize(u.file.size),
								u.studentName ? ` · from ${u.studentName}` : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => triggerDownload(u.file),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
					})]
				}, u.id))]
			})] })]
		})]
	})] });
}
//#endregion
export { ProfilePage as component };
