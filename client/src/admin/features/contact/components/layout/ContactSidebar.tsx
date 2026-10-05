import { RotateCcw } from 'lucide-react';

import Button from '@/admin/components/ui/Button';

type ContactSidebarProps = {
  isBusy: boolean;
  isDefault: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onReset: () => Promise<void>;
  onSave: () => Promise<void>;
};

export default function ContactSidebar({
  isBusy,
  isDefault,
  isLoading,
  isSaving,
  onReset,
  onSave,
}: ContactSidebarProps) {
  async function handleReset() {
    const confirmed = window.confirm('Reset Contact page content to default?');
    if (!confirmed) return;

    await onReset();
  }

  return (
    <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
      <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#1C2434]">Publishing</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Save changes and preview the public Contact page.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Status</dt>
            <dd className="font-medium text-[#1C2434]">
              {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Published'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Content</dt>
            <dd className="font-medium text-[#1C2434]">{isDefault ? 'Default' : 'Custom'}</dd>
          </div>
        </dl>

        <div className="mt-4 grid gap-2">
          <Button disabled={isBusy} type="button" onClick={() => void onSave()}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            disabled={isLoading}
            type="button"
            variant="outline"
            onClick={() => window.open('/contact', '_blank', 'noopener,noreferrer')}
          >
            Preview
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#1C2434]">Defaults</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Restore the Contact page to the configured default content.
        </p>

        <Button
          className="mt-4 w-full"
          disabled={isBusy || isDefault}
          type="button"
          variant="outline"
          onClick={() => void handleReset()}
        >
          <RotateCcw size={15} />
          Reset to Default
        </Button>
      </section>
    </aside>
  );
}
