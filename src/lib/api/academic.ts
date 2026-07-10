import { apiRequest } from "./client";

/* ── Courses ─────────────────────────────────────────────────────────── */
export const getCourses = () => apiRequest<any[]>("/courses");
export const getCourseById = (id: string) => apiRequest<any>(`/courses/${id}`);
export const createCourse = (input: any) => apiRequest<any>("/courses", { method: "POST", body: input });
export const updateCourse = (id: string, patch: any) => apiRequest<any>(`/courses/${id}`, { method: "PUT", body: patch });
export const deleteCourse = (id: string) => apiRequest<{ message: string }>(`/courses/${id}`, { method: "DELETE" });
export const enrollStudent = (courseId: string, studentId: string) =>
  apiRequest<any>(`/courses/${courseId}/enroll`, { method: "PUT", body: { studentId } });
export const unenrollStudent = (courseId: string, studentId: string) =>
  apiRequest<any>(`/courses/${courseId}/unenroll`, { method: "PUT", body: { studentId } });

/* ── Course progress (syllabus tracking) ────────────────────────────────── */
export const getCourseProgressList = () => apiRequest<any[]>("/courseProgress");
export const getCourseProgressById = (id: string) => apiRequest<any>(`/courseProgress/${id}`);
export const createCourseProgress = (input: any) => apiRequest<any>("/courseProgress", { method: "POST", body: input });
export const addProgressTopic = (id: string, topic: any) =>
  apiRequest<any>(`/courseProgress/${id}/topic`, { method: "PUT", body: topic });
export const addProgressAssessment = (id: string, assessment: any) =>
  apiRequest<any>(`/courseProgress/${id}/assessment`, { method: "PUT", body: assessment });
export const updateTopicStatus = (id: string, topicId: string, status: string) =>
  apiRequest<any>(`/courseProgress/${id}/topic/${topicId}/status`, { method: "PATCH", body: { status } });

/* ── Attendance ──────────────────────────────────────────────────────── */
export const getAttendance = () => apiRequest<any[]>("/attendance");
export const getAttendanceById = (id: string) => apiRequest<any>(`/attendance/${id}`);
export const getAttendanceByCourse = (courseId: string) => apiRequest<any[]>(`/attendance/course/${courseId}`);
export const getAttendanceByStudent = (studentId: string) => apiRequest<any[]>(`/attendance/student/${studentId}`);
export const createAttendance = (input: any) => apiRequest<any>("/attendance", { method: "POST", body: input });
export const markAttendance = (id: string, input: any) => apiRequest<any>(`/attendance/${id}/mark`, { method: "PUT", body: input });

/* ── Results ─────────────────────────────────────────────────────────── */
export const getResults = () => apiRequest<any[]>("/results");
export const getResultById = (id: string) => apiRequest<any>(`/results/${id}`);
export const getResultsByStudent = (studentId: string) => apiRequest<any[]>(`/results/student/${studentId}`);
export const getResultsByCourse = (courseId: string) => apiRequest<any[]>(`/results/course/${courseId}`);
export const createResult = (input: any) => apiRequest<any>("/results", { method: "POST", body: input });
export const addAssessmentResult = (id: string, input: any) => apiRequest<any>(`/results/${id}/assessment`, { method: "PUT", body: input });
export const updateAssessmentResult = (id: string, assessmentId: string, input: any) =>
  apiRequest<any>(`/results/${id}/assessment/${assessmentId}`, { method: "PUT", body: input });

/* ── Logbooks ────────────────────────────────────────────────────────── */
export const getLogbooks = () => apiRequest<any[]>("/logbooks");
export const getMyLogbooks = () => apiRequest<any[]>("/logbooks/my");
export const getLogbookStudentView = (courseId: string) => apiRequest<any>(`/logbooks/student-view/${courseId}`);
export const getLogbookByCourse = (courseId: string) => apiRequest<any>(`/logbooks/course/${courseId}`);
export const getLogbookById = (id: string) => apiRequest<any>(`/logbooks/${id}`);
export const createLogbook = (input: any) => apiRequest<any>("/logbooks", { method: "POST", body: input });
export const addOutlineTopic = (id: string, topic: any) => apiRequest<any>(`/logbooks/${id}/outline`, { method: "POST", body: topic });
export const updateOutlineStatus = (id: string, topicId: string, status: string) =>
  apiRequest<any>(`/logbooks/${id}/outline/${topicId}/status`, { method: "PATCH", body: { status } });
export const addSession = (id: string, session: any) => apiRequest<any>(`/logbooks/${id}/sessions`, { method: "POST", body: session });
export const addAssignment = (id: string, assignment: any) => apiRequest<any>(`/logbooks/${id}/assignments`, { method: "POST", body: assignment });
export const recordAssignmentMark = (id: string, assignmentId: string, mark: any) =>
  apiRequest<any>(`/logbooks/${id}/assignments/${assignmentId}/marks`, { method: "PATCH", body: mark });
export const addAssessment = (id: string, assessment: any) => apiRequest<any>(`/logbooks/${id}/assessments`, { method: "POST", body: assessment });
export const recordAssessmentScore = (id: string, assessmentId: string, score: any) =>
  apiRequest<any>(`/logbooks/${id}/assessments/${assessmentId}/scores`, { method: "PATCH", body: score });
export const addDeadline = (id: string, deadline: any) => apiRequest<any>(`/logbooks/${id}/deadlines`, { method: "POST", body: deadline });
export const deleteDeadline = (id: string, deadlineId: string) =>
  apiRequest<{ message: string }>(`/logbooks/${id}/deadlines/${deadlineId}`, { method: "DELETE" });
