import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { f as useRole, r as MANAGER_AUDIT_SCOPE, s as apiRequest, t as ApiError } from "./role-context-YJO8G-xL.mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as FileText, At as Activity, Q as FileUp, T as Paperclip, b as Search, d as Trash2, g as ShieldCheck, h as Sparkles, i as User, it as Clock, l as TriangleAlert, lt as CircleCheck, nt as Download, st as CircleX } from "../_libs/lucide-react.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardHeader, i as CardContent, n as Badge, o as CardTitle, r as Card, t as AppHeader } from "./card-eBpIeksT.mjs";
import { t as Button } from "./button-PJVP9td7.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, o as DialogTrigger, r as DialogFooter, t as Dialog } from "./dialog-B8mBdC_P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.audit-pUQtAoj2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** GET /api/audit — scoped server-side to "what this role manages"; admin sees everything. */
var getAuditLogs = (query) => apiRequest("/audit", { query });
/** GET /api/audit/documents — admin sees every upload, everyone else only their own. */
var getEvidenceDocuments = () => apiRequest("/audit/documents");
function uploadEvidenceDocument(input) {
	const fd = new FormData();
	fd.append("title", input.title);
	fd.append("note", input.note ?? "");
	fd.append("module", input.module);
	fd.append("file", input.file);
	return apiRequest("/audit/documents", {
		method: "POST",
		body: fd,
		isFormData: true
	});
}
var deleteEvidenceDocument = (id) => apiRequest(`/audit/documents/${id}`, { method: "DELETE" });
function fmtDate(iso) {
	return new Date(iso).toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function relTime(iso) {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 6e4);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}
function actorInitials(a) {
	const parts = a.replace(/[._-]/g, " ").split(" ").filter(Boolean);
	return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}
