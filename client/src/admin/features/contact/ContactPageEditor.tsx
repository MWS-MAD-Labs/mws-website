import { useState } from "react";
import { Eye, Pencil, RotateCcw } from "lucide-react";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import ContactEditorFields from "./components/ContactEditorFields";
import ContactPagePreview from "./components/ContactPagePreview";
import { useContactPageEditor } from "./hooks/useContactPageEditor";

type EditorMode = "edit" | "preview";

const editorModes: Array<{
  value: EditorMode;
  label: string;
  Icon: typeof Pencil;
}> = [
  { value: "edit", label: "Edit", Icon: Pencil },
  { value: "preview", label: "Preview", Icon: Eye },
];

export default function ContactPageEditor() {
  const [mode, setMode] = useState<EditorMode>("edit");
  const {
    content,
    error,
    isDefault,
    isLoading,
    isSaving,
    notice,
    resetContent,
    saveContent,
    updateContent,
  } = useContactPageEditor();

  const resetPage = async () => {
    if (!window.confirm("Reset Contact page content to default?")) return;
    await resetContent();
  };

  return (
    <AppShell
      eyebrow="Content / Pages"
      title="Edit Contact Page"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-md border border-[rgba(36,23,24,0.14)] px-3 py-2 text-xs font-semibold text-[#625759]">
            {isDefault ? "Default Content" : "CMS Override"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="inline-flex items-center gap-2"
            disabled={isSaving || isDefault}
            onClick={() => void resetPage()}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </Button>
        </div>
      }
    >
      <section className="flex-1 p-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-[#7e1518]/20 bg-[#7e1518]/10 px-4 py-3 text-sm text-[#7e1518]"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        <div className="mb-5 inline-flex rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-1 shadow-sm">
          {editorModes.map(({ Icon, label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={[
                "inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors",
                mode === value
                  ? "bg-[#7e1518] text-white"
                  : "text-[#625759] hover:bg-[#7e1518]/5 hover:text-[#241718]",
              ].join(" ")}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {mode === "edit" ? (
          <ContactEditorFields
            content={content}
            isLoading={isLoading}
            isSaving={isSaving}
            onSave={saveContent}
            updateContent={updateContent}
          />
        ) : (
          <ContactPagePreview content={content} />
        )}
      </section>
    </AppShell>
  );
}
