import { s as apiRequest } from "./role-context-YJO8G-xL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-BpEolhg7.js
function getAllUsers() {
	return apiRequest("/users");
}
/** GET /api/users/lookup/:matricule — checkout-desk lookup (library/IT/lab managers). */
function lookupUserByMatricule(matricule) {
	return apiRequest(`/users/lookup/${encodeURIComponent(matricule)}`);
}
function updateUser(id, patch) {
	return apiRequest(`/users/${id}`, {
		method: "PUT",
		body: patch
	});
}
function deleteUser(id) {
	return apiRequest(`/users/${id}`, { method: "DELETE" });
}
//#endregion
export { updateUser as i, getAllUsers as n, lookupUserByMatricule as r, deleteUser as t };
