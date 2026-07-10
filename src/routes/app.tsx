import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";

import { AppSidebar } from "@/components/AppSidebar";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useRole();
  if (loading) return null; // session is being restored from the stored token
  if (!user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen aurora-bg">
      
      <div className="flex">
        {/* Desktop sidebar — fixed so it persists across scrolling */}
        <aside className="no-print hidden lg:block fixed top-[36px] left-0 bottom-0 w-64 z-30">
          <AppSidebar />
        </aside>
        <main className="flex-1 min-w-0 lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
