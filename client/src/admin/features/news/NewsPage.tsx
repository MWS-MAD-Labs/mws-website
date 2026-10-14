import AppShell from '@/admin/components/layout/AppShell';
import {
  NewsListCard,
  NewsMessageBanner,
  NewsPageHeader,
} from '@/admin/features/news/components/layouts';
import { useNewsList } from '@/admin/features/news/hooks/useNewsList';

export default function NewsPage() {
  const newsList = useNewsList();

  return (
    <AppShell title="News">
      <section className="space-y-5 p-6">
        <NewsPageHeader />
        <NewsMessageBanner message={newsList.message} />
        <NewsListCard
          categories={newsList.categories}
          deletingId={newsList.deletingId}
          filters={newsList.filters}
          isLoading={newsList.isLoading}
          result={newsList.result}
          statusUpdatingId={newsList.statusUpdatingId}
          onDelete={newsList.deletePost}
          onFilterChange={newsList.updateFilter}
          onPageChange={newsList.setPage}
          onStatusChange={newsList.updatePostStatus}
        />
      </section>
    </AppShell>
  );
}
