import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  formatNewsDate,
  newsApi,
  publicNewsImage,
  type PublicNewsListItem,
} from '@/features/news/newsData';


import { asset } from '@/data/site';

type RelatedNewsSectionProps = {
  currentPostId: string;
};

export default function RelatedNewsSection({ currentPostId }: RelatedNewsSectionProps) {
  const [news, setNews] = useState<PublicNewsListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    newsApi
      .list(
        {
          page: 1,
          pageSize: 5,
        },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted) return;

        const filteredNews = result.items.filter((post) => post.id !== currentPostId).slice(0, 4);

        setNews(filteredNews);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setNews([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [currentPostId]);

  if (!isLoading && !news.length) {
    return null;
  }

  return (
    <section className="border-t border-black/10 px-0 py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px] sm:w-[calc(100%-40px)] lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#7e1518]">
              School Journal
            </span>

            <h2 className="m-0 font-serif text-3xl font-semibold text-[#241718] sm:text-4xl">
              More News
            </h2>
          </div>

          <Link
            to="/news"
            className="hidden shrink-0 text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518] sm:inline-flex"
          >
            Read All News →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="min-w-0">
                <div className="aspect-video w-full animate-pulse bg-[#f5f2ec]" />

                <div className="pt-4">
                  <div className="h-3 w-20 animate-pulse bg-[#f5f2ec]" />
                  <div className="mt-3 h-5 w-full animate-pulse bg-[#f5f2ec]" />
                  <div className="mt-2 h-5 w-3/4 animate-pulse bg-[#f5f2ec]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {news.map((post) => (
              <article key={post.id} className="min-w-0">
                <Link to={`/news/${post.slug}`} className="group block min-w-0">
                  <div className="aspect-video w-full overflow-hidden bg-[#f5f2ec]">
                    <img
                      src={publicNewsImage(post.coverImage, asset('DSC04079.jpg'))}
                      alt={post.coverImageAlt || post.title}
                      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="pt-4">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.1em]">
                      <span className="text-[#7e1518]">{post.category?.name || 'School News'}</span>

                      <span className="text-black/25">•</span>

                      <span className="text-[#625759]">{formatNewsDate(post.publishedAt)}</span>
                    </div>

                    <h3 className="m-0 font-serif text-lg font-semibold leading-7 text-[#241718] transition-colors group-hover:text-[#7e1518]">
                      {post.title}
                    </h3>

                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#625759]">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            to="/news"
            className="inline-flex text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518]"
          >
            Read All News →
          </Link>
        </div>
      </div>
    </section>
  );
}
