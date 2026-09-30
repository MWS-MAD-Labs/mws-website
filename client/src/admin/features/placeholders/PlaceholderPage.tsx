import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';

type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppShell title={title}>
      <section className="flex-1 space-y-5 p-6">
        <ContentPageHeader breadcrumbs={[{ label: 'Admin' }, { label: title }]} title={title} />

        <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-6 shadow-sm">
          <div>Ini Halaman {title}</div>
        </div>
      </section>
    </AppShell>
  );
}
