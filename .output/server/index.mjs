globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/academic-CVHFRp3v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cf-IVfT1csVtqto2iYGEZuSpngB0tU\"",
		"mtime": "2026-07-10T09:04:03.967Z",
		"size": 719,
		"path": "../public/assets/academic-CVHFRp3v.js"
	},
	"/assets/activity-DGo8Tm8n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df-40O9ClPg8DEmPzwtmfFG13PU/8E\"",
		"mtime": "2026-07-10T09:04:03.970Z",
		"size": 223,
		"path": "../public/assets/activity-DGo8Tm8n.js"
	},
	"/assets/app.announcements-CvZBJ4lL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102c-0Ou5JxTszI62yh+VF4GCo8/eakE\"",
		"mtime": "2026-07-10T09:04:03.970Z",
		"size": 4140,
		"path": "../public/assets/app.announcements-CvZBJ4lL.js"
	},
	"/assets/app-DJmYlmW3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23e-9DrS3Ei6xi6XkDLxdx8YHFo9D54\"",
		"mtime": "2026-07-10T09:04:03.970Z",
		"size": 574,
		"path": "../public/assets/app-DJmYlmW3.js"
	},
	"/assets/app.audit-Ce0unJZa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"466b-Whd+O8B0i290O0sxSafM6c0XBTs\"",
		"mtime": "2026-07-10T09:04:03.972Z",
		"size": 18027,
		"path": "../public/assets/app.audit-Ce0unJZa.js"
	},
	"/assets/app.bus-BzOS9elh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9487-oS4PVByLDTzuDWAeLKCMILA9bcM\"",
		"mtime": "2026-07-10T09:04:03.977Z",
		"size": 38023,
		"path": "../public/assets/app.bus-BzOS9elh.js"
	},
	"/assets/app.assets-B-e1h4qb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1062-iU8k2GiCCrUuVajUNiNG4O3F4JM\"",
		"mtime": "2026-07-10T09:04:03.970Z",
		"size": 4194,
		"path": "../public/assets/app.assets-B-e1h4qb.js"
	},
	"/assets/app.bookings-DXvuXEzw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"109b-CEyW5H9moQzpziioqW6LZVrsBHY\"",
		"mtime": "2026-07-10T09:04:03.972Z",
		"size": 4251,
		"path": "../public/assets/app.bookings-DXvuXEzw.js"
	},
	"/assets/app.cancellations-dCTr-Oj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11f0-A/LTu0k0jJ8magBAxeuWTVeFqbk\"",
		"mtime": "2026-07-10T09:04:03.977Z",
		"size": 4592,
		"path": "../public/assets/app.cancellations-dCTr-Oj3.js"
	},
	"/assets/app.config-D_-jJaJ3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c5a-+WvVqQRR7A1pfE9vKNaOqItz/HQ\"",
		"mtime": "2026-07-10T09:04:03.979Z",
		"size": 3162,
		"path": "../public/assets/app.config-D_-jJaJ3.js"
	},
	"/assets/app.checkout-7V_OAYTy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2134-Vy+kKLjxE0Qt1y4uylHFdRkJK3o\"",
		"mtime": "2026-07-10T09:04:03.979Z",
		"size": 8500,
		"path": "../public/assets/app.checkout-7V_OAYTy.js"
	},
	"/assets/app.conflicts-CCky8toP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"354a-nVRDu4S8Aq8vyENzEyUoMua5fN4\"",
		"mtime": "2026-07-10T09:04:03.980Z",
		"size": 13642,
		"path": "../public/assets/app.conflicts-CCky8toP.js"
	},
	"/assets/app.course-materials-h3E6F7en.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2dcd-ecbMxmYKMjZAW29LHIVG95jq610\"",
		"mtime": "2026-07-10T09:04:03.980Z",
		"size": 11725,
		"path": "../public/assets/app.course-materials-h3E6F7en.js"
	},
	"/assets/app.course-progress-CrFEki6Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1cd9-Y5UmiPwwi3dkMXj4vhzNlUJ8CYc\"",
		"mtime": "2026-07-10T09:04:03.980Z",
		"size": 7385,
		"path": "../public/assets/app.course-progress-CrFEki6Y.js"
	},
	"/assets/app.it-equipment-CH7qStFD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4bb0-l/o6YYqPPG+7a90p23ZBpe82fXs\"",
		"mtime": "2026-07-10T09:04:03.984Z",
		"size": 19376,
		"path": "../public/assets/app.it-equipment-CH7qStFD.js"
	},
	"/assets/app.library-BfReypXa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ca-u1NW6QPjdM5+8uvQ8Ek9BuIR4N0\"",
		"mtime": "2026-07-10T09:04:03.984Z",
		"size": 13514,
		"path": "../public/assets/app.library-BfReypXa.js"
	},
	"/assets/app.dashboard-CVjY0ZrQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b58a-FuqMzN0rX5iEe2XM83ra1So0xzQ\"",
		"mtime": "2026-07-10T09:04:03.984Z",
		"size": 46474,
		"path": "../public/assets/app.dashboard-CVjY0ZrQ.js"
	},
	"/assets/app.logbook-B329Cy3E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4bc3-hu3+SP7KSQtMpE3cPa6fH+xZ8Po\"",
		"mtime": "2026-07-10T09:04:03.986Z",
		"size": 19395,
		"path": "../public/assets/app.logbook-B329Cy3E.js"
	},
	"/assets/app.profile-FkJySJSO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"269d-o9ZRzABzGbB/mqxDBrCwORfOgQQ\"",
		"mtime": "2026-07-10T09:04:03.986Z",
		"size": 9885,
		"path": "../public/assets/app.profile-FkJySJSO.js"
	},
	"/assets/app.reports-DjYCls6c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"845c-OqAMHKVXS9npoksIpyIxadeejqM\"",
		"mtime": "2026-07-10T09:04:03.987Z",
		"size": 33884,
		"path": "../public/assets/app.reports-DjYCls6c.js"
	},
	"/assets/app.schedule-DF97DWmy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e39-Iq7Biwgo9aJvzpKfCVQmGVU/s5I\"",
		"mtime": "2026-07-10T09:04:03.989Z",
		"size": 11833,
		"path": "../public/assets/app.schedule-DF97DWmy.js"
	},
	"/assets/app.users-D902t0TL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190f-xcMl1Ti8Zn1XzMgmbLrVCHA0Wng\"",
		"mtime": "2026-07-10T09:04:03.989Z",
		"size": 6415,
		"path": "../public/assets/app.users-D902t0TL.js"
	},
	"/assets/AppSidebar-DH9t408D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2765-PWZ4hcZBwI2hMuw7AjGt0uvSu3o\"",
		"mtime": "2026-07-10T09:04:03.965Z",
		"size": 10085,
		"path": "../public/assets/AppSidebar-DH9t408D.js"
	},
	"/assets/app.results-D_2MGbkO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2827-lo8NZ2DsucVkhhp/+4tTwtOkGwE\"",
		"mtime": "2026-07-10T09:04:03.987Z",
		"size": 10279,
		"path": "../public/assets/app.results-D_2MGbkO.js"
	},
	"/assets/BarChart-CTj5MIHJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"294-TEwQ94Y2p6qHV1vEm/cLLcUpr38\"",
		"mtime": "2026-07-10T09:04:03.965Z",
		"size": 660,
		"path": "../public/assets/BarChart-CTj5MIHJ.js"
	},
	"/assets/bookings-TpPXb1Lx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2de-vR5GAX3+bCVYIQnpEwmv9TRkvmg\"",
		"mtime": "2026-07-10T09:04:03.990Z",
		"size": 734,
		"path": "../public/assets/bookings-TpPXb1Lx.js"
	},
	"/assets/button-BQyGKn-Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"538-fz6hjU5gvRgQb3t3K+DcMBFTbo4\"",
		"mtime": "2026-07-10T09:04:03.992Z",
		"size": 1336,
		"path": "../public/assets/button-BQyGKn-Y.js"
	},
	"/assets/bus-XWXcjnf2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc-17l4jY/kzJ1u7zKNTdJyu3acr5E\"",
		"mtime": "2026-07-10T09:04:03.992Z",
		"size": 188,
		"path": "../public/assets/bus-XWXcjnf2.js"
	},
	"/assets/card-nh4V18N_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12e1e-NUezPq6h469uVF0jNrs6O2NnkY0\"",
		"mtime": "2026-07-10T09:04:03.994Z",
		"size": 77342,
		"path": "../public/assets/card-nh4V18N_.js"
	},
	"/assets/chevron-right-D58zPOrK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-sv3B2HzlHHd2z4/NThvYu6gVpL8\"",
		"mtime": "2026-07-10T09:04:03.994Z",
		"size": 119,
		"path": "../public/assets/chevron-right-D58zPOrK.js"
	},
	"/assets/circle-alert-X0RxCnVF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef-rrAS+gNWX+Ei5Ky6qDMFJa7bC+o\"",
		"mtime": "2026-07-10T09:04:03.996Z",
		"size": 239,
		"path": "../public/assets/circle-alert-X0RxCnVF.js"
	},
	"/assets/circle-check-Cfuajc3i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-COK0+HmYt9VZnNfsFdhtzAXXvPs\"",
		"mtime": "2026-07-10T09:04:03.996Z",
		"size": 167,
		"path": "../public/assets/circle-check-Cfuajc3i.js"
	},
	"/assets/circle-IubheVoa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77-m46u7bdX4llNCzyMBafX94QC2Q8\"",
		"mtime": "2026-07-10T09:04:03.994Z",
		"size": 119,
		"path": "../public/assets/circle-IubheVoa.js"
	},
	"/assets/clock-XjW-xgZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-+k78BjcWgfwVxqEmQedEHYxotbk\"",
		"mtime": "2026-07-10T09:04:03.996Z",
		"size": 158,
		"path": "../public/assets/clock-XjW-xgZu.js"
	},
	"/assets/circle-x-DwVmBwZ1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4-ivH2qpLLfq+a8itvqrlJZIgTK4k\"",
		"mtime": "2026-07-10T09:04:03.996Z",
		"size": 196,
		"path": "../public/assets/circle-x-DwVmBwZ1.js"
	},
	"/assets/cloud-upload-BJ85HvJn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0-9dS6WUX5G62nMbLoFgaMmYluanI\"",
		"mtime": "2026-07-10T09:04:03.998Z",
		"size": 240,
		"path": "../public/assets/cloud-upload-BJ85HvJn.js"
	},
	"/assets/coursework-DqSiRqW6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-MyDt/dphM7LDwP8RKyIuWqOugdw\"",
		"mtime": "2026-07-10T09:04:03.998Z",
		"size": 847,
		"path": "../public/assets/coursework-DqSiRqW6.js"
	},
	"/assets/dialog-BrgQ2usL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"834-s7YlvfCOW74KTUCiY6Zrr5/JoeI\"",
		"mtime": "2026-07-10T09:04:03.998Z",
		"size": 2100,
		"path": "../public/assets/dialog-BrgQ2usL.js"
	},
	"/assets/dist-B2kMnfu5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dc1-vbHAgo8ZbqBzYiJd3QxSpEmEc8I\"",
		"mtime": "2026-07-10T09:04:03.998Z",
		"size": 3521,
		"path": "../public/assets/dist-B2kMnfu5.js"
	},
	"/assets/dist-BiWA0yO9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2076-hvLipxDIospqqXnQWKJUmsvWdvk\"",
		"mtime": "2026-07-10T09:04:03.998Z",
		"size": 8310,
		"path": "../public/assets/dist-BiWA0yO9.js"
	},
	"/assets/dist-BxBcRp7L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102-fKu/BBZ7OTHIb/Zgj0pSE77Hn/E\"",
		"mtime": "2026-07-10T09:04:04.000Z",
		"size": 258,
		"path": "../public/assets/dist-BxBcRp7L.js"
	},
	"/assets/generateCategoricalChart-FNx9YpLn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"548cd-PNcHpu5I8DX3AgcplqcEsLpYRMM\"",
		"mtime": "2026-07-10T09:04:04.002Z",
		"size": 346317,
		"path": "../public/assets/generateCategoricalChart-FNx9YpLn.js"
	},
	"/assets/index-FqPCZluA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b311-VfF3tgwr9/purjIQ6wMKAVx3Lkw\"",
		"mtime": "2026-07-10T09:04:03.963Z",
		"size": 373521,
		"path": "../public/assets/index-FqPCZluA.js"
	},
	"/assets/file-text-rP2XDp0s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-EnXUWpQX0YCLRgj6shX8DJ4oZLk\"",
		"mtime": "2026-07-10T09:04:04.000Z",
		"size": 374,
		"path": "../public/assets/file-text-rP2XDp0s.js"
	},
	"/assets/input-u0Zz7mzh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26e-t3pOGGkZQGvBIqcqFwSgs8heT8c\"",
		"mtime": "2026-07-10T09:04:04.002Z",
		"size": 622,
		"path": "../public/assets/input-u0Zz7mzh.js"
	},
	"/assets/download-D4OQOhhm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dd-6UrdiNeijp3SuVwb7+27k/DgNdU\"",
		"mtime": "2026-07-10T09:04:04.000Z",
		"size": 221,
		"path": "../public/assets/download-D4OQOhhm.js"
	},
	"/assets/dist-COSWEj7Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"525-ma1kxeuYaXNIAgMnuTOyH/ZJPLY\"",
		"mtime": "2026-07-10T09:04:04.000Z",
		"size": 1317,
		"path": "../public/assets/dist-COSWEj7Y.js"
	},
	"/assets/label-QbWOCL2U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-kL5K04cFOamQDC8iYypXB9a8Hk0\"",
		"mtime": "2026-07-10T09:04:04.002Z",
		"size": 626,
		"path": "../public/assets/label-QbWOCL2U.js"
	},
	"/assets/package-check-iFAxm68h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19f-0y5yhJFWuRK3PVwxaEv90rlTyfs\"",
		"mtime": "2026-07-10T09:04:04.002Z",
		"size": 415,
		"path": "../public/assets/package-check-iFAxm68h.js"
	},
	"/assets/PieChart-BaOMsUgj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64e1-NeOi/5nL98CNWgRVkokkcAnaRb8\"",
		"mtime": "2026-07-10T09:04:03.965Z",
		"size": 25825,
		"path": "../public/assets/PieChart-BaOMsUgj.js"
	},
	"/assets/plus-COReXdw-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e-zR8OcrLZPvgznyllzgmC2sdjM+4\"",
		"mtime": "2026-07-10T09:04:04.004Z",
		"size": 142,
		"path": "../public/assets/plus-COReXdw-.js"
	},
	"/assets/progress--9sREMma.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7d1-Ru37jHIfB0PR7bKCO0QszM0/93k\"",
		"mtime": "2026-07-10T09:04:04.004Z",
		"size": 2001,
		"path": "../public/assets/progress--9sREMma.js"
	},
	"/assets/resources-CzzHN8LQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-TJerweMbA9O1bM7d+rl5o+ju7Pk\"",
		"mtime": "2026-07-10T09:04:04.004Z",
		"size": 422,
		"path": "../public/assets/resources-CzzHN8LQ.js"
	},
	"/assets/role-context-DU3CcDdc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49ef-xuRGEtcmV1Vf2C5lM8Ec5ygQKCg\"",
		"mtime": "2026-07-10T09:04:04.004Z",
		"size": 18927,
		"path": "../public/assets/role-context-DU3CcDdc.js"
	},
	"/assets/routes-DMAm4nNW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f2d-EmGu4yQqhc13t7wsELcOg51Xo3I\"",
		"mtime": "2026-07-10T09:04:04.006Z",
		"size": 7981,
		"path": "../public/assets/routes-DMAm4nNW.js"
	},
	"/assets/save-CZA8EBqG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13c-khVYbg29saS6+avtqLMhZq5tZY0\"",
		"mtime": "2026-07-10T09:04:04.006Z",
		"size": 316,
		"path": "../public/assets/save-CZA8EBqG.js"
	},
	"/assets/select-BdkL6idB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"55dd-kXIn8oqrxXg6TB9Ef8TC/XUBRUU\"",
		"mtime": "2026-07-10T09:04:04.006Z",
		"size": 21981,
		"path": "../public/assets/select-BdkL6idB.js"
	},
	"/assets/send-DI1Gu1tn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117-4YxPAQWRFDXbE5y0nP+Gwmu+lrE\"",
		"mtime": "2026-07-10T09:04:04.012Z",
		"size": 279,
		"path": "../public/assets/send-DI1Gu1tn.js"
	},
	"/assets/styles-BtgLQQgR.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1abb2-sY0A9BjM5gjV/DspG55oyYEvrbM\"",
		"mtime": "2026-07-10T09:04:04.021Z",
		"size": 109490,
		"path": "../public/assets/styles-BtgLQQgR.css"
	},
	"/assets/shield-alert-CLjFvb-j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-3S9MsHhMwNuWQcUHZCEcWrt6nuU\"",
		"mtime": "2026-07-10T09:04:04.013Z",
		"size": 342,
		"path": "../public/assets/shield-alert-CLjFvb-j.js"
	},
	"/assets/tabs-CAURRBmF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d4b-x2tuwXdOV2J4kYU1svXZ22yLh0Y\"",
		"mtime": "2026-07-10T09:04:04.015Z",
		"size": 3403,
		"path": "../public/assets/tabs-CAURRBmF.js"
	},
	"/assets/table-v8IQcqF3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66d-p0QgTuBzdcJAQw36ADy6KrvXzKg\"",
		"mtime": "2026-07-10T09:04:04.013Z",
		"size": 1645,
		"path": "../public/assets/table-v8IQcqF3.js"
	},
	"/assets/textarea-DaUPJ6mM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"208-qrjM/+8tmEx+eXo4o4rrW7fmqxg\"",
		"mtime": "2026-07-10T09:04:04.019Z",
		"size": 520,
		"path": "../public/assets/textarea-DaUPJ6mM.js"
	},
	"/assets/trash-2-jonAY-og.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13d-57hnzSqvNvTo2o2LvX4OWmAPxj4\"",
		"mtime": "2026-07-10T09:04:04.019Z",
		"size": 317,
		"path": "../public/assets/trash-2-jonAY-og.js"
	},
	"/assets/user-DOAp2bAc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b9-og+NTkaUsAdMlFfVjguYq+DC9bo\"",
		"mtime": "2026-07-10T09:04:04.019Z",
		"size": 185,
		"path": "../public/assets/user-DOAp2bAc.js"
	},
	"/assets/users-BDnEz6hx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12a-NNaLGD0DP4biCEWCudPsMZcJO0A\"",
		"mtime": "2026-07-10T09:04:04.019Z",
		"size": 298,
		"path": "../public/assets/users-BDnEz6hx.js"
	},
	"/assets/utils-jOn9Nw8q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"704a-PQpl922ScbfeObQ5wX04iH8Z650\"",
		"mtime": "2026-07-10T09:04:04.019Z",
		"size": 28746,
		"path": "../public/assets/utils-jOn9Nw8q.js"
	},
	"/assets/YAxis-PBX7nari.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8902-JcbtEWx+8LjRj/OarySeeH+DiMg\"",
		"mtime": "2026-07-10T09:04:03.965Z",
		"size": 35074,
		"path": "../public/assets/YAxis-PBX7nari.js"
	},
	"/assets/iuc-campus-DTINZ3Bs.jpg": {
		"type": "image/jpeg",
		"etag": "\"bea1e-WXKpzfPsUWo9Tx2rY5S9VEtdrig\"",
		"mtime": "2026-07-10T09:04:04.021Z",
		"size": 780830,
		"path": "../public/assets/iuc-campus-DTINZ3Bs.jpg"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_BbeJnF = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_BbeJnF
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
