import { apiRequest } from "./client";

export const getStudentReport = (studentId: string) => apiRequest<any>(`/reports/student/${studentId}`);
export const getCourseReport = (courseId: string) => apiRequest<any>(`/reports/course/${courseId}`);
export const getResourceUtilization = () => apiRequest<any>("/reports/utilization/by-resource");
export const getResourceTypeUtilization = () => apiRequest<any>("/reports/utilization/by-type");

export interface AuditQuery {
  module?: string;
  actor?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
export const getAuditLogs = (query?: AuditQuery) => apiRequest<any>("/audit", { query: query as any });
