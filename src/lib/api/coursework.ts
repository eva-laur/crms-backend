import { apiRequest } from "./client";

/* ── Announcements ───────────────────────────────────────────────────── */
export interface ApiAnnouncement {
  _id: string;
  course: any;
  title: string;
  body: string;
  postedBy: any;
  createdAt: string;
}
export const getAnnouncements = () => apiRequest<ApiAnnouncement[]>("/announcements");
export const createAnnouncement = (input: { course: string; title: string; body: string }) =>
  apiRequest<ApiAnnouncement>("/announcements", { method: "POST", body: input });
export const deleteAnnouncement = (id: string) => apiRequest<{ message: string }>(`/announcements/${id}`, { method: "DELETE" });

/* ── Class cancellations ─────────────────────────────────────────────── */
export interface ApiCancellation {
  _id: string;
  course: any;
  date: string;
  timeSlot: string;
  reason: string;
  cancelledBy: any;
  createdAt: string;
}
export const getCancellations = () => apiRequest<ApiCancellation[]>("/cancellations");
export const createCancellation = (input: { course: string; date: string; timeSlot: string; reason: string }) =>
  apiRequest<ApiCancellation>("/cancellations", { method: "POST", body: input });

/* ── Course materials & submissions ──────────────────────────────────── */
export interface ApiMaterial {
  _id: string;
  course: any;
  title: string;
  uploadedBy: any;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  downloads: string[];
  createdAt: string;
}
export interface ApiSubmission {
  _id: string;
  course: any;
  student: any;
  note: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  createdAt: string;
}

export const getMaterials = () => apiRequest<ApiMaterial[]>("/materials");
export function uploadMaterial(input: { course: string; title: string; file: File }) {
  const fd = new FormData();
  fd.append("course", input.course);
  fd.append("title", input.title);
  fd.append("file", input.file);
  return apiRequest<ApiMaterial>("/materials", { method: "POST", body: fd, isFormData: true });
}
export const recordMaterialDownload = (id: string) => apiRequest<ApiMaterial>(`/materials/${id}/download`, { method: "PATCH" });
export const deleteMaterial = (id: string) => apiRequest<{ message: string }>(`/materials/${id}`, { method: "DELETE" });

export const getSubmissions = () => apiRequest<ApiSubmission[]>("/materials/submissions");
export function submitAssignment(input: { course: string; note: string; file: File }) {
  const fd = new FormData();
  fd.append("course", input.course);
  fd.append("note", input.note);
  fd.append("file", input.file);
  return apiRequest<ApiSubmission>("/materials/submissions", { method: "POST", body: fd, isFormData: true });
}
export const deleteSubmission = (id: string) => apiRequest<{ message: string }>(`/materials/submissions/${id}`, { method: "DELETE" });
