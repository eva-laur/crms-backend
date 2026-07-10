import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { g as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as LayoutDashboard, Ct as Bus, E as Package, H as Laptop, L as ListChecks, P as LogOut, Tt as BookOpen, X as FolderOpen, at as ClipboardList, bt as CalendarRange, ct as CircleUser, g as ShieldCheck, gt as ChartColumn, j as Megaphone, l as TriangleAlert, n as Wrench, q as GraduationCap, r as Users, v as Settings2, wt as Boxes, yt as CalendarX, z as Library } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppSidebar-BaQrVn22.js
var import_jsx_runtime = require_jsx_runtime();
var ITEMS = [
	{
		to: "/app/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
		requires: "nav:dashboard"
	},
	{
		to: "/app/schedule",
		label: "Master Schedule",
		icon: CalendarRange,
		requires: "nav:schedule"
	},
	{
		to: "/app/bookings",
		label: "My Bookings",
		icon: ClipboardList,
		requires: "nav:bookings"
	},
	{
		to: "/app/assets",
		label: "My Borrowed Assets",
		icon: Boxes,
		requires: "nav:assets"
	},
	{
		to: "/app/library",
		label: "Library Catalog",
		icon: Library,
		requires: "nav:library"
	},
	{
		to: "/app/it-equipment",
		label: "IT Equipment",
		icon: Laptop,
		requires: "nav:itequipment"
	},
	{
		to: "/app/bus",
		label: "Bus & Transport",
		icon: Bus,
		requires: "nav:bus"
	},
	{
		to: "/app/results",
		label: "Academic Results",
		icon: GraduationCap,
		requires: "nav:results"
	},
	{
		to: "/app/logbook",
		label: "Academic Logbook",
		icon: BookOpen,
		requires: "nav:logbook"
	},
	{
		to: "/app/course-materials",
		label: "Course Materials",
		icon: FolderOpen,
		requires: "nav:materials"
	},
	{
		to: "/app/course-progress",
		label: "Course Progress",
		icon: ListChecks,
		requires: "nav:courseProgress"
	},
	{
		to: "/app/announcements",
		label: "Announcements",
		icon: Megaphone,
		requires: "nav:announcements"
	},
	{
		to: "/app/cancellations",
		label: "Class Cancellations",
		icon: CalendarX,
		requires: "nav:cancellations"
	},
	{
		to: "/app/checkout",
		label: "Checkout Desk",
		icon: Package,
		requires: "nav:checkout"
	},
	{
		to: "/app/conflicts",
		label: "Conflict Resolution",
		icon: TriangleAlert,
		requires: "nav:conflicts"
	},
	{
		to: "/app/reports",
		label: "Reports & Analytics",
		icon: ChartColumn,
		requires: "nav:reports"
	},
	{
		to: "/app/profile",
		label: "My Profile",
		icon: CircleUser,
		requires: "nav:profile"
	}
];
var SYSTEM_ITEMS = [
	{
		to: "/app/users",
		label: "User Management",
		icon: Users,
		requires: "nav:users"
	},
	{
		to: "/app/config",
		label: "System Configuration",
		icon: Settings2,
		requires: "nav:config"
	},
	{
		to: "/app/dashboard",
		label: "Maintenance Registry",
		icon: Wrench,
		requires: "nav:maintenance",
		hash: "maintenance"
	},
	{
		to: "/app/audit",
		label: "Audit Log Terminal",
		icon: ShieldCheck,
		requires: "nav:audit"
	}
];
function AppSidebar({ onNavigate } = {}) {
	const { user, logout, can } = useRole();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	if (!user) return null;
	const workspace = ITEMS.filter((i) => can(i.requires));
	const system = SYSTEM_ITEMS.filter((i) => can(i.requires));
	const renderItem = (item, key) => {
		const Icon = item.icon;
		const active = pathname === item.to && !item.hash;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: item.to,
			hash: item.hash,
			onClick: onNavigate,
			"data-active": active,
			className: cn("nav-pill group"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "nav-ico",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: item.label
			})]
		}, key);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-full w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 py-5 border-b border-sidebar-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-9 w-9 rounded-full bg-sidebar-accent/20 ring-1 ring-sidebar-accent/50 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-sidebar-accent" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60",
							children: "IUC / SEAS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "CRMS Console"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-soft",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 pb-1.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/50",
						children: "Workspace"
					}),
					workspace.map((item, i) => renderItem(item, `w-${i}-${item.to}`)),
					system.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 px-4 pb-1.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/50",
						children: "System"
					}), system.map((item, i) => renderItem(item, `s-${i}-${item.to}`))] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 border-t border-sidebar-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-sidebar-foreground/5 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium truncate",
							children: user.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-sidebar-foreground/60 truncate",
							children: user.matricule
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								logout();
								navigate({ to: "/" });
							},
							className: "mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-sidebar-foreground/60 hover:text-destructive transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3 w-3" }), " Sign out"]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { AppSidebar as t };
