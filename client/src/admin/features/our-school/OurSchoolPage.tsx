import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import GalleryPickerModal from '@/admin/features/gallery/components/GalleryPickerModal';
import OurSchoolMainSections from './components/layout/OurSchoolMainSections';
import OurSchoolSidebar from './components/layout/OurSchoolSidebar';
import { useOurSchoolEditor } from './hooks/useOurSchoolEditor';

export default function OurSchoolPage() {
  const editor = useOurSchoolEditor();
  const {
    activeImageField,
    galleries,
    galleryId,
    isGalleryPickerOpen,
    isLoading,
    message,
    selectGallery,
    selectImage,
    setActiveImageField,
    setIsGalleryPickerOpen,
  } = editor;

  return (
    <AppShell title="Our School">
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Our School' }]}
          title="Our School"
          description="Edit the public Our School page content."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading Our School page...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <OurSchoolMainSections editor={editor} />
            <OurSchoolSidebar editor={editor} />
          </div>
        )}

        <GalleryPickerModal
          galleries={galleries}
          isLoading={isLoading}
          open={isGalleryPickerOpen}
          selectedGalleryId={galleryId}
          onClose={() => setIsGalleryPickerOpen(false)}
          onSelect={selectGallery}
        />

        <GalleryAssetPickerModal
          allowedKinds={['IMAGE']}
          galleries={galleries}
          initialGalleryId={galleryId}
          open={Boolean(activeImageField)}
          title="Choose Image"
          onClose={() => setActiveImageField(null)}
          onSelect={(asset) => selectImage(asset.path, asset.galleryId, asset.alt)}
        />
      </section>
    </AppShell>
  );
}
