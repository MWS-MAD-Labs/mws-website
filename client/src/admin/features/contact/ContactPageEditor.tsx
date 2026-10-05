import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import ContactMainSections from './components/layout/ContactMainSections';
import ContactSidebar from './components/layout/ContactSidebar';
import { useContactPageEditor } from './hooks/useContactPageEditor';

export default function ContactPageEditor() {
  const { content, error, isDefault, isLoading, isSaving, notice, resetContent, saveContent, updateContent } =
    useContactPageEditor();
  const isBusy = isLoading || isSaving;

  return (
    <AppShell title="Contact">
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Contact' }]}
          title="Contact"
          description="Manage the public Contact page content, office details, and contact form labels."
        />

        {error && (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage tone="success">{notice}</StatusMessage>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading Contact page...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ContactMainSections
              content={content}
              isBusy={isBusy}
              updateContent={updateContent}
            />
            <ContactSidebar
              isBusy={isBusy}
              isDefault={isDefault}
              isLoading={isLoading}
              isSaving={isSaving}
              onReset={resetContent}
              onSave={saveContent}
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}
