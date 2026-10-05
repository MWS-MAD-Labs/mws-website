import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

type MaintenancePageProps = {
  title: string;
};

export default function MaintenancePage({ title }: MaintenancePageProps) {
  return (
    <AppShell title={title}>
      <section className="flex-1 space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Admin' }, { label: title }]}
          title={title}
          description="This CMS page is currently under maintenance."
        />

        <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#64748B]">Maintenance mode. This page will be available soon.</p>
        </div>
      </section>
    </AppShell>
  );
}
