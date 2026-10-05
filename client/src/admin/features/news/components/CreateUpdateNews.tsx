import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  adminApi,
  type GalleryItem,
  type NewsCategory,
  type NewsStatus,
  type NewsTag,
} from '@/admin/api/adminApi';
import { apiClient } from '@/lib/api';

import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';

import AppShell from '@/admin/components/layout/AppShell';
import Tiptap from '@/admin/components/Tiptap';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';

import CoverImagePickerModal from './layouts/CoverImagePickerModal';
import NewsEditorHeader from './layouts/NewsEditorHeader';
import NewsEditorMessage from './layouts/NewsEditorMessage';
import CoverImageSection from './layouts/CoverImageSection';
import ArticlePhotosSection from './layouts/ArticlePhotosSection';

import {
  NEWS_INPUT_CLASS,
  createEmptyNewsForm,
  isCategorySelectable,
  newsFormFromPost,
  newsPayloadFromForm,
  slugify,
  toggleTagId,
  type NewsForm,
} from '../newsEditorModel';
import { NEWS_STATUS_OPTIONS, notifyNewsListReturn } from '../newsUtils';

export default function CreateUpdateNews() {
  const navigate = useNavigate();
  const { newsId } = useParams<{ newsId: string }>();
  const isEditing = Boolean(newsId);

  const [form, setForm] = useState<NewsForm>(createEmptyNewsForm());
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  const [imagePickerTarget, setImagePickerTarget] = useState<'cover' | 'article-photo' | null>(null);
  const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const articlePhotoPreviewUrlsRef = useRef<Set<string>>(new Set());

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
    const nextPreviewUrls = new Set(
      form.articlePhotos
        .map((photo) => photo.previewUrl)
        .filter((previewUrl): previewUrl is string => Boolean(previewUrl?.startsWith('blob:'))),
    );

    for (const previewUrl of articlePhotoPreviewUrlsRef.current) {
      if (!nextPreviewUrls.has(previewUrl)) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    articlePhotoPreviewUrlsRef.current = nextPreviewUrls;
  }, [form.articlePhotos]);

  useEffect(() => {
    return () => {
      for (const previewUrl of articlePhotoPreviewUrlsRef.current) {
        URL.revokeObjectURL(previewUrl);
      }

      articlePhotoPreviewUrlsRef.current.clear();
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

      notifyNewsListReturn(isEditing ? 'News post updated.' : 'News post created.');
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

      const response = await apiClient.get<Blob>(imageUrl, {
        responseType: 'blob',
      });

      const blob = response.data;

      const extension = blob.type.split('/')[1] || 'jpg';

      const file = new File([blob], `${selection.label || 'article-photo'}.${extension}`, {
        type: blob.type || 'image/jpeg',
      });

      handleAddArticlePhoto(file, {
        alt: selection.alt,
      });

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
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
            Loading news editor...
          </div>
        ) : (
          <form id="news-editor-form" className="space-y-5" onSubmit={saveNews}>
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
                <div className="border-b border-[#E2E8F0] px-5 py-4">
                  <h2 className="text-base font-semibold text-[#1C2434]">Article</h2>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Write the story exactly as it should appear on the public website.
                  </p>
                </div>

                <div className="space-y-5 p-5">
                  <Field label="Title">
                    <input
                      autoFocus
                      className={`${NEWS_INPUT_CLASS} text-lg font-semibold`}
                      maxLength={255}
                      placeholder="Enter the news headline"
                      required
                      value={form.title}
                      onChange={(event) => handleTitleChange(event.target.value)}
                    />
                  </Field>

                  <Field label="Excerpt">
                    <textarea
                      className={`${NEWS_INPUT_CLASS} min-h-28 resize-y`}
                      maxLength={2000}
                      placeholder="A short introduction displayed below the title."
                      value={form.excerpt}
                      onChange={(event) => updateForm('excerpt', event.target.value)}
                    />
                  </Field>

                  <Field as="div" label="Article content">
                    <Tiptap
                      ariaLabel="Article content"
                      placeholder="Write the story..."
                      size="article"
                      value={form.content}
                      onChange={(value) => updateForm('content', value)}
                    />
                  </Field>
                </div>

                <div className="border-t border-[#E2E8F0] p-5">
                  <ArticlePhotosSection
                    photos={form.articlePhotos}
                    onOpenAssetPicker={() => setImagePickerTarget('article-photo')}
                    onRemovePhoto={handleRemoveArticlePhoto}
                    onChangePhoto={handleChangeArticlePhoto}
                  />
                </div>
              </div>

              <aside className="min-w-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
                <section className="space-y-4 p-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#1C2434]">Publishing</h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Metadata, schedule, and article visibility.
                    </p>
                  </div>

                  <Field label="Category">
                    <Select
                      className="w-full"
                      value={form.categoryId}
                      onChange={(event) => updateForm('categoryId', event.target.value)}
                    >
                      <option value="">Uncategorized</option>

                      {categories
                        .filter((category) => isCategorySelectable(category, form.categoryId))
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </Select>
                  </Field>

                  <Field label="Author">
                    <input
                      className={NEWS_INPUT_CLASS}
                      maxLength={150}
                      placeholder="MWS Editorial Team"
                      value={form.authorName}
                      onChange={(event) => updateForm('authorName', event.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <Field label="Status">
                      <Select
                        className="w-full"
                        value={form.status}
                        onChange={(event) => updateForm('status', event.target.value as NewsStatus)}
                      >
                        {NEWS_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field label="Publish date">
                      <input
                        className={NEWS_INPUT_CLASS}
                        type="datetime-local"
                        value={form.publishedAt}
                        onChange={(event) => updateForm('publishedAt', event.target.value)}
                      />
                    </Field>
                  </div>

                  <Field label="Read time (minutes)">
                    <input
                      className={NEWS_INPUT_CLASS}
                      min={0}
                      max={9999}
                      type="number"
                      value={form.readTime}
                      onChange={(event) => updateForm('readTime', event.target.value)}
                    />
                  </Field>

                  <label className="flex min-h-[38px] cursor-pointer items-center gap-2 text-sm font-medium text-[#1C2434]">
                    <input
                      className="h-4 w-4 accent-[#3C50E0]"
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) => updateForm('isFeatured', event.target.checked)}
                    />
                    Feature this story
                  </label>

                  <div className="border-t border-[#E2E8F0] pt-4">
                    <h3 className="text-sm font-medium text-[#1C2434]">Tags</h3>

                    {!tags.length ? (
                      <p className="mt-2 text-sm text-[#64748B]">No news tags available.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const isSelected = form.tagIds.includes(tag.id);

                          return (
                            <button
                              key={tag.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => updateForm('tagIds', toggleTagId(form.tagIds, tag.id))}
                              className={[
                                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                isSelected
                                  ? 'border-[#3C50E0] bg-[#3C50E0] text-white'
                                  : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#3C50E0]/40 hover:text-[#3C50E0]',
                              ].join(' ')}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <section className="border-t border-[#E2E8F0] p-4">
                  <CoverImageSection
                    form={form}
                    localFileName={localCoverFile?.name}
                    localPreviewUrl={localPreviewUrl}
                    onFieldChange={updateForm}
                    onOpenAssetPicker={() => setImagePickerTarget('cover')}
                    onRemoveCover={handleRemoveCover}
                  />
                </section>

                <section className="space-y-4 border-t border-[#E2E8F0] p-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#1C2434]">SEO</h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Optional search result and article URL settings.
                    </p>
                  </div>

                  <Field label="Article URL">
                    <div className="flex overflow-hidden rounded-lg border border-[#E2E8F0] bg-white focus-within:border-[#3C50E0] focus-within:ring-2 focus-within:ring-[#3C50E0]/10">
                      <span className="grid place-items-center border-r border-[#E2E8F0] bg-[#F1F5F9] px-3 text-sm text-[#64748B]">
                        /news/
                      </span>

                      <input
                        className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                        maxLength={255}
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        required
                        value={form.slug}
                        onChange={(event) => handleSlugChange(event.target.value)}
                      />
                    </div>
                  </Field>

                  <Field label="SEO title">
                    <input
                      className={NEWS_INPUT_CLASS}
                      maxLength={255}
                      placeholder={form.title || 'Search result title'}
                      value={form.seoTitle}
                      onChange={(event) => updateForm('seoTitle', event.target.value)}
                    />
                  </Field>

                  <Field label="SEO description">
                    <textarea
                      className={`${NEWS_INPUT_CLASS} min-h-24 resize-y`}
                      maxLength={2000}
                      placeholder={form.excerpt || 'Search result description'}
                      value={form.seoDescription}
                      onChange={(event) => updateForm('seoDescription', event.target.value)}
                    />
                  </Field>
                </section>
              </aside>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-5">
              <Button type="button" variant="ghost" disabled={saving} onClick={handleClose}>
                Back
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={saving || !form.slug.trim()}
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
          open={imagePickerTarget !== null}
          galleries={galleries}
          title={imagePickerTarget === 'article-photo' ? 'Choose article photo' : 'Choose cover image'}
          onClose={() => setImagePickerTarget(null)}
          onSelect={(selection) => {
            if (imagePickerTarget === 'article-photo') {
              void handleArticlePhotoSelection(selection);
              return;
            }

            if (localPreviewUrl) {
              URL.revokeObjectURL(localPreviewUrl);
            }

            setLocalCoverFile(null);
            setLocalPreviewUrl(null);

            updateForm('coverImage', selection.path);
            updateForm('coverImageAlt', selection.alt || form.title);
          }}
          onSelectLocalFile={(file) => {
            if (imagePickerTarget === 'article-photo') {
              handleAddArticlePhoto(file, {
                alt: form.title,
              });
              return;
            }

            handleCoverFile(file);
          }}
        />
      </section>
    </AppShell>
  );
}
