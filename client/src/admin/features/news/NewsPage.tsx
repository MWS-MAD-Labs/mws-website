import { useCallback, useEffect, useRef, useState } from 'react';
import {
  adminApi,
  type NewsCategory,
  type NewsPost,
  type NewsPostList,
  type NewsStatus,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import {
  NewsListCard,
  NewsMessageBanner,
  NewsPageHeader,
} from '@/admin/features/news/components/layouts';
import {
  buildNewsPostFilters,
  createInitialNewsFilters,
  type NewsFilters,
} from '@/admin/features/news/newsListModel';
import {
  EMPTY_NEWS_RESULT,
  NEWS_LIST_RETURN_KEY,
  getErrorMessage,
  getNewsStatusLabel,
} from '@/admin/features/news/newsUtils';

export default function NewsPage() {
  const [result, setResult] = useState<NewsPostList>(EMPTY_NEWS_RESULT);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [filters, setFilters] = useState<NewsFilters>(createInitialNewsFilters);
  const [page, setPage] = useState(1);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const lastReturnMarkerRef = useRef<string | null>(null);

  const resetListToInitial = useCallback(() => {
    setFilters(createInitialNewsFilters());
    setPage(1);
    setRefreshVersion((current) => current + 1);
  }, []);

  const updateFilter = useCallback(
    <Key extends keyof NewsFilters>(key: Key, value: NewsFilters[Key]) => {
      setFilters((current) => ({ ...current, [key]: value }));
      setPage(1);
    },
    [],
  );

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      adminApi
        .newsCategories()
        .then((items) => {
          if (isCurrent) setCategories(items);
        })
        .catch((error) => {
          if (!isCurrent) return;
          setMessage(getErrorMessage(error, 'Failed to load categories.'));
        });
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    const consumeReturnMarker = (marker: string | null) => {
      if (!marker || marker === lastReturnMarkerRef.current) return false;

      lastReturnMarkerRef.current = marker;
      resetListToInitial();
      return true;
    };

    const refreshAfterReturningToTab = () => {
      if (consumeReturnMarker(window.localStorage.getItem(NEWS_LIST_RETURN_KEY))) return;
      setRefreshVersion((current) => current + 1);
    };

    const resetAfterEditorFinishes = (event: StorageEvent) => {
      if (event.key === NEWS_LIST_RETURN_KEY) {
        consumeReturnMarker(event.newValue);
      }
    };

    lastReturnMarkerRef.current = window.localStorage.getItem(NEWS_LIST_RETURN_KEY);
    window.addEventListener('focus', refreshAfterReturningToTab);
    window.addEventListener('storage', resetAfterEditorFinishes);
    return () => {
      window.removeEventListener('focus', refreshAfterReturningToTab);
      window.removeEventListener('storage', resetAfterEditorFinishes);
    };
  }, [resetListToInitial]);

  useEffect(() => {
    let isCurrent = true;

    const timer = window.setTimeout(
      () => {
        setIsLoading(true);
        setMessage(null);

        adminApi
          .newsPosts(buildNewsPostFilters(filters, page))
          .then((nextResult) => {
            if (isCurrent) setResult(nextResult);
          })
          .catch((error) => {
            if (!isCurrent) return;
            setMessage(getErrorMessage(error, 'Failed to load news posts.'));
          })
          .finally(() => {
            if (isCurrent) setIsLoading(false);
          });
      },
      filters.search ? 300 : 0,
    );

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [filters, page, refreshVersion]);

  async function deletePost(post: NewsPost) {
    const confirmed = window.confirm(`Delete "${post.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(post.id);
    setMessage(null);

    try {
      await adminApi.deleteNewsPost(post.id);
      const nextPage = result.items.length === 1 && page > 1 ? page - 1 : page;
      const nextResult = await adminApi.newsPosts(buildNewsPostFilters(filters, nextPage));
      setPage(nextPage);
      setResult(nextResult);
      setMessage('News post deleted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to delete news post.'));
    } finally {
      setDeletingId(null);
    }
  }

  async function updatePostStatus(post: NewsPost, status: NewsStatus) {
    if (post.status === status) return;

    setStatusUpdatingId(post.id);
    setMessage(null);

    try {
      await adminApi.updateNewsPostStatus(post.id, { status });
      const nextResult = await adminApi.newsPosts(buildNewsPostFilters(filters, page));
      setResult(nextResult);
      setMessage(`News status updated to ${getNewsStatusLabel(status)}.`);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Failed to update news status.'));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <AppShell title="News">
      <section className="space-y-5 p-6">
        <NewsPageHeader />
        <NewsMessageBanner message={message} />
        <NewsListCard
          categories={categories}
          deletingId={deletingId}
          filters={filters}
          isLoading={isLoading}
          result={result}
          statusUpdatingId={statusUpdatingId}
          onDelete={deletePost}
          onFilterChange={updateFilter}
          onPageChange={setPage}
          onStatusChange={updatePostStatus}
        />
      </section>
    </AppShell>
  );
}
