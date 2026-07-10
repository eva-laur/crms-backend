import { s as apiRequest } from "./role-context-YJO8G-xL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bus-CesgH2y4.js
var getFleet = () => apiRequest("/bus/fleet");
var getRoutes = () => apiRequest("/bus/routes");
var getMyReservations = () => apiRequest("/bus/reservations/my");
var getAllReservations = () => apiRequest("/bus/reservations");
//#endregion
export { getRoutes as i, getFleet as n, getMyReservations as r, getAllReservations as t };
