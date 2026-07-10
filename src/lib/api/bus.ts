import { apiRequest } from "./client";

/* Fleet */
export const getFleet = () => apiRequest<any[]>("/bus/fleet");
export const createBus = (input: any) => apiRequest<any>("/bus/fleet", { method: "POST", body: input });
export const updateBus = (id: string, patch: any) => apiRequest<any>(`/bus/fleet/${id}`, { method: "PUT", body: patch });
export const deleteBus = (id: string) => apiRequest<{ message: string }>(`/bus/fleet/${id}`, { method: "DELETE" });

/* Routes */
export const getRoutes = () => apiRequest<any[]>("/bus/routes");
export const getRouteById = (id: string) => apiRequest<any>(`/bus/routes/${id}`);
export const createRoute = (input: any) => apiRequest<any>("/bus/routes", { method: "POST", body: input });
export const updateRoute = (id: string, patch: any) => apiRequest<any>(`/bus/routes/${id}`, { method: "PUT", body: patch });
export const deleteRoute = (id: string) => apiRequest<{ message: string }>(`/bus/routes/${id}`, { method: "DELETE" });

export const getSeatAvailability = (routeId: string, travelDate: string) =>
  apiRequest<any>(`/bus/routes/${routeId}/availability`, { query: { travelDate } });

/* Reservations */
export const createReservation = (input: { routeId: string; travelDate: string; seatNumber: number }) =>
  apiRequest<any>("/bus/reservations", { method: "POST", body: input });
export const getMyReservations = () => apiRequest<any[]>("/bus/reservations/my");
export const getAllReservations = () => apiRequest<any[]>("/bus/reservations");
export const cancelReservation = (id: string) => apiRequest<any>(`/bus/reservations/${id}/cancel`, { method: "PATCH" });
export const confirmReservation = (id: string) => apiRequest<any>(`/bus/reservations/${id}/confirm`, { method: "PATCH" });

/* Bus requests (faculty trip requests) */
export const createBusRequest = (input: any) => apiRequest<any>("/bus/requests", { method: "POST", body: input });
export const getMyBusRequests = () => apiRequest<any[]>("/bus/requests/my");
export const getAllBusRequests = () => apiRequest<any[]>("/bus/requests");
export const reviewBusRequest = (id: string, input: { status: "approved" | "rejected"; managerNote?: string }) =>
  apiRequest<any>(`/bus/requests/${id}/review`, { method: "PATCH", body: input });

export const getBusOccupancyReport = () => apiRequest<any>("/bus/reports/occupancy");

/* Mileage / fuel logs — multipart uploads for odometer/receipt photos */
export const getFuelLogs = () => apiRequest<any[]>("/bus/mileage");
export const getFuelLogById = (id: string) => apiRequest<any>(`/bus/mileage/${id}`);

export function addFuelLog(fields: Record<string, string | number>, files?: Record<string, File | File[]>) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v)));
  if (files) {
    Object.entries(files).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((f) => fd.append(k, f));
      else fd.append(k, v);
    });
  }
  return apiRequest<any>("/bus/mileage", { method: "POST", body: fd, isFormData: true });
}

export const updateFuelLog = (id: string, patch: any) => apiRequest<any>(`/bus/mileage/${id}`, { method: "PUT", body: patch });
export const deleteFuelLog = (id: string) => apiRequest<{ message: string }>(`/bus/mileage/${id}`, { method: "DELETE" });
export const verifyFuelLog = (id: string) => apiRequest<any>(`/bus/mileage/${id}/verify`, { method: "PATCH" });
export const deleteAttachment = (id: string, attachmentId: string) =>
  apiRequest<any>(`/bus/mileage/${id}/attachments/${attachmentId}`, { method: "DELETE" });

export const getConsumptionSummary = () => apiRequest<any>("/bus/mileage/analytics/summary");
export const getMonthlyBreakdown = () => apiRequest<any>("/bus/mileage/analytics/monthly");
export const getEfficiencyRanking = () => apiRequest<any>("/bus/mileage/analytics/efficiency");
