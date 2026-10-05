// UNUSED — SAFE TO DELETE: dedicated news create/edit pages now render CreateUpdateNews directly.
import Modal from '@/admin/components/ui/Modal';
import { useNewsEditor } from '@/admin/features/news/hooks/useNewsEditor';

import ArticlePhotosSection from './layouts/ArticlePhotosSection';
import ArticleSection from './layouts/ArticleSection';
import CoverImagePickerModal from './layouts/CoverImagePickerModal';
import CoverImageSection from './layouts/CoverImageSection';
import NewsEditorFooter from './layouts/NewsEditorFooter';
import NewsEditorMessage from './layouts/NewsEditorMessage';
import PublicationSection from './layouts/PublicationSection';

type NewsEditorModalProps = {
  newsId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function NewsEditorModal({ newsId, onClose, onSaved }: NewsEditorModalProps) {
  const editor = useNewsEditor({ newsId, onSaved });
  const { form } = editor;

  return (
    <>
      <Modal open title={editor.isEditing ? 'Edit News' : 'Create News'} onClose={onClose}>
        {editor.loading ? (
          <div className="py-16 text-center text-sm text-[#64748B]">Loading news editor...</div>
        ) : (
          <form className="flex flex-col" onSubmit={editor.save}>
            <div className="pb-4 empty:hidden">
              <NewsEditorMessage message={editor.message} />
            </div>

            <div className="max-h-[70vh] overflow-y-auto pb-6 pr-1">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-8">
                  <ArticleSection
                    form={form}
                    onContentChange={(value) => editor.updateForm('content', value)}
                    onExcerptChange={(value) => editor.updateForm('excerpt', value)}
                    onSlugChange={editor.changeSlug}
                    onTitleChange={editor.changeTitle}
                    onSeoTitleChange={(value) => editor.updateForm('seoTitle', value)}
                    onSeoDescriptionChange={(value) => editor.updateForm('seoDescription', value)}
                  />

                  <ArticlePhotosSection
                    photos={form.articlePhotos}
                    onOpenAssetPicker={() => editor.openPicker('article-photo')}
                    onRemovePhoto={editor.removeArticlePhoto}
                    onChangePhoto={editor.changeArticlePhoto}
                  />
                </div>

                <div className="min-w-0 space-y-8 lg:border-l lg:border-[#E2E8F0] lg:pl-6">
                  <PublicationSection
                    categories={editor.categories}
                    form={form}
                    tags={editor.tags}
                    onFieldChange={editor.updateForm}
                    onToggleTag={editor.toggleTag}
                  />

                  <CoverImageSection
                    form={form}
                    localFileName={editor.localCoverFile?.name}
                    localPreviewUrl={editor.localPreviewUrl}
                    onFieldChange={editor.updateForm}
                    onOpenAssetPicker={() => editor.openPicker('cover')}
                    onRemoveCover={editor.removeCover}
                  />
                </div>
              </div>
            </div>

            <NewsEditorFooter
              isEditing={editor.isEditing}
              saving={editor.saving}
              canPreview={editor.canPreview}
              onCancel={onClose}
              onPreview={editor.preview}
            />
          </form>
        )}
      </Modal>

      <CoverImagePickerModal
        open={editor.pickerTarget !== null}
        galleries={editor.galleries}
        title={
          editor.pickerTarget === 'article-photo' ? 'Choose article photo' : 'Choose cover image'
        }
        onClose={editor.closePicker}
        onSelect={editor.handlePickerSelect}
        onSelectLocalFile={editor.handlePickerLocalFile}
      />
    </>
  );
}
