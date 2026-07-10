/* eslint-disable prettier/prettier */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginRequest, registerRequest, logoutRequest, getProfileRequest } from "@/lib/api/auth";
import { getToken, setToken, ApiError } from "@/lib/api/client";

/* =========================================================================
   Roles & Permissions
   ========================================================================= */

export const ROLES = [
  "student",
  "faculty",
  "library_manager",
  "logistics_manager",
  "it_manager",
  "lab_manager",
  "admin",
] as const;
export type Role = (typeof ROLES)[number];

export const MANAGER_ROLES: Role[] = ["library_manager", "logistics_manager", "it_manager", "lab_manager"];
export const isManager = (r: Role | undefined | null) => !!r && MANAGER_ROLES.includes(r);

export const ROLE_META: Record<Role, { label: string; emoji: string; tagline: string; short: string }> = {
  student:           { label: "Student",                  short: "Student",    emoji: "🎓",  tagline: "Bookings, results & logbook" },
  faculty:           { label: "Faculty",                  short: "Faculty",    emoji: "🧑‍🏫", tagline: "Teaching schedule & gradebook" },
  library_manager:   { label: "Library Manager",          short: "Library",    emoji: "📚",  tagline: "Catalog, checkout & circulation" },
  logistics_manager: { label: "Logistics / Bus Manager",  short: "Logistics",  emoji: "🚌",  tagline: "Fleet, drivers, fuel & mileage" },
  it_manager:        { label: "IT Equipment Manager",     short: "IT Equip",   emoji: "💻",  tagline: "Hardware inventory & checkouts" },
  lab_manager:       { label: "Lab Halls Manager",        short: "Labs",       emoji: "🧪",  tagline: "Lab occupancy & layouts" },
  admin:             { label: "Administrator",            short: "Admin",      emoji: "🛡️", tagline: "Users, roles & system control" },
};

// Drives the "Module" filter dropdown on the Audit page. The actual
// scoping — which logs a manager can see at all — is enforced server-side
// in audit.service.js (library/IT/lab managers are further restricted to
// their resource type there; this constant only needs the coarse module
// names since that's all the filter dropdown deals with).
export const MANAGER_AUDIT_SCOPE: Partial<Record<Role, string[]>> = {
  library_manager:   ["resources", "bookings"],
  logistics_manager: ["bus"],
  it_manager:        ["resources", "bookings"],
  lab_manager:       ["resources", "bookings"],
};

export const PERMISSIONS = [
  "nav:dashboard","nav:schedule","nav:bookings","nav:assets","nav:results","nav:logbook",
  "nav:checkout","nav:conflicts","nav:maintenance","nav:reports","nav:bus","nav:library",
  "nav:itequipment","nav:users","nav:audit","nav:config","nav:courseProgress",
  "nav:announcements","nav:cancellations","nav:profile","nav:materials","nav:marks",
  "action:bookResource","action:editResource","action:logAttendance","action:editMarks",
  "action:resolveConflict","action:overrideConflict","action:checkoutAsset","action:manageUsers",
  "action:editConfig","action:viewAuditFeed","action:exportReport","action:manageBus",
  "action:reserveBus","action:manageLibrary","action:borrowBook","action:manageIT",
  "action:requestIT","action:postAnnouncement","action:cancelClass","action:editSyllabus",
  "action:uploadMaterial","action:submitAssignment","action:enterMarks",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    "nav:dashboard","nav:schedule","nav:bookings","nav:assets",
    "nav:results","nav:logbook","nav:materials","nav:profile",
    "nav:bus","nav:library","nav:itequipment",
    "nav:courseProgress","nav:announcements",
    "action:reserveBus","action:borrowBook","action:requestIT","action:submitAssignment",
  ],
  faculty: [
    "nav:dashboard","nav:schedule","nav:bookings","nav:logbook","nav:materials","nav:marks",
    "nav:reports","nav:profile",
    "nav:bus","nav:library","nav:itequipment",
    "nav:courseProgress","nav:announcements","nav:cancellations",
    "action:bookResource","action:logAttendance","action:editMarks","action:enterMarks",
    "action:reserveBus","action:borrowBook","action:requestIT",
    "action:postAnnouncement","action:cancelClass","action:editSyllabus",
    "action:uploadMaterial","action:exportReport",
  ],
  library_manager: [
    "nav:dashboard","nav:library","nav:checkout","nav:reports","nav:audit","nav:profile",
    "action:manageLibrary","action:borrowBook","action:checkoutAsset","action:exportReport",
  ],
  logistics_manager: [
    "nav:dashboard","nav:bus","nav:reports","nav:audit","nav:profile",
    "action:manageBus","action:exportReport",
  ],
  it_manager: [
    "nav:dashboard","nav:itequipment","nav:checkout","nav:reports","nav:audit","nav:profile",
    "action:manageIT","action:checkoutAsset","action:exportReport",
  ],
  lab_manager: [
    "nav:dashboard","nav:conflicts","nav:reports","nav:audit","nav:profile",
    "action:bookResource","action:editResource",
    "action:resolveConflict","action:exportReport",
  ],
  admin: [
    "nav:dashboard","nav:logbook",
    "nav:reports","nav:profile",
    "nav:courseProgress","nav:announcements","nav:cancellations",
    "nav:users","nav:audit","nav:config",
    "action:manageUsers","action:editConfig","action:viewAuditFeed","action:exportReport",
  ],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}
