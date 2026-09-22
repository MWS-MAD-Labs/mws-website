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
        if (!controller.signal.aborted) setIsLoading(false);
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

      <section className="news-page-section" aria-label="School news post feed">
        <div className="wrap">
          <div className="news-layout">
            <section className="news-feed" aria-live="polite">
              {isLoading ? <NewsState message="Loading school news..." /> : null}
              {!isLoading && error ? <NewsState message={error} isError /> : null}
              {!isLoading && !error && !news.items.length ? (
                <NewsState message="No news stories match your search yet." />
              ) : null}

              {!isLoading && !error
                ? news.items.map((post, index) => (
                    <article
                      className={`news-post-card motion-fade-up ${index === 1 ? 'motion-delay-100' : ''} ${index === 2 ? 'motion-delay-200' : ''} motion-hover-lift`}
                      key={post.id}
                    >
                      <Link className="news-post-media" to={`/news/${post.slug}`}>
                        <img
                          src={publicNewsImage(post.coverImage, asset('DSC04079.jpg'))}
                          alt={post.coverImageAlt || post.title}
                        />
                      </Link>
                      <div className="news-post-body">
                        <div className="news-post-meta">
                          <span className="news-badge">{post.category?.name || 'School News'}</span>
                          <span>{formatNewsDate(post.publishedAt)}</span>
                          <span>
                            by <strong>{post.authorName}</strong>
                          </span>
                        </div>
                        <h2>
                          <Link to={`/news/${post.slug}`}>{post.title}</Link>
                        </h2>
                        <p>{post.excerpt || 'Read the latest story from our school community.'}</p>
                        <div className="news-post-footer">
                          <Link className="text-link" to={`/news/${post.slug}`}>
                            Read Story
                          </Link>
                          <span>{readTimeLabel(post.readTime)}</span>
                        </div>
                      </div>
                    </article>
                  ))
                : null}

              {!isLoading && !error && news.pagination.totalPages > 1 ? (
                <nav className="news-pagination" aria-label="News pages">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {news.pagination.page} of {news.pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= news.pagination.totalPages}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </button>
                </nav>
              ) : null}
            </section>

            <aside className="news-sidebar">
              <div className="news-widget">
                <form className="news-search" onSubmit={submitSearch}>
                  <input
                    type="search"
                    placeholder="Search stories..."
                    aria-label="Search news"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                  <button type="submit">Search</button>
                </form>
              </div>

              <div className="news-widget">
                <h2>Categories</h2>
                <ul className="news-widget-list">
                  <li>
                    <button
                      className={!category ? 'is-active' : ''}
                      type="button"
                      onClick={() => selectCategory('')}
                    >
                      All News <span>{totalPublished}</span>
                    </button>
                  </li>
                  {categories.map((item) => (
                    <li key={item.id}>
                      <button
                        className={category === item.slug ? 'is-active' : ''}
                        type="button"
                        onClick={() => selectCategory(item.slug)}
                      >
                        {item.name} <span>{item.count || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="news-widget news-widget-dark">
                <h2>Schedule Highlights</h2>
                <div className="news-schedule-item">
                  <strong>Parent Coffee Morning</strong>
                  <span>Tuesday - 09:00 AM</span>
                </div>
                <div className="news-schedule-item">
                  <strong>Student Exhibition</strong>
                  <span>Friday - Main Hall</span>
                </div>
              </div>

              <div className="news-widget">
                <h2>Recent Updates</h2>
                <ul className="news-recent-list">
                  {recentNews.map((post) => (
                    <li key={post.id}>
                      <Link to={`/news/${post.slug}`}>{post.title}</Link>
                      <span>{formatNewsDate(post.publishedAt)}</span>
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
    <div className={`news-state${isError ? 'news-state-error' : ''}`}>
      <p>{message}</p>
    </div>
  );
}
