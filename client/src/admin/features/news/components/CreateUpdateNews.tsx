import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { adminApi, type GalleryItem, type NewsCategory, type NewsTag } from '@/admin/api/adminApi';

import AppShell from '@/admin/components/layout/AppShell';

import Button from '@/admin/components/ui/Button';

import {
  ArticleSection,
  CoverImageSection,
  NewsEditorHeader,
  NewsEditorMessage,
  PublicationSection,
} from '@/admin/features/news/components/layouts';

import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';

import {
  NEWS_EDITOR_FORM_ID,
  createEmptyNewsForm,
  newsFormFromPost,
  newsPayloadFromForm,
  slugify,
  toggleTagId,
  type NewsForm,
} from '@/admin/features/news/newsEditorModel';

import {
  NEWS_LIST_PATH,
  getErrorMessage,
  notifyNewsListReturn,
} from '@/admin/features/news/newsUtils';

export default function CreateUpdateNews() {
  const { newsId } = useParams<{ newsId: string }>();

  const navigate = useNavigate();

  const [form, setForm] = useState<NewsForm>(createEmptyNewsForm);

  const [categories, setCategories] = useState<NewsCategory[]>([]);

  const [tags, setTags] = useState<NewsTag[]>([]);

  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const [localCoverFile, setLocalCoverFile] = useState<File | null>(null);

  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(newsId));

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const isEditing = Boolean(newsId);

  const localCoverPreviewUrl = useMemo(
    () => (localCoverFile ? URL.createObjectURL(localCoverFile) : null),
    [localCoverFile],
  );

  useEffect(() => {
    return () => {
      if (localCoverPreviewUrl) {
        URL.revokeObjectURL(localCoverPreviewUrl);
      }
    };
  }, [localCoverPreviewUrl]);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      Promise.all([
        adminApi.newsCategories(),
        adminApi.newsTags(),
        adminApi.galleries(),
        newsId ? adminApi.newsPost(newsId) : Promise.resolve(null),
      ])
        .then(([nextCategories, nextTags, nextGalleries, post]) => {
          if (!isCurrent) return;

          setCategories(nextCategories);
          setTags(nextTags);
          setGalleries(nextGalleries);

          if (post) {
            setForm(newsFormFromPost(post));
          }
        })
        .catch((error) => {
          if (!isCurrent) return;

          setMessage(getErrorMessage(error, 'Failed to load news editor.'));
        })
        .finally(() => {
          if (isCurrent) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [newsId]);

  function updateForm<Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) {
    if (key === 'coverImage') {
      setLocalCoverFile(null);
    }

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: slugWasEdited ? current.slug : slugify(title),
    }));
  }

  function updateSlug(value: string) {
    setSlugWasEdited(true);

    updateForm('slug', slugify(value));
  }

  function toggleTag(tagId: string) {
    setForm((current) => ({
      ...current,
      tagIds: toggleTagId(current.tagIds, tagId),
    }));
  }

  function resetEditorState() {
    setForm(createEmptyNewsForm());
    setLocalCoverFile(null);
    setSlugWasEdited(false);
    setIsAssetPickerOpen(false);
    setMessage(null);
  }

  function returnToNewsList() {
    resetEditorState();

    notifyNewsListReturn();

    if (window.opener && !window.opener.closed) {
      window.close();
    }

    navigate(NEWS_LIST_PATH, {
      replace: true,
    });
  }

  function handlePreview() {
    if (!form.slug) {
      setMessage('Add a slug before previewing the news post.');
      return;
    }

    window.open(`/news/${form.slug}`, '_blank', 'noopener,noreferrer');
  }

  async function saveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setMessage(null);

    let newlyCreatedPostId: string | null = null;

    try {
      const payload = newsPayloadFromForm(form);

      const savedPost = newsId
        ? await adminApi.updateNewsPost(newsId, payload)
        : await adminApi.createNewsPost(payload);

      if (!newsId) {
        newlyCreatedPostId = savedPost.id;
      }

      if (localCoverFile) {
        await adminApi.uploadNewsImage(savedPost.id, {
          file: localCoverFile,
          alt: form.coverImageAlt.trim() || undefined,
        });
      }

      returnToNewsList();
    } catch (error) {
      if (newlyCreatedPostId) {
        await adminApi.deleteNewsPost(newlyCreatedPostId).catch(() => undefined);
      }

      setMessage(getErrorMessage(error, 'Failed to save news post.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title={isEditing ? 'Edit News' : 'Create News'}>
      <section className="space-y-5 p-6">
        <NewsEditorHeader isEditing={isEditing} onClose={returnToNewsList} />

        <NewsEditorMessage message={message} />

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            Loading news editor...
          </div>
        ) : (
          <form id={NEWS_EDITOR_FORM_ID} className="space-y-5" onSubmit={saveNews}>
            {/* Images */}
            <CoverImageSection
              form={form}
              localFileName={localCoverFile?.name}
              localPreviewUrl={localCoverPreviewUrl}
              onFieldChange={updateForm}
              onOpenAssetPicker={() => setIsAssetPickerOpen(true)}
              onRemoveCover={() => {
                setLocalCoverFile(null);
                updateForm('coverImage', '');
                updateForm('coverImageAlt', '');
              }}
            />

            {/* Article + SEO */}
            <ArticleSection
              form={form}
              onContentChange={(value) => updateForm('content', value)}
              onExcerptChange={(value) => updateForm('excerpt', value)}
              onSlugChange={updateSlug}
              onTitleChange={updateTitle}
              onSeoTitleChange={(value) => updateForm('seoTitle', value)}
              onSeoDescriptionChange={(value) => updateForm('seoDescription', value)}
            />

            {/* Publication + Tags */}
            <PublicationSection
              categories={categories}
              form={form}
              tags={tags}
              onFieldChange={updateForm}
              onToggleTag={toggleTag}
            />
          </form>
        )}

        {/* Form actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={returnToNewsList}>
            Back
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isSaving}
            onClick={handlePreview}
          >
            Preview
          </Button>

          <Button disabled={isLoading || isSaving} form={NEWS_EDITOR_FORM_ID} type="submit">
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Cover image picker */}
        <CoverImagePickerModal
          galleries={galleries}
          open={isAssetPickerOpen}
          onClose={() => setIsAssetPickerOpen(false)}
          onSelect={(asset) => {
            setLocalCoverFile(null);

            setForm((current) => ({
              ...current,
              coverImage: asset.path,
              coverImageAlt: current.coverImageAlt || asset.alt,
            }));
          }}
          onSelectLocalFile={(file) => {
            if (file.size > 10 * 1024 * 1024) {
              setMessage('Image file must be 10MB or smaller.');
              return;
            }

            setMessage(null);
            setLocalCoverFile(file);
          }}
        />
      </section>
    </AppShell>
  );
}
