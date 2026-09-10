import { useEffect, useState } from "react";
import { adminApi, type AdminDashboardData } from "@/admin/api/adminApi";
import { useAuth } from "@/admin/auth/useAuth";
import AppShell from "@/admin/components/layout/AppShell";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    adminApi
      .dashboard()
      .then((data) => {
        if (cancelled) return;
        setDashboard(data);
      })
      .catch((dashboardError) => {
        console.error("CMS dashboard request failed:", dashboardError);
        if (!cancelled) {
          setError("Dashboard data could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      eyebrow="MWS CMS"
      title="Dashboard"
      // Badge Role, example : Madlabs = Super Admin !
    >
      <section className="flex-1 p-6">
        <div className="rounded-xl border border-[rgba(36,23,24,0.14)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            {dashboard?.message ?? "Welcome to CMS"}
          </h2>

          <p className="mt-1 text-sm text-[#625759]">{user?.email}</p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-[#7e1518]/20 bg-[#7e1518]/10 px-4 py-3 text-sm text-[#7e1518]"
            >
              <span>{error}</span>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
