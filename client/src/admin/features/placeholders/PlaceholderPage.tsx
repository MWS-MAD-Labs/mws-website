import AppShell from "@/admin/components/layout/AppShell";

type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppShell title={title}>
      <section className="flex-1 p-6">
        <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-6 shadow-sm">
          <div>Ini Halaman {title}</div>
        </div>
      </section>
    </AppShell>
  );
}
