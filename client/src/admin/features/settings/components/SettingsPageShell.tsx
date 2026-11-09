import type { FormEvent, ReactNode } from 'react';
import { Save } from 'lucide-react';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { formatAdminDateTime } from '@/admin/utils/dateFormat';

type SettingsPageShellProps = {
  title: string;
  description: string;
  /** Where visitors see these values, listed in the side panel. */
  usedOn: string[];
  section: {
    hasUnsavedChanges: boolean;
    isBusy: boolean;
    isLoading: boolean;
    isSaving: boolean;
    message: string | null;
    save: () => Promise<void>;
    updatedAt: string | null;
  };
  children: ReactNode;
};

const cardClass = 'min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white';

export default function SettingsPageShell({
  title,
  description,
  usedOn,
  section,
  children,
}: SettingsPageShellProps) {
  const { hasUnsavedChanges, isBusy, isLoading, isSaving, message, save, updatedAt } = section;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save();
  }

  return (
    <AppShell title={`Settings: ${title}`}>
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Settings' }, { label: title }]}
          title={title}
          description={description}
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading settings...
          </div>
        ) : (
          <form
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="min-w-0 space-y-5">{children}</div>

            <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
              <section className={`${cardClass} grid gap-4 p-4`}>
                <div>
                  <h2 className="text-sm font-semibold text-[#1C2434]">Save</h2>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Changes appear on the website right after saving.
                  </p>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#64748B]">Working state</dt>
                    <dd className="font-medium text-[#1C2434]">
                      {isSaving
                        ? 'Saving...'
                        : hasUnsavedChanges
                          ? 'Unsaved changes'
                          : 'All changes saved'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-[#64748B]">Updated</dt>
                    <dd className="font-medium text-[#1C2434]">
                      {formatAdminDateTime(updatedAt, 'Not saved yet')}
                    </dd>
                  </div>
                </dl>

                <Button
                  className="inline-flex items-center justify-center gap-2"
                  disabled={isBusy || !hasUnsavedChanges}
                  type="submit"
                >
                  <Save size={15} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </section>

              <section className={`${cardClass} grid gap-2 p-4`}>
                <h2 className="text-sm font-semibold text-[#1C2434]">Used on the website</h2>
                <ul className="list-disc space-y-1 pl-5 text-sm text-[#64748B]">
                  {usedOn.map((place) => (
                    <li key={place}>{place}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </form>
        )}
      </section>
    </AppShell>
  );
}
