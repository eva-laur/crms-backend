import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRole, ROLE_META } from "@/lib/role-context";
import { Bell, Search, ChevronDown, Moon, Sun, Menu } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/AppSidebar";
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, type ApiNotification } from "@/lib/api/notifications";
import { getToken, BASE_URL } from "@/lib/api/client";
import { toast } from "sonner";

const TONE_BY_TYPE: Record<string, "success" | "warning" | "default"> = {
  booking_approved: "success",
  booking_checked_out: "default",
  booking_rejected: "warning",
  booking_overdue: "warning",
  conflict: "warning",
};
const toneOf = (n: ApiNotification) => TONE_BY_TYPE[n.type] ?? "default";
const timeAgo = (iso: string) => {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return new Date(iso).toLocaleDateString();
};

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("crms-theme") === "dark";
  });
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
    try { window.localStorage.setItem("crms-theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);
  return [dark, () => setDark(d => !d)];
}

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useRole();
  const [dark, toggleDark] = useDarkMode();
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    enabled: !!user,
    // The SSE stream below delivers new notifications instantly; this
    // polling interval is now just a safety net (missed events, stream
    // reconnect gaps), not the primary delivery mechanism.
    refetchInterval: 30_000,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: getMyNotifications,
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const invalidateNotifs = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
  const onOpenChange = (open: boolean) => {
    // Auto-mark-read the moment the bell is opened, mirroring how most
    // notification centers behave (read state reflects "seen", not "acted on").
    if (open && (unread?.unreadCount ?? 0) > 0) {
      markAllAsRead().then(invalidateNotifs).catch(() => {});
    }
  };

  // Instant delivery: open a live Server-Sent-Events connection to the
  // backend (see GET /api/notifications/stream) and refresh the bell the
  // moment a new notification is pushed for this user, rather than waiting
  // up to 30s for the next poll.
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    const es = new EventSource(`${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`);
    es.addEventListener("notification", (e) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      try {
        const n = JSON.parse((e as MessageEvent).data) as ApiNotification;
        toast(n.title || "New notification", { description: n.message });
      } catch {
        // Malformed payload — the invalidateQueries above still picked it up.
      }
    });
    // EventSource reconnects automatically on error/drop; nothing to do here.
    es.onerror = () => {};

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  if (!user) return null;

  return (
    <header className="sticky top-[36px] z-40 border-b border-border bg-background/85 backdrop-blur no-print">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-8 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* mobile sidebar trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden h-9 w-9 rounded-lg border border-border bg-card flex items-center justify-center shrink-0" aria-label="Open navigation">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <AppSidebar onNavigate={() => setSheetOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden xl:flex items-center gap-2 px-3 h-9 rounded-lg bg-input border border-border w-60">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search…"
              className="bg-transparent outline-none text-xs flex-1 placeholder:text-muted-foreground" />
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1">⌘K</kbd>
          </div>

          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center">
            {dark ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
          </button>

          <Popover onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <button className="relative h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent flex items-center justify-center">
                <Bell className="h-4 w-4" />
                {(unread?.unreadCount ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center">
                    {unread!.unreadCount > 9 ? "9+" : unread!.unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-[11px] text-muted-foreground">Across the campus operations grid</p>
              </div>
              <ul className="divide-y divide-border max-h-80 overflow-auto">
                {notifications.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs text-muted-foreground">No notifications yet.</li>
                )}
                {notifications.slice(0, 20).map((n) => (
                  <li key={n._id} onClick={() => { if (!n.read) markAsRead(n._id).then(invalidateNotifs).catch(() => {}); }}
                    className={`px-4 py-3 hover:bg-accent/50 flex items-start gap-3 cursor-pointer ${n.read ? "" : "bg-accent/20"}`}>
                    <span className={`h-2 w-2 mt-1.5 rounded-full ${
                      toneOf(n) === "success" ? "bg-success" : toneOf(n) === "warning" ? "bg-warning" : "bg-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{n.title || n.message}</p>
                      <p className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center text-xs font-semibold">
              {user.name.split(" ").map(p => p[0]).slice(0, 2).join("")}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-medium truncate max-w-[140px]">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">{ROLE_META[user.role].short}</Badge>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
