import { apiRequest } from "./client";

export interface ApiNotification {
  _id: string;
  recipient: string;
  type: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export const getMyNotifications = () => apiRequest<ApiNotification[]>("/notifications/me");
export const getUnreadCount = () => apiRequest<{ unreadCount: number }>("/notifications/me/unread-count");
export const markAllAsRead = () => apiRequest<{ message: string }>("/notifications/me/read-all", { method: "PATCH" });
export const markAsRead = (id: string) => apiRequest<ApiNotification>(`/notifications/${id}/read`, { method: "PATCH" });
export const deleteNotification = (id: string) => apiRequest<{ message: string }>(`/notifications/${id}`, { method: "DELETE" });
export const sendNotification = (input: { recipient: string; type: string; title?: string; message: string }) =>
  apiRequest<ApiNotification>("/notifications", { method: "POST", body: input });
export const sendBulkNotification = (input: { recipients: string[]; type: string; title?: string; message: string }) =>
  apiRequest<{ message: string }>("/notifications/bulk", { method: "POST", body: input });
