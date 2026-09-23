import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { adminApi, type GalleryItem, type NewsCategory, type NewsTag } from '@/admin/api/adminApi';

import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';

import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';

import CoverImagePickerModal from './layouts/CoverImagePickerModal';
import NewsEditorHeader from './layouts/NewsEditorHeader';
import NewsEditorMessage from './layouts/NewsEditorMessage';
import CoverImageSection from './layouts/CoverImageSection';
import ArticleSection from './layouts/ArticleSection';
import ArticlePhotosSection from './layouts/ArticlePhotosSection';
import PublicationSection from './layouts/PublicationSection';

import {
  createEmptyNewsForm,
  newsFormFromPost,
  newsPayloadFromForm,
  slugify,
  toggleTagId,
  type NewsForm,
} from '../newsEditorModel';

export default function CreateUpdateNews() {
  const navigate = useNavigate();
  const { newsId } = useParams<{ newsId: string }>();
  const isEditing = Boolean(newsId);

  const [form, setForm] = useState<NewsForm>(createEmptyNewsForm());
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isArticlePhotoPickerOpen, setIsArticlePhotoPickerOpen] = useState(false);
  const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);

      try {
        const [categoryData, tagData, galleryData, post] = await Promise.all([
          adminApi.newsCategories(),
          adminApi.newsTags(),
          adminApi.galleries(),
          newsId ? adminApi.newsPost(newsId) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setCategories(categoryData);
        setTags(tagData);
        setGalleries(galleryData);
        setRemovedMediaIds([]);

        if (post) {
          setForm(newsFormFromPost(post));
          setSlugWasEdited(true);
        } else {
          setForm(createEmptyNewsForm());
          setSlugWasEdited(false);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Failed to load news editor.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [newsId]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    return () => {
      for (const photo of form.articlePhotos) {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      }
    };
  }, []);

  function updateForm<Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugWasEdited ? current.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugWasEdited(true);
    updateForm('slug', value);
  }

  function handleCoverFile(file: File) {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setLocalCoverFile(file);
    setLocalPreviewUrl(previewUrl);

    updateForm('coverImageAlt', form.coverImageAlt || form.title);
  }

  function handleRemoveCover() {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setLocalCoverFile(null);
    setLocalPreviewUrl(null);

    updateForm('coverImage', '');
    updateForm('coverImageAlt', '');
  }

  function handleAddArticlePhoto(
    file: File,
    options?: {
      alt?: string;
      caption?: string;
    },
  ) {
    const photo = {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      alt: options?.alt || '',
      caption: options?.caption || '',
    };

    setForm((current) => ({
      ...current,
      articlePhotos: [...current.articlePhotos, photo],
    }));
  }

  function handleRemoveArticlePhoto(id: string) {
    const photo = form.articlePhotos.find((item) => item.id === id);

    if (!photo) return;

    if (photo.existingMediaId) {
      // Already stored server-side, so dropping it from the form is not enough:
      // the save has to delete it through the API or it comes back on reload.
      setRemovedMediaIds((current) => [...current, photo.existingMediaId!]);
    } else if (photo.previewUrl.startsWith('blob:')) {
      // Never uploaded: local state and its object URL are all there is.
      URL.revokeObjectURL(photo.previewUrl);
    }

    setForm((current) => ({
      ...current,
      articlePhotos: current.articlePhotos.filter((item) => item.id !== id),
    }));
  }

  function handleChangeArticlePhoto(id: string, field: 'alt' | 'caption', value: string) {
    setForm((current) => ({
      ...current,
      articlePhotos: current.articlePhotos.map((photo) =>
        photo.id === id
          ? {
              ...photo,
              [field]: value,
            }
          : photo,
      ),
    }));
  }

  function handlePreview() {
    if (!form.slug.trim()) return;

    window.open(`/news/${form.slug}`, '_blank', 'noopener,noreferrer');
  }

  function handleClose() {
    navigate('/admin/news');
  }

  async function saveNews(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setSaving(true);
    setMessage(null);

    let createdNewsId: string | null = null;

    try {
      const payload = newsPayloadFromForm(form);

      const savedPost = isEditing
        ? await adminApi.updateNewsPost(newsId!, payload)
        : await adminApi.createNewsPost(payload);

      createdNewsId = savedPost.id;

      if (localCoverFile) {
        await adminApi.uploadNewsImage(savedPost.id, {
          file: localCoverFile,
          alt: form.coverImageAlt,
          purpose: 'COVER',
        });
      }

      // Only article photos land here: the cover is excluded from the list the
      // form is built from, so it can never be removed by accident.
      for (const mediaId of removedMediaIds) {
        await adminApi.deleteNewsImage(savedPost.id, mediaId);
      }

      setRemovedMediaIds([]);

      // Sequential on purpose: the API appends each photo, so awaiting one at a
      // time is what keeps the order the editor picked.
      for (const photo of form.articlePhotos) {
        if (!photo.file) continue;

        await adminApi.uploadNewsImage(savedPost.id, {
          file: photo.file,
          alt: photo.alt || undefined,
          caption: photo.caption || undefined,
          purpose: 'ARTICLE',
        });
      }

      navigate('/admin/news');
    } catch (error) {
      if (!isEditing && createdNewsId) {
        try {
          await adminApi.deleteNewsPost(createdNewsId);
        } catch {
          // Preserve original error.
        }
      }

      setMessage(error instanceof Error ? error.message : 'Failed to save news.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArticlePhotoSelection(selection: GalleryAssetSelection) {
    // The picker can also hand back a video, which is not an article photo.
    if (selection.kind !== 'IMAGE') return;

    try {
      const imageUrl = adminApi.publicAssetUrl(selection.path);

      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error('Failed to load selected gallery image.');
      }

      const blob = await response.blob();

      const extension = blob.type.split('/')[1] || 'jpg';

      const file = new File([blob], `${selection.label || 'article-photo'}.${extension}`, {
        type: blob.type || 'image/jpeg',
      });

      handleAddArticlePhoto(file, {
        alt: selection.alt,
      });

      setIsArticlePhotoPickerOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to select gallery image.');
    }
  }

  return (
    <AppShell title={isEditing ? 'Edit News' : 'Create News'}>
      <section className="w-full space-y-5 p-6">
        <NewsEditorHeader isEditing={isEditing} onClose={handleClose} />

        <NewsEditorMessage message={message} />

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading news editor...
          </div>
        ) : (
          <form id="news-editor-form" className="space-y-5" onSubmit={saveNews}>
            <CoverImageSection
              form={form}
              localFileName={localCoverFile?.name}
              localPreviewUrl={localPreviewUrl}
              onFieldChange={updateForm}
              onOpenAssetPicker={() => setIsPickerOpen(true)}
              onRemoveCover={handleRemoveCover}
            />

            <ArticleSection
              form={form}
              onContentChange={(value) => updateForm('content', value)}
              onExcerptChange={(value) => updateForm('excerpt', value)}
              onSlugChange={handleSlugChange}
              onTitleChange={handleTitleChange}
              onSeoTitleChange={(value) => updateForm('seoTitle', value)}
              onSeoDescriptionChange={(value) => updateForm('seoDescription', value)}
            />

            <ArticlePhotosSection
              photos={form.articlePhotos}
              onOpenAssetPicker={() => setIsArticlePhotoPickerOpen(true)}
              onRemovePhoto={handleRemoveArticlePhoto}
              onChangePhoto={handleChangeArticlePhoto}
            />

            <PublicationSection
              categories={categories}
              form={form}
              tags={tags}
              onFieldChange={updateForm}
              onToggleTag={(tagId) => updateForm('tagIds', toggleTagId(form.tagIds, tagId))}
            />

            <div className="flex items-center justify-between border-t border-gray-200 pt-5">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!form.slug.trim()}
                >
                  Preview
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update News' : 'Create News'}
                </Button>
              </div>
            </div>
          </form>
        )}

        <CoverImagePickerModal
          open={isPickerOpen}
          galleries={galleries}
          onClose={() => setIsPickerOpen(false)}
          onSelect={(selection) => {
            if (localPreviewUrl) {
              URL.revokeObjectURL(localPreviewUrl);
            }

            setLocalCoverFile(null);
            setLocalPreviewUrl(null);

            updateForm('coverImage', selection.path);
            updateForm('coverImageAlt', selection.alt || form.title);

            setIsPickerOpen(false);
          }}
          onSelectLocalFile={handleCoverFile}
        />

        <CoverImagePickerModal
          open={isArticlePhotoPickerOpen}
          galleries={galleries}
          onClose={() => setIsArticlePhotoPickerOpen(false)}
          onSelect={(selection) => {
            void handleArticlePhotoSelection(selection);
          }}
          onSelectLocalFile={(file) => {
            handleAddArticlePhoto(file, {
              alt: form.title,
            });

            setIsArticlePhotoPickerOpen(false);
          }}
        />
      </section>
    </AppShell>
  );
}
