import { useMemo, useState } from "react";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
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
    <AppShell
      eyebrow="Content / Pages"
      title={`Edit ${page.title}`}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/admin/pages"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(36,23,24,0.14)] px-4 py-2 text-[13px] font-bold text-[#241718] transition-colors hover:bg-[#7e1518]/5"
          >
            <ArrowLeft size={14} />
            <span>Back to Pages</span>
          </Link>
          <a
            href={page.path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[rgba(36,23,24,0.14)] px-4 py-2 text-[13px] font-bold text-[#241718] transition-colors hover:bg-[#7e1518]/5"
          >
            <Eye size={14} />
            <span>Preview</span>
          </a>
          <Button size="sm" className="inline-flex items-center gap-2">
            <Save size={14} />
            <span>Save</span>
          </Button>
        </div>
      }
    >
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
