import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as ROLE_META, f as useRole, i as ROLES, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ShieldAlert, b as Search, d as Trash2, r as Users } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { i as updateUser, n as getAllUsers, t as deleteUser } from "./users-BpEolhg7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.users-R7qn1Pp0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var roleLabel = (role) => ROLE_META[role]?.label ?? role;
var isKnownRole = (role) => role in ROLE_META;
function UsersPage() {
	const { user, can } = useRole();
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [q, setQ] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("all");
	const reload = () => {
		setLoading(true);
		getAllUsers().then(setAccounts).catch((e) => toast.error(e instanceof ApiError ? e.message : "Failed to load users")).finally(() => setLoading(false));
	};
	(0, import_react.useEffect)(() => {
		reload();
	}, []);
	if (!user) return null;
	if (!can("action:manageUsers")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "User Management",
		subtitle: "Access restricted"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "max-w-xl mx-auto mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-8 text-center space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-8 w-8 text-warning mx-auto" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "This account doesn't have admin access"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground bg-background/40 rounded-lg border border-border p-3 text-left font-mono space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["name: ", user.name] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["matricule: ", user.matricule] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["email: ", user.email] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["role (as seen by this app right now): ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-warning",
								children: user.role
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"If you changed this account's role directly in the database, confirm you edited the document with this exact matricule/email, in the same database the backend's ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "MONGO_URI" }),
							" points to, and that the ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "role" }),
							" field is exactly the lowercase string ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "admin" }),
							" (no quotes mismatch, no extra whitespace, no capital letters)."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/dashboard",
							children: "Back to dashboard"
						})
					})
				]
			})
		})
	})] });
	const filtered = accounts.filter((a) => {
		if (roleFilter !== "all" && a.role !== roleFilter) return false;
		if (!q.trim()) return true;
		const n = q.trim().toLowerCase();
		return `${a.name} ${a.email} ${a.matricule}`.toLowerCase().includes(n);
	});
	const counts = ROLES.reduce((acc, r) => {
		acc[r] = accounts.filter((a) => a.role === r).length;
		return acc;
	}, {});
	const changeRole = async (id, role) => {
		try {
			await updateUser(id, { role });
			toast.success(`Role updated → ${ROLE_META[role].label}`);
			reload();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to update role");
		}
	};
	const remove = async (id) => {
		try {
			await deleteUser(id);
			toast.success("Account deleted");
			reload();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to delete account");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "User Management",
		subtitle: "Assign roles, manage faculty & resource managers, decommission accounts"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3",
			children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-wider text-muted-foreground",
					children: ROLE_META[r].short
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xl font-semibold mt-1",
					children: counts[r] ?? 0
				})]
			}) }, r))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }), " Registered users"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "All accounts on the platform · admin-only console"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 w-full sm:w-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 sm:w-72",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						className: "pl-9",
						placeholder: "Search name, email or matricule…"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: roleFilter,
					onValueChange: (v) => setRoleFilter(v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All roles"
					}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: r,
						children: ROLE_META[r].label
					}, r))] })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "overflow-x-auto p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Matricule" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Actions"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "text-center text-muted-foreground py-6",
					children: "Loading users…"
				}) }),
				!loading && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "text-center text-muted-foreground py-6",
					children: "No accounts match."
				}) }),
				!loading && filtered.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: a.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-mono",
						children: a.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs font-mono text-muted-foreground",
						children: a.matricule
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: isKnownRole(a.role) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: a.role,
						onValueChange: (v) => changeRole(a._id, v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-52 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "border-primary/40 text-primary",
								children: roleLabel(a.role)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: r,
							children: ROLE_META[r].label
						}, r)) })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						onValueChange: (v) => changeRole(a._id, v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-56 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "border-destructive/40 text-destructive",
								children: [
									"Unknown role: \"",
									a.role,
									"\" — click to fix"
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: r,
							children: ROLE_META[r].label
						}, r)) })]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							className: "text-destructive h-7 w-7",
							onClick: () => remove(a._id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})
					})
				] }, a._id))
			] })] })
		})] })]
	})] });
}
//#endregion
export { UsersPage as component };
