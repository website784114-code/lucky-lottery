import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ManageResults } from "@/components/admin/ManageResults";
import { useAdminAuth } from "@/lib/admin-auth-context";

export const Route = createFileRoute("/admin-dashboard")({ component: AdminDashboardRoute });

function AdminDashboardRoute() {
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

  return <ManageResults />;
}
