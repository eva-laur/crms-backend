import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate, f as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppSidebar } from "./AppSidebar-BaQrVn22.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-6suhDeYo.js
var import_jsx_runtime = require_jsx_runtime();
function AppLayout() {
	const { user, loading } = useRole();
	if (loading) return null;
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen aurora-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "no-print hidden lg:block fixed top-[36px] left-0 bottom-0 w-64 z-30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 min-w-0 lg:ml-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})]
		})
	});
}
//#endregion
export { AppLayout as component };
