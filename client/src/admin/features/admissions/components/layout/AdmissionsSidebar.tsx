import Button from '@/admin/components/ui/Button';

import type { AdmissionsEditorState } from '../../hooks/useAdmissionsEditor';

type AdmissionsSidebarProps = {
  editor: AdmissionsEditorState;
};

export default function AdmissionsSidebar({ editor }: AdmissionsSidebarProps) {
  const { isLoading, isSaving, programs } = editor;
  const activeCount = programs.filter((program) => program.isActive ?? true).length;
  const imageCount = programs.filter((program) => Boolean(program.image)).length;
  const isBusy = isLoading || isSaving;

  return (
    <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
      <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#1C2434]">Publishing</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Save updates after editing admissions program cards.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Status</dt>
            <dd className="font-medium text-[#1C2434]">
              {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Ready'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Programs</dt>
            <dd className="font-medium text-[#1C2434]">{programs.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Visible</dt>
            <dd className="font-medium text-[#1C2434]">{activeCount}</dd>
          </div>
        </dl>

        <div className="mt-4 grid gap-2">
          <Button disabled={isBusy} form="admissions-editor-form" type="submit">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            disabled={isLoading}
            type="button"
            variant="outline"
            onClick={() => window.open('/admission', '_blank', 'noopener,noreferrer')}
          >
            Preview
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-[#E2E8F0] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#1C2434]">Media</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Program cards with selected images from the Gallery Library.
        </p>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#64748B]">Images selected</dt>
            <dd className="font-medium text-[#1C2434]">
              {imageCount}/{programs.length}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
