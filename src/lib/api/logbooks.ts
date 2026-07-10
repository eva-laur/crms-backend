import { apiRequest } from "./client";

export interface ApiOutlineTopic {
  _id: string;
  week: number;
  title: string;
  description?: string;
  status: "pending" | "covered" | "partially_covered";
}
export interface ApiLogbook {
  _id: string;
  course: any;
  lecturer: any;
  academicYear: string;
  semester: string;
  outline: ApiOutlineTopic[];
  sessions: any[];
  assignments: any[];
  assessments: any[];
  deadlines: any[];
  [key: string]: unknown;
}

export const getLogbooks = () => apiRequest<ApiLogbook[]>("/logbooks");
export const getMyLogbooks = () => apiRequest<ApiLogbook[]>("/logbooks/my");
export const getLogbookById = (id: string) => apiRequest<ApiLogbook>(`/logbooks/${id}`);
export const getLogbookByCourse = (courseId: string) => apiRequest<ApiLogbook[]>(`/logbooks/course/${courseId}`);
export const getStudentLogbookView = (courseId: string) => apiRequest<any>(`/logbooks/student-view/${courseId}`);

export const createLogbook = (input: { course: string; academicYear: string; semester: string }) =>
  apiRequest<ApiLogbook>("/logbooks", { method: "POST", body: input });

export const addOutlineTopic = (id: string, input: { week: number; title: string; description?: string }) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/outline`, { method: "POST", body: input });
export const updateOutlineStatus = (id: string, topicId: string, status: ApiOutlineTopic["status"]) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/outline/${topicId}/status`, { method: "PATCH", body: { status } });
export const deleteOutlineTopic = (id: string, topicId: string) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/outline/${topicId}`, { method: "DELETE" });

export const addSession = (id: string, input: { date?: string; topicCovered: string; description?: string; hoursDelivered?: number; remarks?: string }) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/sessions`, { method: "POST", body: input });

export const addDeadline = (id: string, input: { title: string; type?: string; date: string; description?: string }) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/deadlines`, { method: "POST", body: input });
export const deleteLogbookDeadline = (id: string, deadlineId: string) =>
  apiRequest<ApiLogbook>(`/logbooks/${id}/deadlines/${deadlineId}`, { method: "DELETE" });
