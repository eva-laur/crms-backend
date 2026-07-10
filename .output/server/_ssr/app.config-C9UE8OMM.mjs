import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as Settings2, x as Save } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.config-C9UE8OMM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useLocalStore(key, initial) {
	const [val, setVal] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return initial;
		try {
			const raw = window.localStorage.getItem(key);
			return raw ? JSON.parse(raw) : initial;
		} catch {
			return initial;
		}
	});
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(key, JSON.stringify(val));
		} catch {}
	}, [key, val]);
	return [val, setVal];
}
var DEFAULT_CONFIG = {
	bookingLimits: {
		amphi: 4,
		lab: 3,
		equipment: 7,
		meeting: 2
	},
	templates: {
		bookingConfirmed: "Hello {{name}}, your booking for {{resource}} on {{date}} {{slot}} is confirmed.",
		cancellationAlert: "Notice: {{course}} scheduled for {{date}} {{slot}} has been cancelled by {{lecturer}}. Reason: {{reason}}.",
		checkoutReceipt: "Asset {{asset}} checked out to {{name}} ({{matricule}}). Return by {{due}}."
	}
};
function ConfigPage() {
	const { can } = useRole();
	if (!can("action:editConfig")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const [cfg, setCfg] = useLocalStore("crms-config", DEFAULT_CONFIG);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "System Configuration",
		subtitle: "Booking duration limits & notification templates"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 grid xl:grid-cols-2 gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "text-base flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "h-4 w-4 text-primary" }), " Maximum booking duration (hours)"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: "Applied at booking creation across the platform."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid grid-cols-2 gap-3",
			children: [Object.keys(cfg.bookingLimits).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "capitalize",
					children: k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 1,
					max: 24,
					value: cfg.bookingLimits[k],
					onChange: (e) => setCfg({
						...cfg,
						bookingLimits: {
							...cfg.bookingLimits,
							[k]: Math.max(1, Math.min(24, Number(e.target.value) || 1))
						}
					})
				})]
			}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => toast.success("Booking limits saved"),
					className: "gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save limits"]
				})
			})]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-base",
			children: "Notification templates"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted-foreground",
			children: [
				"Use ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: `{{placeholders}}` }),
				" for dynamic values."
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-3",
			children: [Object.keys(cfg.templates).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "capitalize",
					children: k.replace(/([A-Z])/g, " $1")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 3,
					value: cfg.templates[k],
					onChange: (e) => setCfg({
						...cfg,
						templates: {
							...cfg.templates,
							[k]: e.target.value
						}
					})
				})]
			}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => toast.success("Templates saved"),
				className: "gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), " Save templates"]
			})]
		})] })]
	})] });
}
//#endregion
export { ConfigPage as component };
