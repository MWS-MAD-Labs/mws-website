import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import SubpageHero from '../../components/ui/SubpageHero';
import { asset } from '../../data/site';
import {
  formatNewsDate,
  newsApi,
  publicNewsImage,
  readTimeLabel,
  type PublicNewsCategory,
  type PublicNewsList,
} from '@/features/news/newsData';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';

const EMPTY_NEWS: PublicNewsList = {
  items: [],
  pagination: { page: 1, pageSize: 6, total: 0, totalPages: 0 },
};

export default function SchoolNews() {
  const [news, setNews] = useState<PublicNewsList>(EMPTY_NEWS);
  const [recentNews, setRecentNews] = useState<PublicNewsList['items']>([]);
  const [categories, setCategories] = useState<PublicNewsCategory[]>([]);
  const [totalPublished, setTotalPublished] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setError(null);
      }
    });

    Promise.all([
      newsApi.list({ page, pageSize: 6, search, category }, controller.signal),
      newsApi.categories(controller.signal),
      newsApi.list({ page: 1, pageSize: 4 }, controller.signal),
    ])
      .then(([nextNews, nextCategories, recent]) => {
        setNews(nextNews);
        setCategories(nextCategories);
        setRecentNews(recent.items);
        setTotalPublished(recent.pagination.total);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error ? requestError.message : 'Unable to load school news.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [category, page, search]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function selectCategory(slug: string) {
    setCategory(slug);
    setPage(1);
  }

  return (
    <main>
      <SubpageHero
        title="School News"
        image={asset('DSC04079.jpg')}
        imageAlt="MWS School Activities"
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'School News' }]}
      />

      <ContentBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: 'About MWS' }, { label: 'Our School' }]}
      />

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16" aria-label="School news post feed">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_292px]">
            {/* News Feed */}
            <section className="min-w-0 space-y-5" aria-live="polite">
              {isLoading ? <NewsState message="Loading school news..." /> : null}

              {!isLoading && error ? <NewsState message={error} isError /> : null}

              {!isLoading && !error && !news.items.length ? (
                <NewsState message="No news stories match your search yet." />
              ) : null}

              {!isLoading && !error
                ? news.items.map((post, index) => (
                    <article
                      key={post.id}
                      className={[
                        'grid overflow-hidden border border-gray-200 bg-white',
                        'transition-shadow duration-300 hover:shadow-md',
                        'md:grid-cols-[275px_minmax(0,1fr)]',
                        index === 1 ? 'motion-delay-100' : '',
                        index === 2 ? 'motion-delay-200' : '',
                      ].join(' ')}
                    >
                      {/* Fixed image frame */}
                      <Link
                        className="block h-[260px] w-full overflow-hidden bg-[#241718] md:h-[260px] md:w-[275px]"
                        to={`/news/${post.slug}`}
                      >
                        <img
                          className="block h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                          src={publicNewsImage(post.coverImage, asset('DSC04079.jpg'))}
                          alt={post.coverImageAlt || post.title}
                        />
                      </Link>

                      {/* Article body */}
                      <div className="flex min-h-[260px] min-w-0 flex-col p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                          <span className="inline-flex bg-[#7e1518]/10 px-2.5 py-1 font-semibold text-[#7e1518]">
                            {post.category?.name || 'School News'}
                          </span>

                          <span>{formatNewsDate(post.publishedAt)}</span>

                          <span>
                            by{' '}
                            <strong className="font-semibold text-gray-700">
                              {post.authorName}
                            </strong>
                          </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#241718]">
                          <Link
                            className="transition-colors hover:text-[#7e1518]"
                            to={`/news/${post.slug}`}
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                          {post.excerpt || 'Read the latest story from our school community.'}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                          <Link
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518]"
                            to={`/news/${post.slug}`}
                          >
                            Read Story
                            <span aria-hidden="true">→</span>
                          </Link>

                          <span className="text-xs font-medium text-gray-500">
                            {readTimeLabel(post.readTime)}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                : null}

              {!isLoading && !error && news.pagination.totalPages > 1 ? (
                <nav
                  className="flex items-center justify-between border-t border-gray-200 pt-5"
                  aria-label="News pages"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                    className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#7e1518] hover:text-[#7e1518] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-500">
                    Page {news.pagination.page} of {news.pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= news.pagination.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                    className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#7e1518] hover:text-[#7e1518] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </section>

            {/* Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Search */}
              <div className="border border-gray-200 bg-white p-5">
                <form className="flex flex-col gap-2" onSubmit={submitSearch}>
                  <input
                    type="search"
                    placeholder="Search stories..."
                    aria-label="Search news"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="w-full border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#7e1518] focus:ring-2 focus:ring-[#7e1518]/10"
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#7e1518] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#681214]"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Categories */}
              <div className="border border-gray-200 bg-white p-5">
                <h2 className="text-base font-semibold text-[#241718]">Categories</h2>

                <ul className="mt-4 divide-y divide-gray-100">
                  <li>
                    <button
                      className={`flex w-full items-center justify-between py-2.5 text-left text-sm transition-colors ${
                        !category
                          ? 'font-semibold text-[#7e1518]'
                          : 'text-gray-600 hover:text-[#7e1518]'
                      }`}
                      type="button"
                      onClick={() => selectCategory('')}
                    >
                      <span>All News</span>
                      <span className="text-xs text-gray-400">{totalPublished}</span>
                    </button>
                  </li>

                  {categories.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`flex w-full items-center justify-between py-2.5 text-left text-sm transition-colors ${
                          category === item.slug
                            ? 'font-semibold text-[#7e1518]'
                            : 'text-gray-600 hover:text-[#7e1518]'
                        }`}
                        type="button"
                        onClick={() => selectCategory(item.slug)}
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-gray-400">{item.count || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Schedule */}
              <div className="bg-[#241718] p-5 text-white">
                <h2 className="text-base font-semibold">Schedule Highlights</h2>

                <div className="mt-5 divide-y divide-white/10">
                  <div className="py-4 first:pt-0">
                    <strong className="block text-sm font-medium text-[#d6a13a]">
                      Parent Coffee Morning
                    </strong>

                    <span className="mt-1 block text-xs text-white/60">Tuesday - 09:00 AM</span>
                  </div>

                  <div className="pb-0 pt-4">
                    <strong className="block text-sm font-medium text-[#d6a13a]">
                      Student Exhibition
                    </strong>

                    <span className="mt-1 block text-xs text-white/60">Friday - Main Hall</span>
                  </div>
                </div>
              </div>

              {/* Recent Updates */}
              <div className="border border-gray-200 bg-white p-5">
                <h2 className="text-base font-semibold text-[#241718]">Recent Updates</h2>

                <ul className="mt-4 divide-y divide-gray-100">
                  {recentNews.map((post) => (
                    <li key={post.id} className="py-3 first:pt-0">
                      <Link
                        className="block text-sm font-medium leading-5 text-gray-800 transition-colors hover:text-[#7e1518]"
                        to={`/news/${post.slug}`}
                      >
                        {post.title}
                      </Link>

                      <span className="mt-1.5 block text-xs text-gray-400">
                        {formatNewsDate(post.publishedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function NewsState({ message, isError = false }: { message: string; isError?: boolean }) {
  return (
    <div
      className={`border px-5 py-10 text-center ${
        isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500'
      }`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}
