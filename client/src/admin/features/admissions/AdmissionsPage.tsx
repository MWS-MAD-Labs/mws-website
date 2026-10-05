import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';

import AdmissionsProgramsForm from './components/layout/AdmissionsProgramsForm';
import AdmissionsSidebar from './components/layout/AdmissionsSidebar';
import { useAdmissionsEditor } from './hooks/useAdmissionsEditor';

export default function AdmissionsPage() {
  const editor = useAdmissionsEditor();
  const {
    assetPickerProgramId,
    galleries,
    isLoading,
    message,
    selectedProgram,
    selectProgramImage,
    setAssetPickerProgramId,
  } = editor;

  return (
    <AppShell title="Admissions">
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Admissions' }]}
          title="Admissions"
          description="Manage the program cards shown on the public Admissions page."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading admissions...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <AdmissionsProgramsForm editor={editor} />
            <AdmissionsSidebar editor={editor} />
          </div>
        )}

        <GalleryAssetPickerModal
          allowedKinds={['IMAGE']}
          galleries={galleries}
          initialGalleryId={selectedProgram?.galleryId ?? null}
          open={assetPickerProgramId !== null}
          title="Choose Program Image"
          onClose={() => setAssetPickerProgramId(null)}
          onSelect={(asset) => {
            selectProgramImage(asset);
            setAssetPickerProgramId(null);
          }}
        />
      </section>
    </AppShell>
  );
}
