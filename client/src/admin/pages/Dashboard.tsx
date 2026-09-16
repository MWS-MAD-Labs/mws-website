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
    <AppShell title="Dashboard">
      <section className="flex-1 p-6">
        <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#241718]">
            {dashboard?.message ?? "Welcome to CMS"}
          </h2>

          <p className="mt-1 text-sm text-[#625759]">
            {user?.central.email ?? "Session email unavailable"}
          </p>

          {user && (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-[rgba(36,23,24,0.10)] bg-[#faf8f3] p-4">
                <dt className="text-xs font-semibold uppercase text-[#817678]">
                  CMS Name
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#241718]">
                  {user.name}
                </dd>
              </div>
              <div className="rounded-md border border-[rgba(36,23,24,0.10)] bg-[#faf8f3] p-4">
                <dt className="text-xs font-semibold uppercase text-[#817678]">
                  Role
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#241718]">
                  {user.role.label ?? user.role.name}
                </dd>
              </div>
              <div className="rounded-md border border-[rgba(36,23,24,0.10)] bg-[#faf8f3] p-4">
                <dt className="text-xs font-semibold uppercase text-[#817678]">
                  Unit ID
                </dt>
                <dd className="mt-1 break-all text-sm font-semibold text-[#241718]">
                  {user.unitId}
                </dd>
              </div>
              <div className="rounded-md border border-[rgba(36,23,24,0.10)] bg-[#faf8f3] p-4">
                <dt className="text-xs font-semibold uppercase text-[#817678]">
                  CMS Status
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[#241718]">
                  {user.isActive ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>
          )}

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
