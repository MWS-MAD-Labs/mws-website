import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminApi,
  type AdminCommunityStoriesPage,
  type AdminNewsPost,
  type AdminNewsPayload,
  type GalleryItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import GalleryAssetPickerModal from "@/admin/features/gallery/components/GalleryAssetPickerModal";
import GalleryPickerModal from "@/admin/features/gallery/components/GalleryPickerModal";
import GalleryThumb from "@/admin/features/gallery/components/GalleryThumb";

type PageForm = {
  galleryId: string | null;
  heroImageAlt: string;
  heroImagePath: string;
  introBody: string;
  introTitle: string;
  isPublished: boolean;
  title: string;
};

type NewsForm = {
  excerpt: string;
  galleryId: string | null;
  imageAlt: string;
  imagePath: string;
  isPublished: boolean;
  publishedAt: string;
  slug: string;
  title: string;
};

const emptyNewsForm: NewsForm = {
  excerpt: "",
  galleryId: null,
  imageAlt: "",
  imagePath: "",
  isPublished: false,
  publishedAt: "",
  slug: "",
  title: "",
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function pageToForm(page: AdminCommunityStoriesPage): PageForm {
  return {
    galleryId: page.galleryId,
    heroImageAlt: page.heroImageAlt ?? "",
    heroImagePath: page.heroImagePath ?? "",
    introBody: page.introBody.join("\n\n"),
    introTitle: page.introTitle ?? "",
    isPublished: page.isPublished,
    title: page.title,
  };
}

function newsToForm(news: AdminNewsPost): NewsForm {
  return {
    excerpt: news.excerpt ?? "",
    galleryId: news.galleryId,
    imageAlt: news.imageAlt ?? "",
    imagePath: news.imagePath ?? "",
    isPublished: news.isPublished,
    publishedAt: news.publishedAt ? news.publishedAt.slice(0, 16) : "",
    slug: news.slug,
    title: news.title,
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newsPayload(form: NewsForm): AdminNewsPayload {
  return {
    excerpt: optionalText(form.excerpt),
    galleryId: form.galleryId,
    imageAlt: optionalText(form.imageAlt),
    imagePath: optionalText(form.imagePath),
    isPublished: form.isPublished,
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    slug: form.slug,
    title: form.title,
  };
}

export default function CommunityStoriesPage() {
  const [pageForm, setPageForm] = useState<PageForm | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [news, setNews] = useState<AdminNewsPost[]>([]);
  const [newsForm, setNewsForm] = useState<NewsForm>(emptyNewsForm);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [isNewsGalleryPickerOpen, setIsNewsGalleryPickerOpen] = useState(false);
  const [isHeroAssetPickerOpen, setIsHeroAssetPickerOpen] = useState(false);
  const [isNewsAssetPickerOpen, setIsNewsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === pageForm?.galleryId) ?? null,
    [galleries, pageForm?.galleryId],
  );
  const selectedNewsGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === newsForm.galleryId) ?? null,
    [galleries, newsForm.galleryId],
  );
  const editingNews = useMemo(
    () => news.find((item) => item.id === editingNewsId) ?? null,
    [editingNewsId, news],
  );

  async function loadData() {
    const data = await adminApi.communityStories();
    setPageForm(pageToForm(data.page));
    setGalleries(data.galleries);
    setNews(data.news);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadData()
        .catch((error) =>
          setMessage(
            error instanceof Error
              ? error.message
              : "Failed to load community stories.",
          ),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pageForm) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updatedPage = await adminApi.updateCommunityStoriesPage({
        galleryId: pageForm.galleryId,
        heroImageAlt: optionalText(pageForm.heroImageAlt),
        heroImagePath: optionalText(pageForm.heroImagePath),
        introBody: pageForm.introBody
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean),
        introTitle: optionalText(pageForm.introTitle),
        isPublished: pageForm.isPublished,
        title: pageForm.title,
      });
      setPageForm(pageToForm(updatedPage));
      setMessage("Community Stories page updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save community stories.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function saveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (editingNewsId) {
        await adminApi.updateCommunityNews(editingNewsId, newsPayload(newsForm));
        setMessage("News item updated.");
      } else {
        await adminApi.createCommunityNews(newsPayload(newsForm));
        setMessage("News item created.");
      }
      setEditingNewsId(null);
      setNewsForm(emptyNewsForm);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save news.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteNews(id: string) {
    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteCommunityNews(id);
      if (editingNewsId === id) {
        setEditingNewsId(null);
        setNewsForm(emptyNewsForm);
      }
      await loadData();
      setMessage("News item deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete news.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Community Stories">
      <section className="space-y-5 p-6">
        <p className="text-sm text-gray-500">Content / Community Stories</p>

        {message ? (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading || !pageForm ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Loading Community Stories...
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <form
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              onSubmit={savePage}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Page Content
                  </h1>
                  <p className="text-sm text-gray-500">
                    Hero, intro copy, and connected gallery.
                  </p>
                </div>
                <Button disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save Page"}
                </Button>
              </div>

              <div className="grid gap-4 p-5">
                <Field label="Title">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={pageForm.title}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, title: event.target.value } : current,
                      )
                    }
                  />
                </Field>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4 lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Hero Image
                        </h3>
                        <p className="truncate text-sm text-gray-500">
                          {pageForm.heroImagePath || "No image selected."}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => setIsHeroAssetPickerOpen(true)}
                      >
                        Choose Image
                      </Button>
                    </div>
                    {pageForm.heroImagePath ? (
                      <img
                        className="mt-3 aspect-video w-full rounded-lg object-cover"
                        src={adminApi.publicAssetUrl(pageForm.heroImagePath)}
                        alt={pageForm.heroImageAlt || "Community Stories hero"}
                      />
                    ) : null}
                  </div>
                  <Field label="Hero Image Alt">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={pageForm.heroImageAlt}
                      onChange={(event) =>
                        setPageForm((current) =>
                          current
                            ? { ...current, heroImageAlt: event.target.value }
                            : current,
                        )
                      }
                    />
                  </Field>
                </div>
                <Field label="Intro Title">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={pageForm.introTitle}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current
                          ? { ...current, introTitle: event.target.value }
                          : current,
                      )
                    }
                  />
                </Field>
                <Field label="Intro Body">
                  <textarea
                    className="min-h-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={pageForm.introBody}
                    onChange={(event) =>
                      setPageForm((current) =>
                        current ? { ...current, introBody: event.target.value } : current,
                      )
                    }
                  />
                </Field>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Connected Gallery
                      </h2>
                      <p className="text-sm text-gray-500">
                        Used by the public gallery grid on this page.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsGalleryPickerOpen(true)}
                    >
                      Choose Gallery
                    </Button>
                  </div>
                  {selectedGallery ? (
                    <div className="flex items-center gap-3">
                      <GalleryThumb gallery={selectedGallery} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {selectedGallery.title}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {selectedGallery.description || "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No gallery selected.</p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    checked={pageForm.isPublished}
                    type="checkbox"
                    onChange={(event) =>
                      setPageForm((current) =>
                        current
                          ? { ...current, isPublished: event.target.checked }
                          : current,
                      )
                    }
                  />
                  Published
                </label>
              </div>
            </form>

            <form
              className="h-fit rounded-lg border border-gray-200 bg-white"
              onSubmit={saveNews}
            >
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                  {editingNews ? "Edit News" : "New News"}
                </h2>
              </div>
              <div className="grid gap-4 p-5">
                <Field label="Title">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={newsForm.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setNewsForm((current) => ({
                        ...current,
                        slug: current.slug ? current.slug : slugify(title),
                        title,
                      }));
                    }}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={newsForm.slug}
                    onChange={(event) =>
                      setNewsForm((current) => ({
                        ...current,
                        slug: slugify(event.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Excerpt">
                  <textarea
                    className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={newsForm.excerpt}
                    onChange={(event) =>
                      setNewsForm((current) => ({
                        ...current,
                        excerpt: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4 sm:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900">
                          News Image
                        </h3>
                        <p className="truncate text-sm text-gray-500">
                          {newsForm.imagePath || "No image selected."}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => setIsNewsAssetPickerOpen(true)}
                      >
                        Choose Image
                      </Button>
                    </div>
                    {newsForm.imagePath ? (
                      <img
                        className="mt-3 aspect-video w-full rounded-lg object-cover"
                        src={adminApi.publicAssetUrl(newsForm.imagePath)}
                        alt={newsForm.imageAlt || newsForm.title || "News image"}
                      />
                    ) : null}
                  </div>
                  <Field label="Image Alt">
                    <input
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={newsForm.imageAlt}
                      onChange={(event) =>
                        setNewsForm((current) => ({
                          ...current,
                          imageAlt: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Published At">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    type="datetime-local"
                    value={newsForm.publishedAt}
                    onChange={(event) =>
                      setNewsForm((current) => ({
                        ...current,
                        publishedAt: event.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      News Gallery
                    </h3>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewsGalleryPickerOpen(true)}
                    >
                      Choose
                    </Button>
                  </div>
                  {selectedNewsGallery ? (
                    <div className="flex items-center gap-3">
                      <GalleryThumb gallery={selectedNewsGallery} />
                      <p className="truncate text-sm text-gray-700">
                        {selectedNewsGallery.title}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No gallery selected.</p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    checked={newsForm.isPublished}
                    type="checkbox"
                    onChange={(event) =>
                      setNewsForm((current) => ({
                        ...current,
                        isPublished: event.target.checked,
                      }))
                    }
                  />
                  Published
                </label>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm(emptyNewsForm);
                    }}
                  >
                    Clear
                  </Button>
                  <Button disabled={isSaving} type="submit">
                    {isSaving ? "Saving..." : "Save News"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {!isLoading ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">News List</h2>
            </div>
            {!news.length ? (
              <div className="p-5 text-sm text-gray-500">No news yet.</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {news.map((item) => (
                  <div
                    className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_120px_150px] md:items-center"
                    key={item.id}
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="truncate text-sm text-gray-500">
                        /news/{item.slug}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.isPublished ? "Published" : "Draft"}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={isSaving}
                        size="sm"
                        type="button"
                        variant="danger"
                        onClick={() => deleteNews(item.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingNewsId(item.id);
                          setNewsForm(newsToForm(item));
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <GalleryPickerModal
          galleries={galleries}
          open={isGalleryPickerOpen}
          selectedGalleryId={pageForm?.galleryId ?? null}
          onClose={() => setIsGalleryPickerOpen(false)}
          onSelect={(galleryId) =>
            setPageForm((current) => (current ? { ...current, galleryId } : current))
          }
        />
        <GalleryPickerModal
          galleries={galleries}
          open={isNewsGalleryPickerOpen}
          selectedGalleryId={newsForm.galleryId}
          onClose={() => setIsNewsGalleryPickerOpen(false)}
          onSelect={(galleryId) =>
            setNewsForm((current) => ({ ...current, galleryId }))
          }
        />
        <GalleryAssetPickerModal
          allowedKinds={["IMAGE"]}
          galleries={galleries}
          initialGalleryId={pageForm?.galleryId ?? null}
          open={isHeroAssetPickerOpen}
          title="Choose Hero Image"
          onClose={() => setIsHeroAssetPickerOpen(false)}
          onSelect={(asset) =>
            setPageForm((current) =>
              current
                ? {
                    ...current,
                    galleryId: asset.galleryId,
                    heroImageAlt: asset.alt,
                    heroImagePath: asset.path,
                  }
                : current,
            )
          }
        />
        <GalleryAssetPickerModal
          allowedKinds={["IMAGE"]}
          galleries={galleries}
          initialGalleryId={newsForm.galleryId}
          open={isNewsAssetPickerOpen}
          title="Choose News Image"
          onClose={() => setIsNewsAssetPickerOpen(false)}
          onSelect={(asset) =>
            setNewsForm((current) => ({
              ...current,
              galleryId: asset.galleryId,
              imageAlt: asset.alt,
              imagePath: asset.path,
            }))
          }
        />
      </section>
    </AppShell>
  );
}
