import AppShell from "@/admin/components/layout/AppShell";
import PagesTable from "./components/layout/PagesTable";
import { managedPages } from "./config/pages";

export default function PagesManagementPage() {
  return (
    <AppShell title="Pages">
      <section className="flex-1 p-6">
        <PagesTable pages={managedPages} />
      </section>
    </AppShell>
  );
}