export function canAny(role: Role | undefined | null, perms: Permission[]): boolean {
  return perms.some(p => can(role, p));
}

/* =========================================================================
   Session — backed by the real CRMS API (server/modules/users).
   Auth is by matricule/password (see users.routes.js — login is POST
   /api/users/login with { matricule, password }). The JWT is stored under
   "crms-token" (see src/lib/api/client.ts) and the decoded user under
   "crms-user" for instant hydration on reload before /profile resolves.
   ========================================================================= */

export interface SessionUser {
  _id?: string;
  name: string;
  matricule: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;      // data URL
  classLevel?: string;  // student
  specialty?: string;   // student
}

function toSessionUser(u: {
  _id?: string; name: string; matricule: string | null; email: string; role: Role;
  phone?: string; avatar?: string; classLevel?: string; specialty?: string;
}): SessionUser {
  return {
    _id: u._id, name: u.name, matricule: u.matricule ?? "", email: u.email, role: u.role,
    phone: u.phone, avatar: u.avatar, classLevel: u.classLevel, specialty: u.specialty,
  };
}

const USER_CACHE_KEY = "crms-user";

interface Ctx {
  user: SessionUser | null;
  /** True while the initial session (token -> profile) is being restored on page load. */
  loading: boolean;
  loginWithCredentials: (matricule: string, password: string) => Promise<{ ok: true; role: Role } | { ok: false; error: string }>;
  register: (input: { name: string; email: string; password: string; matricule: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProfile: (patch: Partial<Omit<SessionUser, "role" | "email">>) => void;
  logout: () => void;
  can: (p: Permission) => boolean;
}

const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Pulls the current profile from the backend and updates both React state
  // and the localStorage cache. Used on mount, and again whenever the tab
  // regains focus — that second call is what picks up role/permission
  // changes made outside this tab (a direct DB edit, or an admin changing
  // your role from another session) without requiring a manual hard reload.
  const refreshProfile = (): Promise<void> => {
    if (!getToken()) return Promise.resolve();
    return getProfileRequest()
      .then((profile) => {
        const su = toSessionUser(profile);
        setUser(su);
        window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(su));
      })
      .catch(() => {
        setToken(null);
        window.localStorage.removeItem(USER_CACHE_KEY);
        setUser(null);
      });
  };

  // On mount: if a token exists, hydrate instantly from the cached user
  // (fast paint, no flash-of-logged-out), then re-validate against
  // GET /api/users/profile in the background. If the token is invalid/
  // expired, the profile call throws (401) and we clear the session.
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    try {
      const raw = window.localStorage.getItem(USER_CACHE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {}

    refreshProfile().finally(() => setLoading(false));
  }, []);

  // Re-sync whenever the tab regains focus (switching back from MongoDB
  // Compass, another browser tab, etc.) or becomes visible again. Silent —
  // no loading flicker — since the cached user is already showing.
  useEffect(() => {
    const onFocus = () => { if (getToken()) refreshProfile(); };
    const onVisibility = () => { if (document.visibilityState === "visible") onFocus(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const persist = (su: SessionUser | null) => {
    setUser(su);
    if (su) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(su));
    else window.localStorage.removeItem(USER_CACHE_KEY);
  };

  const loginWithCredentials: Ctx["loginWithCredentials"] = async (matricule, password) => {
    try {
      const res = await loginRequest(matricule.trim(), password);
      setToken(res.token);
      const su = toSessionUser(res);
      persist(su);
      return { ok: true, role: su.role };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Unable to sign in. Check your connection.";
      return { ok: false, error: message };
    }
  };

  const register: Ctx["register"] = async (input) => {
    try {
      const res = await registerRequest({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        matricule: input.matricule.trim(),
      });
      setToken(res.token);
      persist(toSessionUser(res));
      return { ok: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Unable to create account. Check your connection.";
      return { ok: false, error: message };
    }
  };

  const updateProfile: Ctx["updateProfile"] = (patch) => {
    if (!user) return;
    // Profile edits are persisted via PUT /api/users/:id from the Profile
    // page itself (it has the user's _id and full API access); this just
    // keeps the in-memory/session-cache copy in sync after that call.
    persist({ ...user, ...patch });
  };

  const logout = () => {
    logoutRequest().finally(() => persist(null));
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        register,
        updateProfile,
        logout,
        can: (p) => can(user?.role, p),
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}