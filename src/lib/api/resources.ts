import { apiRequest } from "./client";

export interface ApiResource {
  _id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  capacity?: number;
  available?: boolean;
  underMaintenance?: boolean;
  maintenanceNote?: string;
  [key: string]: unknown;
}

export function getResources(query?: { type?: string; available?: boolean }) {
  return apiRequest<ApiResource[]>("/resources", { query: query as any });
}

export function getResourceById(id: string) {
  return apiRequest<ApiResource>(`/resources/${id}`);
}

export function createResource(input: Partial<ApiResource>) {
  return apiRequest<ApiResource>("/resources", { method: "POST", body: input });
}

export function updateResource(id: string, patch: Partial<ApiResource>) {
  return apiRequest<ApiResource>(`/resources/${id}`, { method: "PUT", body: patch });
}

export function deleteResource(id: string) {
  return apiRequest<{ message: string }>(`/resources/${id}`, { method: "DELETE" });
}

export function toggleResourceAvailability(id: string, available: boolean) {
  return apiRequest<ApiResource>(`/resources/${id}/availability`, { method: "PATCH", body: { available } });
}

export function setResourceMaintenance(id: string, maintenanceNote: string) {
  return apiRequest<ApiResource>(`/resources/${id}/maintenance`, { method: "PATCH", body: { maintenanceNote } });
}

export function clearResourceMaintenance(id: string) {
  return apiRequest<ApiResource>(`/resources/${id}/maintenance/clear`, { method: "PATCH" });
}
