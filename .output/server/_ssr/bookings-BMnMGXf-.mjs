import { s as apiRequest } from "./role-context-YJO8G-xL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bookings-BMnMGXf-.js
function getBookings(query) {
	return apiRequest("/bookings", { query });
}
function createBooking(input) {
	return apiRequest("/bookings", {
		method: "POST",
		body: input
	});
}
function updateBookingStatus(id, status, managerNote, dueDate) {
	return apiRequest(`/bookings/${id}/status`, {
		method: "PATCH",
		body: {
			status,
			managerNote,
			dueDate
		}
	});
}
function checkOutBooking(id, note, condition) {
	return apiRequest(`/bookings/${id}/checkout`, {
		method: "PATCH",
		body: {
			note,
			condition
		}
	});
}
function returnBooking(id, condition) {
	return apiRequest(`/bookings/${id}/return`, {
		method: "PATCH",
		body: { condition }
	});
}
function overrideBooking(id, justification) {
	return apiRequest(`/bookings/${id}/override`, {
		method: "PATCH",
		body: { justification }
	});
}
function getOverdueBookings() {
	return apiRequest("/bookings/overdue");
}
function getResourceAvailability(resourceId, weekStart, weekEnd) {
	return apiRequest(`/bookings/resource/${resourceId}/availability`, { query: {
		weekStart,
		weekEnd
	} });
}
//#endregion
export { getResourceAvailability as a, updateBookingStatus as c, getOverdueBookings as i, createBooking as n, overrideBooking as o, getBookings as r, returnBooking as s, checkOutBooking as t };
