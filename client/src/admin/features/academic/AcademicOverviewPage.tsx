import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import AcademicOverviewMainForm from './components/layout/AcademicOverviewMainForm';
import AcademicOverviewSidebar from './components/layout/AcademicOverviewSidebar';
import { useAcademicOverviewEditor } from './hooks/useAcademicOverviewEditor';

export default function AcademicOverviewPage() {
  const editor = useAcademicOverviewEditor();
  const {
    activeImageField,
    form,
    galleries,
    isGalleryPickerOpen,
    isLoading,
    message,
    selectImage,
    setActiveImageField,
    setIsGalleryPickerOpen,
    uploadImage,
    updateForm,
  } = editor;

  return (
    <AppShell title="Academic Overview">
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Academic' }, { label: 'Overview' }]}
          title="Academic Overview"
          description="Manage the standalone Academic overview content."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading Academic overview...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <AcademicOverviewMainForm editor={editor} />
            <AcademicOverviewSidebar editor={editor} />
          </div>
        )}

        <GalleryPickerModal
          galleries={galleries}
          open={isGalleryPickerOpen}
          selectedGalleryId={form.galleryId}
          onClose={() => setIsGalleryPickerOpen(false)}
          onSelect={(galleryId) => updateForm('galleryId', galleryId)}
        />

        <CoverImagePickerModal
          galleries={galleries}
          open={Boolean(activeImageField)}
          title="Choose Image"
          onClose={() => setActiveImageField(null)}
          onSelect={(asset) => selectImage(asset.path, asset.galleryId)}
          onSelectLocalFile={(file) => void uploadImage(file)}
        />
      </section>
    </AppShell>
  );
}
