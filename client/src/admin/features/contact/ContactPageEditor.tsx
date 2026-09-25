import AppShell from '@/admin/components/layout/AppShell';
import ContactEditorFields from './components/ContactEditorFields';
import { useContactPageEditor } from './hooks/useContactPageEditor';

export default function ContactPageEditor() {
  const { content, error, isLoading, isSaving, notice, saveContent, updateContent } =
    useContactPageEditor();

  return (
    <AppShell title="Contact">
      <section className="flex-1">
        {error && (
          <div
            role="alert"
            className="mx-6 mt-4 rounded-lg border border-[#7e1518]/20 bg-[#7e1518]/10 px-4 py-3 text-sm text-[#7e1518]"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mx-6 mt-4 rounded-lg border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        <ContactEditorFields
          content={content}
          isLoading={isLoading}
          isSaving={isSaving}
          onSave={saveContent}
          updateContent={updateContent}
        />
      </section>
    </AppShell>
  );
}
