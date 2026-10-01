import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import ContactEditorFields from './components/ContactEditorFields';
import { useContactPageEditor } from './hooks/useContactPageEditor';

export default function ContactPageEditor() {
  const { content, error, isLoading, isSaving, notice, saveContent, updateContent } =
    useContactPageEditor();

  return (
    <AppShell title="Contact">
      <section className="flex-1">
        <div className="border-b border-[#E2E8F0] bg-white px-6 py-6">
          <ContentPageHeader
            breadcrumbs={[{ label: 'Content' }, { label: 'Contact' }]}
            title=""
            description=""
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mx-6 mt-4 rounded-lg border border-[#3C50E0]/20 bg-[#3C50E0]/10 px-4 py-3 text-sm text-[#3C50E0]"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mx-6 mt-4 rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 px-4 py-3 text-sm text-[#047857]"
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
