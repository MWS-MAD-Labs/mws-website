import AppShell from "@/admin/components/layout/AppShell";
import PagesTable from "./components/layout/PagesTable";
import { managedPages } from "./config/pages";

export default function PagesManagementPage() {
  return (
    <AppShell
      eyebrow="Content"
      title="Pages"
      action={
        <span className="rounded-md border border-[rgba(36,23,24,0.14)] px-3 py-2 text-xs font-semibold text-[#625759]">
          {managedPages.length} Pages
        </span>
      }
    >
      <section className="flex-1 p-6">
        <PagesTable pages={managedPages} />
      </section>
    </AppShell>
  );
}
