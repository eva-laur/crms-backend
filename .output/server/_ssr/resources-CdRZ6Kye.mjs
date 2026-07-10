import { s as apiRequest } from "./role-context-YJO8G-xL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-CdRZ6Kye.js
function getResources(query) {
	return apiRequest("/resources", { query });
}
function createResource(input) {
	return apiRequest("/resources", {
		method: "POST",
		body: input
	});
}
function deleteResource(id) {
	return apiRequest(`/resources/${id}`, { method: "DELETE" });
}
function setResourceMaintenance(id, maintenanceNote) {
	return apiRequest(`/resources/${id}/maintenance`, {
		method: "PATCH",
		body: { maintenanceNote }
	});
}
function clearResourceMaintenance(id) {
	return apiRequest(`/resources/${id}/maintenance/clear`, { method: "PATCH" });
}
//#endregion
export { setResourceMaintenance as a, getResources as i, createResource as n, deleteResource as r, clearResourceMaintenance as t };
