import AppShell from '@/admin/components/layout/AppShell';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import AcademicLevelFaqPickerModal from './components/layout/AcademicLevelFaqPickerModal';
import AcademicLevelMainSections from './components/layout/AcademicLevelMainSections';
import AcademicLevelSidebar from './components/layout/AcademicLevelSidebar';
import { useAcademicLevelEditor } from './hooks/useAcademicLevelEditor';

export default function AcademicLevelEditorPage() {
  const editor = useAcademicLevelEditor();
  const { activeImageField, config, galleries, galleryId, isLoading, message } = editor;

  return (
    <AppShell title={`Academic / ${config.title}`}>
      <section className="w-full space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Academic' }, { label: config.title }]}
          title={config.title}
          description="Manage the content of this academic level page."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading {config.title}...
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <AcademicLevelMainSections editor={editor} />
            <AcademicLevelSidebar editor={editor} />
          </div>
        )}

        <GalleryAssetPickerModal
          allowedKinds={['IMAGE']}
          galleries={galleries}
          initialGalleryId={galleryId}
          open={Boolean(activeImageField)}
          title="Choose Image"
          onClose={() => editor.setActiveImageField(null)}
          onSelect={(asset) => editor.selectImage(asset.path, asset.galleryId, asset.alt)}
        />

        <AcademicLevelFaqPickerModal editor={editor} />
      </section>
    </AppShell>
  );
}
