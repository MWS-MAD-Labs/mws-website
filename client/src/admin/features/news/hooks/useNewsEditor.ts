// UNUSED — SAFE TO DELETE: only used by the old NewsEditorModal; the active create/edit routes render CreateUpdateNews directly.
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { adminApi, type GalleryItem, type NewsCategory, type NewsTag } from '@/admin/api/adminApi';
import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import {
  createEmptyNewsForm,
  newsFormFromPost,
  newsPayloadFromForm,
  slugify,
  toggleTagId,
  type NewsArticlePhoto,
  type NewsForm,
} from '@/admin/features/news/newsEditorModel';
import { getErrorMessage } from '@/admin/features/news/newsUtils';
import { apiClient } from '@/lib/api';

export type ImagePickerTarget = 'cover' | 'article-photo';
export type ArticlePhotoField = 'alt' | 'caption';

type UseNewsEditorOptions = {
  newsId?: string | null;
  onSaved: () => void;
};

async function galleryAssetToFile(selection: GalleryAssetSelection): Promise<File> {
  const response = await apiClient.get<Blob>(adminApi.publicAssetUrl(selection.path), {
    responseType: 'blob',
  });

  const blob = response.data;
  const extension = blob.type.split('/')[1] || 'jpg';

  return new File([blob], `${selection.label || 'article-photo'}.${extension}`, {
    type: blob.type || 'image/jpeg',
  });
}

export function useNewsEditor({ newsId, onSaved }: UseNewsEditorOptions) {
  const isEditing = Boolean(newsId);

  const [form, setForm] = useState<NewsForm>(createEmptyNewsForm);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  const [pickerTarget, setPickerTarget] = useState<ImagePickerTarget | null>(null);
  const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Latest photos, readable from the unmount cleanup below.
  const articlePhotosRef = useRef(form.articlePhotos);

  useEffect(() => {
    articlePhotosRef.current = form.articlePhotos;
  });

  // Load lookups and, when editing, the post itself.
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
        setForm(post ? newsFormFromPost(post) : createEmptyNewsForm());
        setSlugWasEdited(Boolean(post));
      } catch (error) {
        if (!cancelled) setMessage(getErrorMessage(error, 'Failed to load news editor.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [newsId]);

  // Revoke the cover preview whenever it is replaced or the editor closes.
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  // Revoke any leftover article photo previews when the editor closes.
  useEffect(() => {
    return () => {
      for (const photo of articlePhotosRef.current) {
        if (photo.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, []);

  /* ---------- Form fields ---------- */

  function updateForm<Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugWasEdited ? current.slug : slugify(value),
    }));
  }

  function changeSlug(value: string) {
    setSlugWasEdited(true);
    updateForm('slug', value);
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({ ...current, tagIds: toggleTagId(current.tagIds, tagId) }));
  }

  /* ---------- Cover ---------- */

  function setCoverFromFile(file: File) {
    setLocalCoverFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setForm((current) => ({ ...current, coverImageAlt: current.coverImageAlt || current.title }));
  }

  function setCoverFromGallery(selection: GalleryAssetSelection) {
    setLocalCoverFile(null);
    setLocalPreviewUrl(null);
    setForm((current) => ({
      ...current,
      coverImage: selection.path,
      coverImageAlt: selection.alt || current.title,
    }));
  }

  function removeCover() {
    setLocalCoverFile(null);
    setLocalPreviewUrl(null);
    setForm((current) => ({ ...current, coverImage: '', coverImageAlt: '' }));
  }

  /* ---------- Article photos ---------- */

  function addArticlePhoto(file: File, alt = '') {
    const photo: NewsArticlePhoto = {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      alt,
      caption: '',
    };

    setForm((current) => ({ ...current, articlePhotos: [...current.articlePhotos, photo] }));
  }

  function removeArticlePhoto(id: string) {
    const photo = form.articlePhotos.find((item) => item.id === id);

    if (!photo) return;

    if (photo.existingMediaId) {
      // Already stored server-side: the save has to delete it through the API.
      setRemovedMediaIds((current) => [...current, photo.existingMediaId!]);
    } else if (photo.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    setForm((current) => ({
      ...current,
      articlePhotos: current.articlePhotos.filter((item) => item.id !== id),
    }));
  }

  function changeArticlePhoto(id: string, field: ArticlePhotoField, value: string) {
    setForm((current) => ({
      ...current,
      articlePhotos: current.articlePhotos.map((photo) =>
        photo.id === id ? { ...photo, [field]: value } : photo,
      ),
    }));
  }

  /* ---------- Image picker ---------- */

  async function handlePickerSelect(selection: GalleryAssetSelection) {
    if (pickerTarget === 'cover') {
      setCoverFromGallery(selection);
      return;
    }

    // The picker can also hand back a video, which is not an article photo.
    if (selection.kind !== 'IMAGE') return;

    try {
      addArticlePhoto(await galleryAssetToFile(selection), selection.alt);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to select gallery image.'));
    }
  }

  function handlePickerLocalFile(file: File) {
    if (pickerTarget === 'article-photo') {
      addArticlePhoto(file, form.title);
      return;
    }

    setCoverFromFile(file);
  }

  /* ---------- Preview & save ---------- */

  const canPreview = Boolean(form.slug.trim());

  function preview() {
    if (!canPreview) return;

    window.open(`/news/${form.slug}`, '_blank', 'noopener,noreferrer');
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
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

      // Only article photos can be in this list, so the cover is never removed by accident.
      for (const mediaId of removedMediaIds) {
        await adminApi.deleteNewsImage(savedPost.id, mediaId);
      }

      setRemovedMediaIds([]);

      // Sequential on purpose: the API appends each photo, so awaiting one at a
      // time keeps the order the editor picked.
      for (const photo of form.articlePhotos) {
        if (!photo.file) continue;

        await adminApi.uploadNewsImage(savedPost.id, {
          file: photo.file,
          alt: photo.alt || undefined,
          caption: photo.caption || undefined,
          purpose: 'ARTICLE',
        });
      }

      onSaved();
    } catch (error) {
      if (!isEditing && createdNewsId) {
        try {
          await adminApi.deleteNewsPost(createdNewsId);
        } catch {
          // Preserve original error.
        }
      }

      setMessage(getErrorMessage(error, 'Failed to save news.'));
    } finally {
      setSaving(false);
    }
  }

  return {
    isEditing,
    form,
    categories,
    tags,
    galleries,
    loading,
    saving,
    message,
    localCoverFile,
    localPreviewUrl,
    pickerTarget,
    canPreview,
    updateForm,
    changeTitle,
    changeSlug,
    toggleTag,
    removeCover,
    removeArticlePhoto,
    changeArticlePhoto,
    openPicker: setPickerTarget,
    closePicker: () => setPickerTarget(null),
    handlePickerSelect,
    handlePickerLocalFile,
    preview,
    save,
  };
}
