import { apiRequest, setToken } from "./client";
import type { Role } from "@/lib/role-context";

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  matricule: string | null;
  phone?: string;
  avatar?: string;
  classLevel?: string;
  specialty?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse extends ApiUser {
  token: string;
}

/** POST /api/users/register — always creates a "student" account server-side. */
export function registerRequest(input: { name: string; email: string; password: string; matricule?: string }) {
  return apiRequest<AuthResponse>("/users/register", {
    method: "POST",
    body: input,
    skipAuth: true,
  });
}

/** POST /api/users/login — backend authenticates by matricule, not email. */
export function loginRequest(matricule: string, password: string) {
  return apiRequest<AuthResponse>("/users/login", {
    method: "POST",
    body: { matricule, password },
    skipAuth: true,
  });
}

export async function logoutRequest() {
  try {
    await apiRequest("/users/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export function getProfileRequest() {
  return apiRequest<ApiUser>("/users/profile");
}

export function changePasswordRequest(currentPassword: string, newPassword: string) {
  return apiRequest<{ message: string }>("/users/change-password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}
