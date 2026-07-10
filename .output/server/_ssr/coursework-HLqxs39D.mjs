import { s as apiRequest } from "./role-context-YJO8G-xL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coursework-HLqxs39D.js
var getAnnouncements = () => apiRequest("/announcements");
var createAnnouncement = (input) => apiRequest("/announcements", {
	method: "POST",
	body: input
});
var getCancellations = () => apiRequest("/cancellations");
var createCancellation = (input) => apiRequest("/cancellations", {
	method: "POST",
	body: input
});
var getMaterials = () => apiRequest("/materials");
function uploadMaterial(input) {
	const fd = new FormData();
	fd.append("course", input.course);
	fd.append("title", input.title);
	fd.append("file", input.file);
	return apiRequest("/materials", {
		method: "POST",
		body: fd,
		isFormData: true
	});
}
var recordMaterialDownload = (id) => apiRequest(`/materials/${id}/download`, { method: "PATCH" });
var deleteMaterial = (id) => apiRequest(`/materials/${id}`, { method: "DELETE" });
var getSubmissions = () => apiRequest("/materials/submissions");
function submitAssignment(input) {
	const fd = new FormData();
	fd.append("course", input.course);
	fd.append("note", input.note);
	fd.append("file", input.file);
	return apiRequest("/materials/submissions", {
		method: "POST",
		body: fd,
		isFormData: true
	});
}
var deleteSubmission = (id) => apiRequest(`/materials/submissions/${id}`, { method: "DELETE" });
//#endregion
export { getAnnouncements as a, getSubmissions as c, uploadMaterial as d, deleteSubmission as i, recordMaterialDownload as l, createCancellation as n, getCancellations as o, deleteMaterial as r, getMaterials as s, createAnnouncement as t, submitAssignment as u };
