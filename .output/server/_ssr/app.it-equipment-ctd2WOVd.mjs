import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as PackageCheck, G as Headphones, H as Laptop, S as Projector, St as Cable, _t as Camera, b as Search, c as Tv, d as Trash2, k as Mic, n as Wrench, p as Tablet, w as Plus } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { c as updateBookingStatus, n as createBooking, r as getBookings, s as returnBooking, t as checkOutBooking } from "./bookings-BMnMGXf-.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { d as Cell, f as ResponsiveContainer, m as Legend, n as PieChart, p as Tooltip, u as Pie } from "../_libs/recharts+[...].mjs";
import { a as setResourceMaintenance, i as getResources, n as createResource, r as deleteResource, t as clearResourceMaintenance } from "./resources-CdRZ6Kye.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.it-equipment-ctd2WOVd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CAT_ICON = {
	Projector,
	Camera,
	Laptop,
	Microphone: Mic,
	Display: Tv,
	Tablet,
	Headset: Headphones,
	Cabling: Cable
};
var CAT_COLOR = {
	Projector: "oklch(0.62 0.16 155)",
	Camera: "oklch(0.82 0.16 88)",
	Laptop: "oklch(0.55 0.14 200)",
	Microphone: "oklch(0.68 0.18 30)",
	Display: "oklch(0.62 0.17 280)",
	Tablet: "oklch(0.72 0.14 160)",
	Headset: "oklch(0.55 0.10 100)",
	Cabling: "oklch(0.50 0.05 240)"
};
var CATEGORIES = [
	"Projector",
	"Camera",
	"Laptop",
	"Microphone",
	"Display",
	"Tablet",
	"Headset",
	"Cabling"
];
var CONDITIONS = [
	"Excellent",
	"Good",
	"Worn",
	"Faulty"
];
function dueIso(days) {
	const d = /* @__PURE__ */ new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().slice(0, 10);
}
function ITPage() {
	const { user, can } = useRole();
	if (!can("nav:itequipment")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	if (!user) return null;
	const canManage = can("action:manageIT");
	const canDelete = user.role === "admin";
	const queryClient = useQueryClient();
	const { data: items = [], isLoading: loadingItems } = useQuery({
		queryKey: ["resources", "equipment"],
		queryFn: () => getResources({ type: "equipment" })
	});
	const { data: allBookings = [], isLoading: loadingBookings } = useQuery({
		queryKey: [
			"bookings",
			"equipment",
			"all"
		],
		queryFn: () => getBookings({ resourceType: "equipment" })
	});
	const checkouts = allBookings.filter((b) => b.status === "checked_out");
	const requests = allBookings.filter((b) => [
		"pending",
		"approved",
		"rejected"
	].includes(b.status));
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["resources", "equipment"] });
		queryClient.invalidateQueries({ queryKey: ["bookings", "equipment"] });
	};
	const displayStatus = (it) => {
		if (it.status === "under_maintenance") return "maintenance";
		if (checkouts.some((c) => (c.resource?._id ?? c.resource) === it._id)) return "checked_out";
		return "available";
	};
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const filtered = (0, import_react.useMemo)(() => items.filter((it) => {
		if (cat !== "all" && it.category !== cat) return false;
		if (status !== "all" && displayStatus(it) !== status) return false;
		const needle = q.trim().toLowerCase();
		if (!needle) return true;
		return `${it.assetTag ?? ""} ${it.name} ${it.brand ?? ""} ${it.category ?? ""} ${it.location ?? ""}`.toLowerCase().includes(needle);
	}), [
		items,
		q,
		cat,
		status,
		checkouts
	]);
	const metrics = (0, import_react.useMemo)(() => ({
		total: items.reduce((a, i) => a + (i.quantity ?? 0), 0),
		available: items.filter((i) => displayStatus(i) === "available").reduce((a, i) => a + (i.quantity ?? 0), 0),
		out: checkouts.length,
		mx: items.filter((i) => i.status === "under_maintenance").length,
		pending: requests.filter((r) => r.status === "pending").length
	}), [
		items,
		checkouts,
		requests
	]);
	const usageData = (0, import_react.useMemo)(() => {
		const acc = {};
		for (const c of checkouts) {
			const cat = c.resource?.category;
			if (!cat) continue;
			acc[cat] = (acc[cat] ?? 0) + 1;
		}
		if (Object.keys(acc).length === 0) {
			for (const it of items) if (displayStatus(it) === "checked_out") acc[it.category] = (acc[it.category] ?? 0) + 1;
		}
		return Object.entries(acc).map(([name, value]) => ({
			name,
			value
		}));
	}, [items, checkouts]);
	const empty = {
		assetTag: "",
		name: "",
		category: "Projector",
		brand: "",
		condition: "Excellent",
		location: "",
		quantity: 1
	};
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(empty);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const addItem = async () => {
		if (!form.assetTag || !form.name) {
			toast.error("Asset tag and name required");
			return;
		}
		setSaving(true);
		try {
			await createResource({
				name: form.name,
				assetTag: form.assetTag,
				type: "equipment",
				category: form.category,
				brand: form.brand,
				condition: form.condition,
				location: form.location,
				quantity: form.quantity
			});
			toast.success(`${form.assetTag} added (${form.quantity} unit${form.quantity > 1 ? "s" : ""})`);
			setForm(empty);
			setOpen(false);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to add item");
		} finally {
			setSaving(false);
		}
	};
	const [requestingId, setRequestingId] = (0, import_react.useState)(null);
	const requestItem = async (it) => {
		setRequestingId(it._id);
		try {
			await createBooking({
				resource: it._id,
				dueDate: dueIso(3),
				purpose: "User request"
			});
			toast.success(`Request submitted for ${it.assetTag ?? it.name}`);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to submit request");
		} finally {
			setRequestingId(null);
		}
	};
	const [decidingId, setDecidingId] = (0, import_react.useState)(null);
	const decide = async (r, decision) => {
		setDecidingId(r._id);
		try {
			await updateBookingStatus(r._id, decision);
			if (decision === "approved") await checkOutBooking(r._id);
			toast.success(`Request ${decision}`);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to update request");
		} finally {
			setDecidingId(null);
		}
	};
	const [returningId, setReturningId] = (0, import_react.useState)(null);
	const checkin = async (c) => {
		setReturningId(c._id);
		try {
			await returnBooking(c._id);
			toast.success(`Returned · ${c.resource?.assetTag ?? c.resource?.name ?? "item"}`);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Return failed");
		} finally {
			setReturningId(null);
		}
	};
	const setItemStatus = async (it, next) => {
		try {
			if (next === "maintenance") {
				const note = window.prompt(`Maintenance note for ${it.assetTag ?? it.name}:`, "Under maintenance");
				if (note === null) return;
				await setResourceMaintenance(it._id, note);
			} else await clearResourceMaintenance(it._id);
			toast.success(`${it.assetTag ?? it.name} → ${next === "maintenance" ? "under maintenance" : "available"}`);
			refresh();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to update status");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "IT Equipment Inventory",
		subtitle: canManage ? "Projectors · cameras · laptops · mics · displays — issue & track" : "Browse available equipment and submit a request"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-3 sm:px-5 lg:px-8 py-6 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-5 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Laptop,
						label: "Units tracked",
						value: loadingItems ? "…" : `${metrics.total}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Cable,
						label: "Available",
						value: loadingItems ? "…" : `${metrics.available}`,
						tone: "success"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Camera,
						label: "Active checkouts",
						value: loadingBookings ? "…" : `${metrics.out}`,
						tone: "primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Wrench,
						label: "In maintenance",
						value: loadingItems ? "…" : `${metrics.mx}`,
						tone: "warning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
						icon: Mic,
						label: "Pending requests",
						value: loadingBookings ? "…" : `${metrics.pending}`,
						tone: "warning"
					})
				]
			}),
			canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Equipment usage by category"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Share of current checkouts across hardware types"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: usageData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground text-center py-10",
				children: "No active checkouts to chart yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-72",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
						data: usageData,
						dataKey: "value",
						nameKey: "name",
						innerRadius: 55,
						outerRadius: 95,
						paddingAngle: 3,
						children: usageData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
							fill: CAT_COLOR[d.name] ?? "oklch(0.55 0.05 160)",
							stroke: "none"
						}, d.name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						iconType: "circle",
						wrapperStyle: { fontSize: 11 }
					})
				] }) })
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "inventory",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "inventory",
							children: "Inventory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "checkout",
							children: canManage ? "Checkout desk" : "My checkouts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "requests",
							children: canManage ? "Requests" : "My requests"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "inventory",
						className: "space-y-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-base flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-primary" }), " Inventory"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Search across asset tag, name, brand, category and storage location"
							})] }), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
								open,
								onOpenChange: setOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add item"]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
									className: "sm:max-w-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add an inventory item" }) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Asset tag",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.assetTag,
														onChange: (e) => setForm({
															...form,
															assetTag: e.target.value.toUpperCase()
														}),
														placeholder: "PRJ-024"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Name",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.name,
														onChange: (e) => setForm({
															...form,
															name: e.target.value
														})
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Brand",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.brand,
														onChange: (e) => setForm({
															...form,
															brand: e.target.value
														})
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Category",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.category,
														onValueChange: (v) => setForm({
															...form,
															category: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: c,
															children: c
														}, c)) })]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Condition",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.condition,
														onValueChange: (v) => setForm({
															...form,
															condition: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: CONDITIONS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: c,
															children: c
														}, c)) })]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Quantity",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: 1,
														value: form.quantity,
														onChange: (e) => setForm({
															...form,
															quantity: Math.max(1, Number(e.target.value) || 1)
														})
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Location",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.location,
														onChange: (e) => setForm({
															...form,
															location: e.target.value
														}),
														placeholder: "AV Cage · A"
													})
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: addItem,
											disabled: saving,
											children: saving ? "Adding…" : "Add to inventory"
										}) })
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: q,
											onChange: (e) => setQ(e.target.value),
											placeholder: "Search asset tag, name, brand…",
											className: "pl-9"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: cat,
										onValueChange: (v) => setCat(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "All categories"
										}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: c,
											children: c
										}, c))] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: status,
										onValueChange: (v) => setStatus(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "All statuses"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "available",
												children: "Available"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "checked_out",
												children: "Checked out"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "maintenance",
												children: "Maintenance"
											})
										] })]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Tag" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Qty"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Condition" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Location" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Actions"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
									loadingItems && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 8,
										className: "text-center text-muted-foreground py-6",
										children: "Loading…"
									}) }),
									!loadingItems && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 8,
										className: "text-center text-muted-foreground py-6",
										children: "No items match."
									}) }),
									filtered.map((it) => {
										const Icon = CAT_ICON[it.category] ?? Laptop;
										const st = displayStatus(it);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-[11px]",
												children: it.assetTag ?? "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium",
														children: it.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground",
														children: ["· ", it.brand]
													})
												]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px]",
												children: it.category
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono",
												children: it.quantity
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: it.condition === "Excellent" ? "border-success/40 text-success" : it.condition === "Good" ? "border-primary/40 text-primary" : it.condition === "Worn" ? "border-warning/40 text-warning" : "border-destructive/40 text-destructive",
												children: it.condition
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-xs text-muted-foreground",
												children: it.location
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: canManage && st !== "checked_out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: st === "maintenance" ? "maintenance" : "available",
												onValueChange: (v) => setItemStatus(it, v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-7 w-[140px] text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "available",
													children: "Available"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "maintenance",
													children: "Maintenance"
												})] })]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: st === "available" ? "border-success/40 text-success" : st === "checked_out" ? "border-primary/40 text-primary" : "border-warning/40 text-warning",
												children: st.replace("_", " ")
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "inline-flex gap-1",
													children: [!canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														disabled: st !== "available" || requestingId === it._id,
														onClick: () => requestItem(it),
														children: requestingId === it._id ? "…" : "Request"
													}), canDelete && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "icon",
														variant: "ghost",
														className: "h-7 w-7 text-destructive",
														onClick: async () => {
															try {
																await deleteResource(it._id);
																toast.success("Item removed");
																refresh();
															} catch (e) {
																toast.error(e instanceof ApiError ? e.message : "Failed to remove item");
															}
														},
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
													})]
												})
											})
										] }, it._id);
									})
								] })] })
							})]
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "checkout",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-4 w-4 text-primary" }),
								" ",
								canManage ? "Active equipment checkouts" : "My equipment checkouts"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "All borrowed IT assets flow through this desk."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ticket" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
								canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Borrower" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Due" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Action"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
								loadingBookings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: canManage ? 5 : 4,
									className: "text-center text-muted-foreground py-6",
									children: "Loading…"
								}) }),
								!loadingBookings && checkouts.map((c) => {
									const overdue = c.dueDate && new Date(c.dueDate) < /* @__PURE__ */ new Date();
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-xs",
											children: c._id.slice(-6)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
											c.resource?.assetTag,
											" · ",
											c.resource?.name
										] }),
										canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm",
											children: c.user?.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground font-mono",
											children: c.user?.matricule ?? c.user?.email
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: c.dueDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: overdue ? "destructive" : "outline",
											className: !overdue ? "border-success/40 text-success" : "",
											children: [String(c.dueDate).slice(0, 10), overdue && " · overdue"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-xs",
											children: "—"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: returningId === c._id,
												onClick: () => checkin(c),
												children: returningId === c._id ? "…" : "Check in"
											})
										})
									] }, c._id);
								}),
								!loadingBookings && checkouts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: canManage ? 5 : 4,
									className: "text-center text-muted-foreground py-6",
									children: "No active checkouts."
								}) })
							] })] })
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "requests",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: canManage ? "Equipment requests" : "My requests"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: canManage ? "Approve or reject borrower requests; approval issues a checkout" : "Track the status of your submitted requests"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Req" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item" }),
								canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Requester" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Need by" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Purpose" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Action"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
								loadingBookings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: canManage ? 7 : 6,
									className: "text-center text-muted-foreground py-6",
									children: "Loading…"
								}) }),
								!loadingBookings && requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-xs",
										children: r._id.slice(-6)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
										r.resource?.assetTag,
										" · ",
										r.resource?.name
									] }),
									canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm",
										children: r.user?.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground font-mono",
										children: r.user?.matricule ?? r.user?.email
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-xs",
										children: r.dueDate ? String(r.dueDate).slice(0, 10) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-xs max-w-[260px] truncate",
										title: r.purpose,
										children: r.purpose
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: r.status === "approved" ? "border-success/40 text-success" : r.status === "rejected" ? "border-destructive/40 text-destructive" : "border-warning/40 text-warning",
										children: r.status
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: canManage && r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "inline-flex gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												disabled: decidingId === r._id,
												onClick: () => decide(r, "approved"),
												children: "Approve"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												disabled: decidingId === r._id,
												onClick: () => decide(r, "rejected"),
												children: "Reject"
											})]
										})
									})
								] }, r._id)),
								!loadingBookings && requests.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: canManage ? 7 : 6,
									className: "text-center text-muted-foreground py-6",
									children: "No requests."
								}) })
							] })] })
						})] })
					})
				]
			})
		]
	})] });
}
function Metric({ icon: Icon, label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-4 flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-10 w-10 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4.5 w-4.5 text-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground truncate",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `text-lg font-semibold leading-tight ${tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : ""}`,
				children: value
			})]
		})]
	}) });
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
//#endregion
export { ITPage as component };
