import { ImagePlus, LayoutPanelTop, PenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminDashboardData } from '@/admin/api/adminApi';
import { useAuth } from '@/admin/auth/useAuth';
import AppShell from '@/admin/components/layout/AppShell';
import Notice from '@/admin/components/ui/Notice';
import AttentionList from '@/admin/features/dashboard/AttentionList';
import ContentOverview from '@/admin/features/dashboard/ContentOverview';
import RecentUpdates from '@/admin/features/dashboard/RecentUpdates';
import TrafficSection from '@/admin/features/dashboard/TrafficSection';
import { hasCmsPermission } from '@/admin/types/auth';

const quickActionClass =
  'inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#1C2434] transition-colors hover:border-[#3C50E0]/40 hover:text-[#3C50E0]';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const canManageContent = hasCmsPermission(user, 'content:manage');

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setError('');

      adminApi
        .dashboard()
        .then((data) => {
          if (!cancelled) setDashboard(data);
        })
        .catch((dashboardError) => {
          if (!cancelled) {
            setError(
              dashboardError instanceof Error
                ? dashboardError.message
                : 'Dashboard data could not be loaded.',
            );
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const firstName = user?.central.nick_name || user?.name?.split(' ')[0];

  return (
    <AppShell title="Dashboard">
      <section className="flex-1 space-y-5 p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#1C2434]">
              {firstName ? `Welcome back, ${firstName}` : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              What is on the website today and what needs your attention.
            </p>
          </div>

          {canManageContent ? (
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/news/new" className={quickActionClass}>
                <PenLine size={16} aria-hidden="true" />
                Write news
              </Link>
              <Link to="/admin/content/home" className={quickActionClass}>
                <LayoutPanelTop size={16} aria-hidden="true" />
                Home hero
              </Link>
              <Link to="/admin/gallery/Gambar" className={quickActionClass}>
                <ImagePlus size={16} aria-hidden="true" />
                Upload photos
              </Link>
            </div>
          ) : null}
        </header>

        {error ? (
          <Notice
            tone="error"
            action={{ label: 'Try again', onClick: () => setReloadKey((key) => key + 1) }}
          >
            {error}
          </Notice>
        ) : null}

        {dashboard ? (
          <ContentOverview content={dashboard.content} />
        ) : !error ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[112px] animate-pulse rounded-lg bg-[#F1F5F9]" />
            ))}
          </div>
        ) : null}

        <TrafficSection />

        {dashboard ? (
          <>
            <AttentionList content={dashboard.content} />
            <RecentUpdates updates={dashboard.content.recentUpdates} />
          </>
        ) : null}
      </section>
    </AppShell>
  );
}
