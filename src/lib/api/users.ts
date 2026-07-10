import { apiRequest } from "./client";
import type { ApiUser } from "./auth";

export function getAllUsers() {
  return apiRequest<ApiUser[]>("/users");
}

export function getUserById(id: string) {
  return apiRequest<ApiUser>(`/users/${id}`);
}

/** GET /api/users/lookup/:matricule — checkout-desk lookup (library/IT/lab managers). */
export function lookupUserByMatricule(matricule: string) {
  return apiRequest<ApiUser>(`/users/lookup/${encodeURIComponent(matricule)}`);
}

export function updateUser(id: string, patch: Partial<ApiUser>) {
  return apiRequest<ApiUser>(`/users/${id}`, { method: "PUT", body: patch });
}

export function deleteUser(id: string) {
  return apiRequest<{ message: string }>(`/users/${id}`, { method: "DELETE" });
}