function friendlyAction(a) {
	return a.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function severity(status, action) {
	if (action.includes("DELETE") || action.includes("FAILED") || status >= 500) return "danger";
	if (action === "OVERRIDE_BOOKING" || status >= 400 && status < 500) return "warn";
	if (action.startsWith("CREATE") || action === "USER_LOGIN" || status >= 200 && status < 300) return "success";
	return "info";
}
function humanSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
var SEV_STYLE = {
	success: {
		ring: "ring-emerald-500/30",
		bg: "bg-emerald-500/10",
		text: "text-emerald-500",
		label: "Success",
		Icon: CircleCheck
	},
	warn: {
		ring: "ring-amber-500/30",
		bg: "bg-amber-500/10",
		text: "text-amber-500",
		label: "Warning",
		Icon: TriangleAlert
	},
	danger: {
		ring: "ring-rose-500/30",
		bg: "bg-rose-500/10",
		text: "text-rose-500",
		label: "Critical",
		Icon: CircleX
	},
	info: {
		ring: "ring-indigo-500/30",
		bg: "bg-indigo-500/10",
		text: "text-indigo-500",
		label: "Info",
		Icon: Activity
	}
};
var MODULES = [
	"bookings",
	"resources",
	"bus",
	"users",
	"materials",
	"courses",
	"results",
	"attendance",
	"notifications"
];
function AuditPage() {
	const { user, can } = useRole();
	if (!can("nav:audit")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/app/dashboard" });
	const scope = user ? MANAGER_AUDIT_SCOPE[user.role] : void 0;
	const isAdmin = user?.role === "admin";
	const { data: logsResponse, isLoading: loadingLogs } = useQuery({
		queryKey: ["audit", "logs"],
		queryFn: () => getAuditLogs({ limit: 300 })
	});
	const logs = logsResponse?.logs ?? [];
	const [moduleFilter, setModuleFilter] = (0, import_react.useState)("all");
	const [actorFilter, setActorFilter] = (0, import_react.useState)("all");
	const [sevFilter, setSevFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [visible, setVisible] = (0, import_react.useState)(20);
	const actors = (0, import_react.useMemo)(() => {
		const names = /* @__PURE__ */ new Set();
		logs.forEach((l) => names.add(l.actor?.name ?? l.actorRole ?? "system"));
		return Array.from(names).sort();
	}, [logs]);
	const filtered = (0, import_react.useMemo)(() => {
		return logs.filter((l) => {
			const actorName = l.actor?.name ?? l.actorRole ?? "system";
			if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
			if (actorFilter !== "all" && actorName !== actorFilter) return false;
			if (sevFilter !== "all" && severity(l.status, l.action) !== sevFilter) return false;
			if (query) {
				const q = query.toLowerCase();
				if (![
					l._id,
					actorName,
					l.action,
					l.module,
					l.targetId ?? "",
					JSON.stringify(l.details ?? "")
				].some((v) => v.toLowerCase().includes(q))) return false;
			}
			return true;
		});
	}, [
		logs,
		moduleFilter,
		actorFilter,
		sevFilter,
		query
	]);
	(0, import_react.useEffect)(() => {
		setVisible(20);
	}, [
		moduleFilter,
		actorFilter,
		sevFilter,
		query
	]);
	const stats = (0, import_react.useMemo)(() => {
		const bySev = {
			success: 0,
			warn: 0,
			danger: 0,
			info: 0
		};
		logs.forEach((l) => {
			bySev[severity(l.status, l.action)]++;
		});
		return {
			total: logs.length,
			success: bySev.success,
			warn: bySev.warn,
			danger: bySev.danger,
			info: bySev.info,
			last: logs[0]?.createdAt
		};
	}, [logs]);
	const exportCsv = () => {
		const rows = ["id,timestamp,actor,role,action,module,target,severity,status", ...filtered.map((l) => {
			const sev = severity(l.status, l.action);
			const actorName = l.actor?.name ?? l.actorRole ?? "system";
			return [
				l._id,
				l.createdAt,
				actorName,
				l.actorRole,
				l.action,
				l.module,
				l.targetId ?? "",
				sev,
				l.status
			].join(",");
		})];
		const blob = new Blob([rows.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `crms-activity-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success(`Exported ${filtered.length} entries`);
	};
	const queryClient = useQueryClient();
	const { data: docs = [], isLoading: loadingDocs } = useQuery({
		queryKey: ["audit", "documents"],
		queryFn: getEvidenceDocuments
	});
	const refreshDocs = () => queryClient.invalidateQueries({ queryKey: ["audit", "documents"] });
	const removeDoc = async (id) => {
		try {
			await deleteEvidenceDocument(id);
			toast.success("Document removed");
			refreshDocs();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Failed to remove document");
		}
	};
	const grouped = (0, import_react.useMemo)(() => {
		const map = {};
		filtered.slice(0, visible).forEach((l) => {
			const key = new Date(l.createdAt).toLocaleDateString(void 0, {
				weekday: "long",
				month: "long",
				day: "numeric"
			});
			(map[key] ||= []).push(l);
		});
		return Object.entries(map);
	}, [filtered, visible]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
		title: "Activity & Evidence",
		subtitle: isAdmin ? "A clean, human-readable trail of everything that happened across the system, with room to attach supporting documents." : "A clean, human-readable trail of what happened in your domain, when, and by whom — with room to attach supporting documents."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-5 lg:p-8 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						tone: "primary",
						icon: Activity,
						label: "Total activity",
						value: String(stats.total),
						sub: stats.last ? relTime(stats.last) + " · latest" : ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						tone: "success",
						icon: CircleCheck,
						label: "Successful",
						value: String(stats.success),
						sub: "Completed operations"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						tone: "warn",
						icon: TriangleAlert,
						label: "Needs attention",
						value: String(stats.warn),
						sub: "Warnings & overrides"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						tone: "danger",
						icon: CircleX,
						label: "Critical",
						value: String(stats.danger),
						sub: "Failures & deletions"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border/70",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col lg:flex-row lg:items-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Search",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Actor, action, record…",
											className: "h-9 pl-8",
											value: query,
											onChange: (e) => setQuery(e.target.value)
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Module",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: moduleFilter,
										onValueChange: setModuleFilter,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "All modules"
										}), (scope ?? MODULES).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: m,
											children: friendlyAction(m)
										}, m))] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Actor",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: actorFilter,
										onValueChange: setActorFilter,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "Any actor"
										}), actors.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: a,
											children: a
										}, a))] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterField, {
									label: "Severity",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: sevFilter,
										onValueChange: setSevFilter,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-9",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "all",
												children: "All levels"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "success",
												children: "Successful"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "warn",
												children: "Needs attention"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "danger",
												children: "Critical"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "info",
												children: "Informational"
											})
										] })]
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDocDialog, {
								scope,
								onSaved: refreshDocs
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: exportCsv,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1fr_360px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), " Activity timeline"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: ["Grouped by day, newest first", scope ? ` · scoped to ${scope.map(friendlyAction).join(" & ")}` : ""]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "text-[10px]",
						children: [filtered.length, " entries"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-6",
					children: [loadingLogs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-12 text-center text-sm text-muted-foreground",
						children: "Loading activity…"
					}) : grouped.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-12 text-center text-sm text-muted-foreground",
						children: "No activity matches your filters."
					}) : grouped.map(([day, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] uppercase tracking-wider text-muted-foreground",
									children: day
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px flex-1 bg-border/60" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: items.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: items.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineRow, { entry: l }, l._id))
						})]
					}, day)), visible < filtered.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setVisible((v) => v + 20),
							children: [
								"Load more (",
								filtered.length - visible,
								" remaining)"
							]
						})
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "h-fit",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4 text-primary" }),
								" ",
								isAdmin ? "Evidence documents (all)" : "My uploaded files"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: isAdmin ? "Every file uploaded from this page, by anyone" : "Reports, receipts, memos & policies you've attached"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							className: "text-[10px]",
							children: docs.length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-3",
						children: loadingDocs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-8 text-center text-xs text-muted-foreground",
							children: "Loading…"
						}) : docs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-dashed border-border/70 rounded-lg py-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-6 w-6 mx-auto text-muted-foreground/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-2",
								children: "No documents yet. Upload evidence to keep the trail complete."
							})]
						}) : docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/60 bg-card/50 p-3 hover:border-primary/40 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-9 w-9 rounded-lg bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center text-primary shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium truncate",
											children: d.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-muted-foreground truncate",
											children: [
												friendlyAction(d.module),
												" · ",
												humanSize(d.fileSize),
												" · ",
												relTime(d.createdAt)
											]
										}),
										d.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground/80 mt-1 line-clamp-2",
											children: d.note
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[10px] text-muted-foreground mt-1",
											children: ["by ", d.uploadedBy?.name ?? "—"]
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 mt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs gap-1 flex-1",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: d.fileUrl,
										target: "_blank",
										rel: "noreferrer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " Download"]
									})
								}), (isAdmin || user?._id === d.uploadedBy?._id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
									onClick: () => removeDoc(d._id),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})]
							})]
						}, d._id))
					})]
				})]
			})
		]
	})] });
}
function StatCard({ icon: Icon, label, value, sub, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `h-11 w-11 rounded-xl flex items-center justify-center ring-1 ${{
						primary: "bg-primary/10 ring-primary/20 text-primary",
						success: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500",
						warn: "bg-amber-500/10 ring-amber-500/20 text-amber-500",
						danger: "bg-rose-500/10 ring-rose-500/20 text-rose-500"
					}[tone]}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold leading-tight",
							children: value
						}),
						sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground mt-0.5",
							children: sub
						})
					]
				})]
			})
		})
	});
}
function FilterField({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), children]
	});
}
function TimelineRow({ entry }) {
	const s = SEV_STYLE[severity(entry.status, entry.action)];
	const actorName = entry.actor?.name ?? entry.actorRole ?? "system";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-card/70 transition-all",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary",
					children: actorInitials(actorName)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-background ${s.bg} ${s.text}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.Icon, { className: "h-2.5 w-2.5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center flex-wrap gap-x-2 gap-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: actorName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: ["· ", entry.actorRole.replace(/_/g, " ")]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: friendlyAction(entry.action).toLowerCase()
						}),
						entry.targetId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "text-[10px] font-mono",
							children: entry.targetId.slice(-8)
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 mt-1.5 text-[10.5px] text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
							" ",
							fmtDate(entry.createdAt),
							" · ",
							relTime(entry.createdAt)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3" }),
							" ",
							friendlyAction(entry.module)
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				className: `shrink-0 border-0 ${s.bg} ${s.text}`,
				children: s.label
			})
		]
	});
}
function UploadDocDialog({ scope, onSaved }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [mod, setMod] = (0, import_react.useState)((scope ?? MODULES)[0]);
	const [file, setFile] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const MAX_BYTES = 20 * 1024 * 1024;
	const reset = () => {
		setTitle("");
		setNote("");
		setFile(null);
		if (inputRef.current) inputRef.current.value = "";
	};
	const submit = async () => {
		if (!title.trim() || !file) {
			toast.error("Title and file are required");
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error(`File exceeds ${humanSize(MAX_BYTES)} limit`);
			return;
		}
		setBusy(true);
		try {
			await uploadEvidenceDocument({
				title: title.trim(),
				note: note.trim(),
				module: mod,
				file
			});
			toast.success("Document attached to the audit trail");
			reset();
			setOpen(false);
			onSaved();
		} catch (e) {
			toast.error(e instanceof ApiError ? e.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: (o) => {
			setOpen(o);
			if (!o) reset();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3.5 w-3.5" }), " Upload document"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-primary" }), " Attach evidence document"]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "e.g. October fuel receipts"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Related module" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: mod,
								onValueChange: setMod,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: (scope ?? MODULES).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: m,
									children: friendlyAction(m)
								}, m)) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Notes ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground font-normal",
								children: "(optional)"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								rows: 3,
								value: note,
								onChange: (e) => setNote(e.target.value),
								placeholder: "Context, reference numbers, related event IDs…"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["File ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground font-normal",
								children: [
									"(max ",
									humanSize(MAX_BYTES),
									")"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-dashed border-border/70 rounded-lg p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									ref: inputRef,
									type: "file",
									className: "hidden",
									id: "audit-file",
									onChange: (e) => setFile(e.target.files?.[0] ?? null)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									htmlFor: "audit-file",
									className: "cursor-pointer inline-flex flex-col items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-6 w-6 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm",
											children: file ? file.name : "Click to choose a file"
										}),
										file && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: humanSize(file.size)
										})
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => setOpen(false),
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: submit,
					disabled: busy,
					children: busy ? "Uploading…" : "Attach document"
				})] })
			]
		})]
	});
}
//#endregion
export { AuditPage as component };
