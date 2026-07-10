import { apiRequest } from "./client";

export interface ApiAuditLog {
  _id: string;
  actor: { _id: string; name: string; email: string; role: string } | null;
  actorRole: string;
  action: string;
  module: string;
  targetId: string | null;
  details: unknown;
  ip: string | null;
  status: number;
  createdAt: string;
}
export interface AuditLogsResponse {
  total: number;
  page: number;
  pages: number;
  logs: ApiAuditLog[];
}

/** GET /api/audit — scoped server-side to "what this role manages"; admin sees everything. */
export const getAuditLogs = (query?: {
  module?: string; actor?: string; startDate?: string; endDate?: string; page?: number; limit?: number;
}) => apiRequest<AuditLogsResponse>("/audit", { query: query as any });

export interface ApiEvidenceDocument {
  _id: string;
  title: string;
  note: string;
  module: string;
  uploadedBy: { _id: string; name: string; email: string; role: string };
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  createdAt: string;
}

/** GET /api/audit/documents — admin sees every upload, everyone else only their own. */
export const getEvidenceDocuments = () => apiRequest<ApiEvidenceDocument[]>("/audit/documents");

export function uploadEvidenceDocument(input: { title: string; note?: string; module: string; file: File }) {
  const fd = new FormData();
  fd.append("title", input.title);
  fd.append("note", input.note ?? "");
  fd.append("module", input.module);
  fd.append("file", input.file);
  return apiRequest<ApiEvidenceDocument>("/audit/documents", { method: "POST", body: fd, isFormData: true });
}

export const deleteEvidenceDocument = (id: string) =>
  apiRequest<{ message: string }>(`/audit/documents/${id}`, { method: "DELETE" });
