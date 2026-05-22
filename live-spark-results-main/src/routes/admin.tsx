import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Trophy, Gamepad2 } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.navigate({ to: "/admin-login" });
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
          { to: "/admin/results", label: "Results", icon: Trophy },
          { to: "/admin/games", label: "Games", icon: Gamepad2 },
        ].map(({ to, label, icon: Icon, exact }) => (
          <Link key={to} to={to} activeOptions={{ exact }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary/40"
            activeProps={{ className: "inline-flex items-center gap-2 rounded-md border border-primary bg-primary/10 px-3 py-2 text-sm text-primary" }}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
