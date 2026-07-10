/* eslint-disable prettier/prettier */
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useRole, type Permission } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarRange, AlertTriangle, Package, BookOpen,
  ClipboardList, Boxes, ShieldCheck, LogOut, Users, Wrench,
  GraduationCap, BarChart3, Settings2, Bus, Library, Laptop,
  ListChecks, Megaphone, CalendarX, FolderOpen, UserCircle,
} from "lucide-react";

interface Item {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  requires: Permission;
  hash?: string;
}

const ITEMS: Item[] = [
  { to: "/app/dashboard",        label: "Dashboard",            icon: LayoutDashboard, requires: "nav:dashboard" },
  { to: "/app/schedule",         label: "Master Schedule",      icon: CalendarRange,   requires: "nav:schedule"  },
  { to: "/app/bookings",         label: "My Bookings",          icon: ClipboardList,   requires: "nav:bookings"  },
  { to: "/app/assets",           label: "My Borrowed Assets",   icon: Boxes,           requires: "nav:assets"    },
  { to: "/app/library",          label: "Library Catalog",      icon: Library,         requires: "nav:library"   },
  { to: "/app/it-equipment",     label: "IT Equipment",         icon: Laptop,          requires: "nav:itequipment" },
  { to: "/app/bus",              label: "Bus & Transport",      icon: Bus,             requires: "nav:bus"       },
  { to: "/app/results",          label: "Academic Results",     icon: GraduationCap,   requires: "nav:results"   },
  { to: "/app/logbook",          label: "Academic Logbook",     icon: BookOpen,        requires: "nav:logbook"   },
  { to: "/app/course-materials", label: "Course Materials",     icon: FolderOpen,      requires: "nav:materials" },
  { to: "/app/course-progress",  label: "Course Progress",      icon: ListChecks,      requires: "nav:courseProgress" },
  { to: "/app/announcements",    label: "Announcements",        icon: Megaphone,       requires: "nav:announcements" },
  { to: "/app/cancellations",    label: "Class Cancellations",  icon: CalendarX,       requires: "nav:cancellations" },
  { to: "/app/checkout",         label: "Checkout Desk",        icon: Package,         requires: "nav:checkout"  },
  { to: "/app/conflicts",        label: "Conflict Resolution",  icon: AlertTriangle,   requires: "nav:conflicts" },
  { to: "/app/reports",          label: "Reports & Analytics",  icon: BarChart3,       requires: "nav:reports"   },
  { to: "/app/profile",          label: "My Profile",           icon: UserCircle,      requires: "nav:profile"   },
];


const SYSTEM_ITEMS: Item[] = [
  { to: "/app/users",      label: "User Management",      icon: Users,           requires: "nav:users"  },
  { to: "/app/config",     label: "System Configuration", icon: Settings2,       requires: "nav:config" },
  { to: "/app/dashboard",  label: "Maintenance Registry", icon: Wrench,          requires: "nav:maintenance", hash: "maintenance" },
  { to: "/app/audit",      label: "Audit Log Terminal",   icon: ShieldCheck,     requires: "nav:audit"  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { user, logout, can } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  if (!user) return null;

  const workspace = ITEMS.filter(i => can(i.requires));
  const system    = SYSTEM_ITEMS.filter(i => can(i.requires));

  const renderItem = (item: Item, key: string) => {
    const Icon = item.icon;
    const active = pathname === item.to && !item.hash;
    return (
      <Link
        key={key}
        to={item.to}
        hash={item.hash}
        onClick={onNavigate}
        data-active={active}
        className={cn("nav-pill group")}
      >
        <span className="nav-ico">
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent/20 ring-1 ring-sidebar-accent/50 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-sidebar-accent" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">IUC / SEAS</p>
            <p className="text-sm font-semibold">CRMS Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scroll-soft">
        <p className="px-4 pb-1.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Workspace</p>
        {workspace.map((item, i) => renderItem(item, `w-${i}-${item.to}`))}

        {system.length > 0 && (
          <>
            <p className="mt-5 px-4 pb-1.5 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">System</p>
            {system.map((item, i) => renderItem(item, `s-${i}-${item.to}`))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-2xl bg-sidebar-foreground/5 p-3">
          <p className="text-xs font-medium truncate">{user.name}</p>
          <p className="text-[11px] text-sidebar-foreground/60 truncate">{user.matricule}</p>
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-sidebar-foreground/60 hover:text-destructive transition-colors">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
