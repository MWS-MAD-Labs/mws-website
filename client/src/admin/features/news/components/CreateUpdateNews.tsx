import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi, type GalleryItem, type NewsCategory, type NewsTag } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import GalleryAssetPickerModal from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import {
  ArticleSection,
  CoverImageSection,
  NewsEditorHeader,
  NewsEditorMessage,
  PublicationSection,
  SeoSection,
  TagsSection,
} from '@/admin/features/news/components/NewsEditorSections';
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
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(newsId));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isEditing = Boolean(newsId);

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
          if (post) setForm(newsFormFromPost(post));
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load news editor.'));
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [newsId]);

  function updateForm<Key extends keyof NewsForm>(key: Key, value: NewsForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
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

    navigate(NEWS_LIST_PATH, { replace: true });
  }

  async function saveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const payload = newsPayloadFromForm(form);
      if (newsId) {
        await adminApi.updateNewsPost(newsId, payload);
      } else {
        await adminApi.createNewsPost(payload);
      }

      returnToNewsList();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to save news post.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title={isEditing ? 'Edit News' : 'Create News'}>
      <section className="space-y-5 p-6">
        <NewsEditorHeader
          isEditing={isEditing}
          isLoading={isLoading}
          isSaving={isSaving}
          onClose={returnToNewsList}
        />
        <NewsEditorMessage message={message} />

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            Loading news editor...
          </div>
        ) : (
          <form
            className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
            id={NEWS_EDITOR_FORM_ID}
            onSubmit={saveNews}
          >
            <div className="space-y-5">
              <ArticleSection
                form={form}
                onContentChange={(value) => updateForm('content', value)}
                onExcerptChange={(value) => updateForm('excerpt', value)}
                onSlugChange={updateSlug}
                onTitleChange={updateTitle}
              />
              <SeoSection form={form} onFieldChange={updateForm} />
            </div>

            <aside className="space-y-5 xl:sticky xl:top-0">
              <PublicationSection categories={categories} form={form} onFieldChange={updateForm} />
              <CoverImageSection
                form={form}
                onFieldChange={updateForm}
                onOpenAssetPicker={() => setIsAssetPickerOpen(true)}
                onRemoveCover={() => {
                  updateForm('coverImage', '');
                  updateForm('coverImageAlt', '');
                }}
              />
              <TagsSection selectedTagIds={form.tagIds} tags={tags} onToggleTag={toggleTag} />
            </aside>
          </form>
        )}
      </section>

      <GalleryAssetPickerModal
        allowedKinds={['IMAGE']}
        galleries={galleries}
        open={isAssetPickerOpen}
        title="Choose news cover image"
        onClose={() => setIsAssetPickerOpen(false)}
        onSelect={(asset) => {
          setForm((current) => ({
            ...current,
            coverImage: asset.path,
            coverImageAlt: current.coverImageAlt || asset.alt,
          }));
        }}
      />
    </AppShell>
  );
}
