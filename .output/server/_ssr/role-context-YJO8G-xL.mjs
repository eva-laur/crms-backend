import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/role-context-YJO8G-xL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Central HTTP client for talking to the CRMS Express backend.
*
* Base URL comes from VITE_API_URL (e.g. "http://localhost:5000/api").
* Falls back to http://localhost:5000/api for local dev, matching the
* server's default PORT=5000 and the "/api/*" mount points used by every
* PluginRegistry module (see server/core/PluginRegistry.js).
*/
var BASE_URL = "https://crms-frontend-production.up.railway.app";
var TOKEN_KEY = "crms-token";
function getToken() {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
	if (typeof window === "undefined") return;
	if (token) window.localStorage.setItem(TOKEN_KEY, token);
	else window.localStorage.removeItem(TOKEN_KEY);
}
var ApiError = class extends Error {
	status;
	body;
	constructor(message, status, body) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.body = body;
	}
};
function buildUrl(path, query) {
	const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
	if (query) Object.entries(query).forEach(([k, v]) => {
		if (v !== void 0 && v !== null && v !== "") url.searchParams.set(k, String(v));
	});
	return url.toString();
}
/**
* Low-level request helper used by every module under src/lib/api/.
* Every backend route (see server/modules/*\/*.routes.js) returns JSON
* except calendar/report export endpoints, which are handled by the
* dedicated `apiDownload` helper below.
*/
async function apiRequest(path, opts = {}) {
	const { method = "GET", body, isFormData, query, skipAuth } = opts;
	const headers = {};
	if (!isFormData) headers["Content-Type"] = "application/json";
	if (!skipAuth) {
		const token = getToken();
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}
	const res = await fetch(buildUrl(path, query), {
		method,
		headers,
		body: body === void 0 ? void 0 : isFormData ? body : JSON.stringify(body)
	});
	const text = await res.text();
	const data = text ? safeJsonParse(text) : null;
	if (!res.ok) throw new ApiError(data && data.message || res.statusText || "Request failed", res.status, data);
	return data;
}
function safeJsonParse(text) {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
/** POST /api/users/register — always creates a "student" account server-side. */
function registerRequest(input) {
	return apiRequest("/users/register", {
		method: "POST",
		body: input,
		skipAuth: true
	});
}
/** POST /api/users/login — backend authenticates by matricule, not email. */
function loginRequest(matricule, password) {
	return apiRequest("/users/login", {
		method: "POST",
		body: {
			matricule,
			password
		},
		skipAuth: true
	});
}
async function logoutRequest() {
	try {
		await apiRequest("/users/logout", { method: "POST" });
	} finally {
		setToken(null);
	}
}
function getProfileRequest() {
	return apiRequest("/users/profile");
}
function changePasswordRequest(currentPassword, newPassword) {
	return apiRequest("/users/change-password", {
		method: "PATCH",
		body: {
			currentPassword,
			newPassword
		}
	});
}
var ROLES = [
	"student",
	"faculty",
	"library_manager",
	"logistics_manager",
	"it_manager",
	"lab_manager",
	"admin"
];
var MANAGER_ROLES = [
	"library_manager",
	"logistics_manager",
	"it_manager",
	"lab_manager"
];
var isManager = (r) => !!r && MANAGER_ROLES.includes(r);
var ROLE_META = {
	student: {
		label: "Student",
		short: "Student",
		emoji: "🎓",
		tagline: "Bookings, results & logbook"
	},
	faculty: {
		label: "Faculty",
		short: "Faculty",
		emoji: "🧑‍🏫",
		tagline: "Teaching schedule & gradebook"
	},
	library_manager: {
		label: "Library Manager",
		short: "Library",
		emoji: "📚",
		tagline: "Catalog, checkout & circulation"
	},
	logistics_manager: {
		label: "Logistics / Bus Manager",
		short: "Logistics",
		emoji: "🚌",
		tagline: "Fleet, drivers, fuel & mileage"
	},
	it_manager: {
		label: "IT Equipment Manager",
		short: "IT Equip",
		emoji: "💻",
		tagline: "Hardware inventory & checkouts"
	},
	lab_manager: {
		label: "Lab Halls Manager",
		short: "Labs",
		emoji: "🧪",
		tagline: "Lab occupancy & layouts"
	},
	admin: {
		label: "Administrator",
		short: "Admin",
		emoji: "🛡️",
		tagline: "Users, roles & system control"
	}
};
var MANAGER_AUDIT_SCOPE = {
	library_manager: ["resources", "bookings"],
	logistics_manager: ["bus"],
	it_manager: ["resources", "bookings"],
	lab_manager: ["resources", "bookings"]
};
var ROLE_PERMISSIONS = {
	student: [
		"nav:dashboard",
		"nav:schedule",
		"nav:bookings",
		"nav:assets",
		"nav:results",
		"nav:logbook",
		"nav:materials",
		"nav:profile",
		"nav:bus",
		"nav:library",
		"nav:itequipment",
		"nav:courseProgress",
		"nav:announcements",
		"action:reserveBus",
		"action:borrowBook",
		"action:requestIT",
		"action:submitAssignment"
	],
	faculty: [
		"nav:dashboard",
		"nav:schedule",
		"nav:bookings",
		"nav:logbook",
		"nav:materials",
		"nav:marks",
		"nav:reports",
		"nav:profile",
		"nav:bus",
		"nav:library",
		"nav:itequipment",
		"nav:courseProgress",
		"nav:announcements",
		"nav:cancellations",
		"action:bookResource",
		"action:logAttendance",
		"action:editMarks",
		"action:enterMarks",
		"action:reserveBus",
		"action:borrowBook",
		"action:requestIT",
		"action:postAnnouncement",
		"action:cancelClass",
		"action:editSyllabus",
		"action:uploadMaterial",
		"action:exportReport"
	],
	library_manager: [
		"nav:dashboard",
		"nav:library",
		"nav:checkout",
		"nav:reports",
		"nav:audit",
		"nav:profile",
		"action:manageLibrary",
		"action:borrowBook",
		"action:checkoutAsset",
		"action:exportReport"
	],
	logistics_manager: [
		"nav:dashboard",
		"nav:bus",
		"nav:reports",
		"nav:audit",
		"nav:profile",
		"action:manageBus",
		"action:exportReport"
	],
	it_manager: [
		"nav:dashboard",
		"nav:itequipment",
		"nav:checkout",
		"nav:reports",
		"nav:audit",
		"nav:profile",
		"action:manageIT",
		"action:checkoutAsset",
		"action:exportReport"
	],
	lab_manager: [
		"nav:dashboard",
		"nav:conflicts",
		"nav:reports",
		"nav:audit",
		"nav:profile",
		"action:bookResource",
		"action:editResource",
		"action:resolveConflict",
		"action:exportReport"
	],
	admin: [
		"nav:dashboard",
		"nav:logbook",
		"nav:reports",
		"nav:profile",
		"nav:courseProgress",
		"nav:announcements",
		"nav:cancellations",
		"nav:users",
		"nav:audit",
		"nav:config",
		"action:manageUsers",
		"action:editConfig",
		"action:viewAuditFeed",
		"action:exportReport"
	]
};
function can(role, permission) {
	if (!role) return false;
	return ROLE_PERMISSIONS[role].includes(permission);
}
function toSessionUser(u) {
	return {
		_id: u._id,
		name: u.name,
		matricule: u.matricule ?? "",
		email: u.email,
		role: u.role,
		phone: u.phone,
		avatar: u.avatar,
		classLevel: u.classLevel,
		specialty: u.specialty
	};
}
var USER_CACHE_KEY = "crms-user";
var RoleContext = (0, import_react.createContext)(null);
function RoleProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const refreshProfile = () => {
		if (!getToken()) return Promise.resolve();
		return getProfileRequest().then((profile) => {
			const su = toSessionUser(profile);
			setUser(su);
			window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(su));
		}).catch(() => {
			setToken(null);
			window.localStorage.removeItem(USER_CACHE_KEY);
			setUser(null);
		});
	};
	(0, import_react.useEffect)(() => {
		if (!getToken()) {
			setLoading(false);
			return;
		}
		try {
			const raw = window.localStorage.getItem(USER_CACHE_KEY);
			if (raw) setUser(JSON.parse(raw));
		} catch {}
		refreshProfile().finally(() => setLoading(false));
	}, []);
	(0, import_react.useEffect)(() => {
		const onFocus = () => {
			if (getToken()) refreshProfile();
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") onFocus();
		};
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);
	const persist = (su) => {
		setUser(su);
		if (su) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(su));
		else window.localStorage.removeItem(USER_CACHE_KEY);
	};
	const loginWithCredentials = async (matricule, password) => {
		try {
			const res = await loginRequest(matricule.trim(), password);
			setToken(res.token);
			const su = toSessionUser(res);
			persist(su);
			return {
				ok: true,
				role: su.role
			};
		} catch (e) {
			return {
				ok: false,
				error: e instanceof ApiError ? e.message : "Unable to sign in. Check your connection."
			};
		}
	};
	const register = async (input) => {
		try {
			const res = await registerRequest({
				name: input.name.trim(),
				email: input.email.trim().toLowerCase(),
				password: input.password,
				matricule: input.matricule.trim()
			});
			setToken(res.token);
			persist(toSessionUser(res));
			return { ok: true };
		} catch (e) {
			return {
				ok: false,
				error: e instanceof ApiError ? e.message : "Unable to create account. Check your connection."
			};
		}
	};
	const updateProfile = (patch) => {
		if (!user) return;
		persist({
			...user,
			...patch
		});
	};
	const logout = () => {
		logoutRequest().finally(() => persist(null));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleContext.Provider, {
		value: {
			user,
			loading,
			loginWithCredentials,
			register,
			updateProfile,
			logout,
			can: (p) => can(user?.role, p)
		},
		children
	});
}
function useRole() {
	const ctx = (0, import_react.useContext)(RoleContext);
	if (!ctx) throw new Error("useRole must be used inside RoleProvider");
	return ctx;
}
//#endregion
export { ROLE_META as a, can as c, isManager as d, useRole as f, ROLES as i, changePasswordRequest as l, BASE_URL as n, RoleProvider as o, MANAGER_AUDIT_SCOPE as r, apiRequest as s, ApiError as t, getToken as u };
