import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as ROLE_META, f as useRole, n as BASE_URL, s as apiRequest, u as getToken } from "./role-context-YJO8G-xL.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { A as Menu, Dt as Bell, O as Moon, b as Search, m as Sun, mt as ChevronDown, t as X } from "../_libs/lucide-react.mjs";
import { t as AppSidebar } from "./AppSidebar-BaQrVn22.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as DialogOverlay, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as Trigger, n as Portal, r as Root2, t as Content2 } from "../_libs/radix-ui__react-popover.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-eBpIeksT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Popover = Root2;
var PopoverTrigger = Trigger;
var PopoverContent = import_react.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)", className),
	...props
}) }));
PopoverContent.displayName = Content2.displayName;
var badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
		outline: "text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
var getMyNotifications = () => apiRequest("/notifications/me");
var getUnreadCount = () => apiRequest("/notifications/me/unread-count");
var markAllAsRead = () => apiRequest("/notifications/me/read-all", { method: "PATCH" });
var markAsRead = (id) => apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
var TONE_BY_TYPE = {
	booking_approved: "success",
	booking_checked_out: "default",
	booking_rejected: "warning",
	booking_overdue: "warning",
	conflict: "warning"
};
var toneOf = (n) => TONE_BY_TYPE[n.type] ?? "default";
var timeAgo = (iso) => {
	const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1e3));
	if (s < 60) return "just now";
	if (s < 3600) return `${Math.floor(s / 60)} min ago`;
	if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
	return new Date(iso).toLocaleDateString();
};
function useDarkMode() {
	const [dark, setDark] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return window.localStorage.getItem("crms-theme") === "dark";
	});
	(0, import_react.useEffect)(() => {
		if (typeof document === "undefined") return;
		document.documentElement.classList.toggle("dark", dark);
		try {
			window.localStorage.setItem("crms-theme", dark ? "dark" : "light");
		} catch {}
	}, [dark]);
	return [dark, () => setDark((d) => !d)];
}
function AppHeader({ title, subtitle }) {
	const { user } = useRole();
	const [dark, toggleDark] = useDarkMode();
	const [sheetOpen, setSheetOpen] = (0, import_react.useState)(false);
	const queryClient = useQueryClient();
	const { data: unread } = useQuery({
		queryKey: ["notifications", "unread-count"],
		queryFn: getUnreadCount,
		enabled: !!user,
		refetchInterval: 3e4
	});
	const { data: notifications = [] } = useQuery({
		queryKey: ["notifications", "me"],
		queryFn: getMyNotifications,
		enabled: !!user,
		refetchInterval: 3e4
	});
	const invalidateNotifs = () => {
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	};
	const onOpenChange = (open) => {
		if (open && (unread?.unreadCount ?? 0) > 0) markAllAsRead().then(invalidateNotifs).catch(() => {});
	};
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const token = getToken();
		if (!token) return;
		const es = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`);
		es.addEventListener("notification", (e) => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			try {
				const n = JSON.parse(e.data);
				toast(n.title || "New notification", { description: n.message });
			} catch {}
		});
		es.onerror = () => {};
		return () => es.close();
	}, [user?._id]);
	if (!user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-[36px] z-40 border-b border-border bg-background/85 backdrop-blur no-print",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, {
					open: sheetOpen,
					onOpenChange: setSheetOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "lg:hidden h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center shrink-0",
							"aria-label": "Open navigation",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "left",
						className: "p-0 w-64",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
							className: "sr-only",
							children: "Navigation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, { onNavigate: () => setSheetOpen(false) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg sm:text-xl md:text-2xl font-semibold tracking-tight truncate",
						children: title
					}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate",
						children: subtitle
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden xl:flex items-center gap-2 px-3 h-9 rounded-lg bg-input border border-border w-60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								placeholder: "Search…",
								className: "bg-transparent outline-none text-xs flex-1 placeholder:text-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "text-[10px] text-muted-foreground border border-border rounded px-1",
								children: "⌘K"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: toggleDark,
						"aria-label": "Toggle dark mode",
						className: "h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center",
						children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4 text-warning" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
						onOpenChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), (unread?.unreadCount ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center",
									children: unread.unreadCount > 9 ? "9+" : unread.unreadCount
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PopoverContent, {
							align: "end",
							className: "w-80 p-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-4 py-3 border-b border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: "Notifications"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Across the campus operations grid"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "divide-y divide-border max-h-80 overflow-auto",
								children: [notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "px-4 py-6 text-center text-xs text-muted-foreground",
									children: "No notifications yet."
								}), notifications.slice(0, 20).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									onClick: () => {
										if (!n.read) markAsRead(n._id).then(invalidateNotifs).catch(() => {});
									},
									className: `px-4 py-3 hover:bg-accent/50 flex items-start gap-3 cursor-pointer ${n.read ? "" : "bg-accent/20"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 mt-1.5 rounded-full ${toneOf(n) === "success" ? "bg-success" : toneOf(n) === "warning" ? "bg-warning" : "bg-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm leading-snug",
											children: n.title || n.message
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: timeAgo(n.createdAt)
										})]
									})]
								}, n._id))]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden sm:flex items-center gap-2 pl-2 border-l border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-full bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center text-xs font-semibold",
								children: user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden md:block leading-tight",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium truncate max-w-[140px]",
									children: user.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "h-4 px-1.5 text-[10px] font-medium",
										children: ROLE_META[user.role].short
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })
						]
					})
				]
			})]
		})
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
//#endregion
export { CardHeader as a, CardContent as i, Badge as n, CardTitle as o, Card as r, AppHeader as t };
