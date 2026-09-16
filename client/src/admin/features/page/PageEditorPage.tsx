import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import AppShell from "@/admin/components/layout/AppShell";
import PageEditorCanvas from "./components/layout/PageEditorCanvas";
import { getManagedPage } from "./config/pages";
import { getPageSections } from "./config/sections";

export default function PageEditorPage() {
  const { pageId } = useParams();
  const page = getManagedPage(pageId);
  const [selectedSectionId, setSelectedSectionId] = useState("hero");

  const sections = useMemo(() => {
    if (!page) return [];
    return getPageSections(page);
  }, [page]);

  if (!page) {
    return <Navigate to="/admin/pages" replace />;
  }

  return (
    <AppShell title={`Edit ${page.title}`}>
      <section className="flex-1 p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#625759]">
          <span className="rounded-md border border-[rgba(36,23,24,0.14)] bg-white px-3 py-1.5 font-semibold text-[#241718]">
            {page.template}
          </span>
          <span>{sections.length} sections</span>
        </div>

        {sections.length ? (
          <PageEditorCanvas
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
          />
        ) : (
          <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white px-4 py-6 text-sm text-[#625759] shadow-sm">
            No editable sections configured.
          </div>
        )}
      </section>
    </AppShell>
  );
}
