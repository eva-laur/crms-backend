import { apiRequest, apiDownload } from "./client";

export interface ApiBooking {
  _id: string;
  resource: any;
  user: any;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  purpose?: string;
  status: "pending" | "approved" | "rejected" | "checked_out" | "returned" | "cancelled" | string;
  managerNote?: string;
  [key: string]: unknown;
}

export function getBookings(query?: { status?: string; resourceType?: string }) {
  return apiRequest<ApiBooking[]>("/bookings", { query: query as any });
}

export function getBookingById(id: string) {
  return apiRequest<ApiBooking>(`/bookings/${id}`);
}

export function createBooking(input: {
  resource: string;
  startTime?: string;
  endTime?: string;
  dueDate?: string;
  purpose?: string;
  onBehalfOf?: string;
}) {
  return apiRequest<ApiBooking>("/bookings", { method: "POST", body: input });
}

export function updateBookingStatus(id: string, status: "approved" | "rejected", managerNote?: string, dueDate?: string) {
  return apiRequest<ApiBooking>(`/bookings/${id}/status`, { method: "PATCH", body: { status, managerNote, dueDate } });
}

export function checkOutBooking(id: string, note?: string, condition?: string) {
  return apiRequest<{ message: string; booking: ApiBooking }>(`/bookings/${id}/checkout`, {
    method: "PATCH",
    body: { note, condition },
  });
}

export function returnBooking(id: string, condition?: string) {
  return apiRequest<{ message: string; booking: ApiBooking }>(`/bookings/${id}/return`, {
    method: "PATCH",
    body: { condition },
  });
}

export function cancelBooking(id: string) {
  return apiRequest<{ message: string; booking: ApiBooking }>(`/bookings/${id}/cancel`, { method: "PATCH" });
}

export function overrideBooking(id: string, justification: string) {
  return apiRequest<{ message: string; booking: ApiBooking; displaced: ApiBooking[] }>(`/bookings/${id}/override`, {
    method: "PATCH",
    body: { justification },
  });
}

export function getOverdueBookings() {
  return apiRequest<ApiBooking[]>("/bookings/overdue");
}

export function getResourceAvailability(resourceId: string, weekStart: string, weekEnd: string) {
  return apiRequest<Array<{ startTime: string; endTime: string; status: string }>>(
    `/bookings/resource/${resourceId}/availability`,
    { query: { weekStart, weekEnd } }
  );
}

export async function exportBookingsReport(format: "pdf" | "xlsx" | "csv") {
  const blob = await apiDownload("/bookings/export", { format });
  return blob;
}

export async function exportBookingsCalendar() {
  return apiDownload("/bookings/calendar");
}
