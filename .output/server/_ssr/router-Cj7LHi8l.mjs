import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { o as RoleProvider } from "./role-context-YJO8G-xL.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Cj7LHi8l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BtgLQQgR.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center aurora-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center glass-panel rounded-2xl p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold tracking-tight",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center aurora-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center glass-panel rounded-2xl p-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$22 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "IUC / SEAS — Campus Resource Management System" },
			{
				name: "description",
				content: "Unified portal for booking resources, managing assets, and tracking academic logs at IUC / SEAS."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$22.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RoleProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-right" })] })
	});
}
var $$splitComponentImporter$21 = () => import("./app-6suhDeYo.mjs");
var Route$21 = createFileRoute("/app")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./routes-Ciw-TYNE.mjs");
var Route$20 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Portal Gateway — IUC / SEAS CRMS" }, {
		name: "description",
		content: "Sign in or register on the IUC / SEAS Campus Resource Management System."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./app.users-R7qn1Pp0.mjs");
var Route$19 = createFileRoute("/app/users")({
	head: () => ({ meta: [{ title: "User Management — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./app.schedule-DRhVjpYj.mjs");
var Route$18 = createFileRoute("/app/schedule")({
	head: () => ({ meta: [{ title: "Master Schedule — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./app.results-DbH3KmJE.mjs");
var Route$17 = createFileRoute("/app/results")({
	head: () => ({ meta: [{ title: "Academic Results Portal — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./app.reports-DfjPiMhw.mjs");
var Route$16 = createFileRoute("/app/reports")({
	head: () => ({ meta: [{ title: "Departmental Reporting & Analytics — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
/** Builds empty, real-calendar-dated buckets for the chosen scope; counts are
*  filled in afterwards from whatever real records apply to the viewer's role. */
var $$splitComponentImporter$15 = () => import("./app.profile-CDbSOkvG.mjs");
var Route$15 = createFileRoute("/app/profile")({
	head: () => ({ meta: [{ title: "My Profile — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./app.logbook-CHG4oYbR.mjs");
var Route$14 = createFileRoute("/app/logbook")({
	head: () => ({ meta: [{ title: "Academic Logbook — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./app.library-ZiL8sdqZ.mjs");
var Route$13 = createFileRoute("/app/library")({
	head: () => ({ meta: [{ title: "Library Catalog — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./app.it-equipment-ctd2WOVd.mjs");
var Route$12 = createFileRoute("/app/it-equipment")({
	head: () => ({ meta: [{ title: "IT Equipment — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./app.dashboard-CA2mLQ_5.mjs");
var Route$11 = createFileRoute("/app/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./app.course-progress-CJAshHCn.mjs");
var Route$10 = createFileRoute("/app/course-progress")({
	head: () => ({ meta: [{ title: "Course Progress — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./app.course-materials-Cxr-gOi8.mjs");
var Route$9 = createFileRoute("/app/course-materials")({
	head: () => ({ meta: [{ title: "Course Materials — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./app.conflicts-CN4U7NxS.mjs");
var Route$8 = createFileRoute("/app/conflicts")({
	head: () => ({ meta: [{ title: "Conflict Resolution Centre — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./app.config-C9UE8OMM.mjs");
var Route$7 = createFileRoute("/app/config")({
	head: () => ({ meta: [{ title: "System Configuration — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./app.checkout-Br-znLqq.mjs");
var Route$6 = createFileRoute("/app/checkout")({
	head: () => ({ meta: [{ title: "Asset Checkout Desk — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./app.cancellations-vCQUGCS2.mjs");
var Route$5 = createFileRoute("/app/cancellations")({
	head: () => ({ meta: [{ title: "Class Cancellations — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./app.bus-CdBw5YWb.mjs");
var Route$4 = createFileRoute("/app/bus")({
	head: () => ({ meta: [{ title: "Bus & Transport — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./app.bookings-CL4ofkiH.mjs");
var Route$3 = createFileRoute("/app/bookings")({
	head: () => ({ meta: [{ title: "My Bookings — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./app.audit-pUQtAoj2.mjs");
var Route$2 = createFileRoute("/app/audit")({
	head: () => ({ meta: [{ title: "Activity & Evidence — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./app.assets-Cpr5_7Rl.mjs");
var Route$1 = createFileRoute("/app/assets")({
	head: () => ({ meta: [{ title: "My Borrowed Assets — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./app.announcements-BTSa7f1K.mjs");
var Route = createFileRoute("/app/announcements")({
	head: () => ({ meta: [{ title: "Announcements — CRMS" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var AppRoute = Route$21.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$22
});
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$22
});
var AppUsersRoute = Route$19.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AppRoute
});
var AppScheduleRoute = Route$18.update({
	id: "/schedule",
	path: "/schedule",
	getParentRoute: () => AppRoute
});
var AppResultsRoute = Route$17.update({
	id: "/results",
	path: "/results",
	getParentRoute: () => AppRoute
});
var AppReportsRoute = Route$16.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AppRoute
});
var AppProfileRoute = Route$15.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AppRoute
});
var AppLogbookRoute = Route$14.update({
	id: "/logbook",
	path: "/logbook",
	getParentRoute: () => AppRoute
});
var AppLibraryRoute = Route$13.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => AppRoute
});
var AppItEquipmentRoute = Route$12.update({
	id: "/it-equipment",
	path: "/it-equipment",
	getParentRoute: () => AppRoute
});
var AppDashboardRoute = Route$11.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AppRoute
});
var AppCourseProgressRoute = Route$10.update({
	id: "/course-progress",
	path: "/course-progress",
	getParentRoute: () => AppRoute
});
var AppCourseMaterialsRoute = Route$9.update({
	id: "/course-materials",
	path: "/course-materials",
	getParentRoute: () => AppRoute
});
var AppConflictsRoute = Route$8.update({
	id: "/conflicts",
	path: "/conflicts",
	getParentRoute: () => AppRoute
});
var AppConfigRoute = Route$7.update({
	id: "/config",
	path: "/config",
	getParentRoute: () => AppRoute
});
var AppCheckoutRoute = Route$6.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => AppRoute
});
var AppCancellationsRoute = Route$5.update({
	id: "/cancellations",
	path: "/cancellations",
	getParentRoute: () => AppRoute
});
var AppBusRoute = Route$4.update({
	id: "/bus",
	path: "/bus",
	getParentRoute: () => AppRoute
});
var AppBookingsRoute = Route$3.update({
	id: "/bookings",
	path: "/bookings",
	getParentRoute: () => AppRoute
});
var AppAuditRoute = Route$2.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AppRoute
});
var AppAssetsRoute = Route$1.update({
	id: "/assets",
	path: "/assets",
	getParentRoute: () => AppRoute
});
var AppRouteChildren = {
	AppAnnouncementsRoute: Route.update({
		id: "/announcements",
		path: "/announcements",
		getParentRoute: () => AppRoute
	}),
	AppAssetsRoute,
	AppAuditRoute,
	AppBookingsRoute,
	AppBusRoute,
	AppCancellationsRoute,
	AppCheckoutRoute,
	AppConfigRoute,
	AppConflictsRoute,
	AppCourseMaterialsRoute,
	AppCourseProgressRoute,
	AppDashboardRoute,
	AppItEquipmentRoute,
	AppLibraryRoute,
	AppLogbookRoute,
	AppProfileRoute,
	AppReportsRoute,
	AppResultsRoute,
	AppScheduleRoute,
	AppUsersRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren)
};
var routeTree = Route$22._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
