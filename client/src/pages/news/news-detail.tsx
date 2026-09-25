import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';

import { asset } from '@/data/site';

import {
  formatNewsDate,
  newsApi,
  publicNewsImage,
  type PublicNewsDetail,
} from '@/features/news/newsData';

export default function NewsDetails() {
  const { slug = '' } = useParams<{ slug: string }>();

  const [post, setPost] = useState<PublicNewsDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setPost(null);
        setError(null);
        setIsLoading(true);
      }
    });

    newsApi
      .detail(slug, controller.signal)
      .then(setPost)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this news story.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!post) return;

    const previousTitle = document.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    const previousDescription = description?.content;

    document.title = post.seo.title;

    if (description && post.seo.description) {
      description.content = post.seo.description;
    }

    return () => {
      document.title = previousTitle;

      if (description && previousDescription !== undefined) {
        description.content = previousDescription;
      }
    };
  }, [post]);

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#faf8f3]">
      {/* Breadcrumb Header */}
      <header className="bg-[#241718]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex min-h-[56px] min-w-0 items-center gap-2 overflow-hidden text-xs font-medium uppercase tracking-[0.1em]"
          >
            <Link to="/" className="shrink-0 text-white/60 transition-colors hover:text-white">
              Home
            </Link>

            <span aria-hidden="true" className="text-white/30">
              /
            </span>

            <Link to="/news" className="shrink-0 text-white/60 transition-colors hover:text-white">
              School News
            </Link>

            <span aria-hidden="true" className="text-white/30">
              /
            </span>

            <span className="truncate text-white/90">{post?.title || 'Article Detail'}</span>
          </nav>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
          {/* Loading */}
          {isLoading ? (
            <div className="border border-black/10 bg-white px-6 py-14 text-center">
              <p className="m-0 text-sm text-[#625759]">Loading news story...</p>
            </div>
          ) : null}

          {/* Error */}
          {!isLoading && error ? (
            <div className="border border-[#7e1518]/20 bg-white px-6 py-14 text-center">
              <p className="m-0 text-[#625759]">{error}</p>

              <Link
                to="/news"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518]"
              >
                <span aria-hidden="true">←</span>
                Back to School News
              </Link>
            </div>
          ) : null}

          {!isLoading && post ? (
            <>
              {/* Article Header */}
              <header className="mb-10 max-w-[960px] lg:mb-14">
                <span className="inline-flex bg-[#7e1518]/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7e1518]">
                  {post.category?.name || 'School News'}
                </span>

                <h1 className="m-0 mt-5 max-w-[920px] font-sans text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-[#241718] sm:text-4xl lg:text-[56px] lg:leading-[1.06]">
                  {post.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#625759]">
                  <span>{formatNewsDate(post.publishedAt)}</span>

                  {post.authorName ? (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>Written by {post.authorName}</span>
                    </>
                  ) : null}
                </div>

                {post.excerpt ? (
                  <p className="mt-6 max-w-[800px] font-serif text-lg leading-[1.7] text-[#625759] sm:text-xl">
                    {post.excerpt}
                  </p>
                ) : null}
              </header>

              {/* Main Content */}
              <div className="grid min-w-0 grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
                {/* Article */}
                <article className="min-w-0">
                  {/* Cover */}
                  <figure className="overflow-hidden bg-[#f5f2ec]">
                    <img
                      src={publicNewsImage(post.coverImage || null, asset('_DSC4760.jpg'))}
                      alt={post.coverImageAlt || post.title || 'MWS School News'}
                      className="block aspect-[16/9] h-auto w-full object-cover"
                    />
                  </figure>

                  {/* Content */}
	                  <div
	                    className="prose prose-gray prose-headings:font-sans prose-headings:font-semibold prose-headings:text-[#241718] prose-p:font-sans prose-p:leading-[1.8] prose-p:text-[#241718] prose-strong:text-[#241718] prose-a:text-[#7e1518] prose-a:break-words prose-blockquote:border-l-[#7e1518] prose-blockquote:text-[#625759] prose-ul:text-[#241718] prose-ol:text-[#241718] prose-li:text-[#241718] prose-img:mx-auto prose-img:max-w-full prose-hr:border-black/10 prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-video:max-w-full prose-iframe:max-w-full mt-10 max-w-none break-words [&_a]:[overflow-wrap:anywhere] [&_code]:break-words [&_code]:[overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto"
	                    dangerouslySetInnerHTML={{
	                      __html: DOMPurify.sanitize(post.content?.text || ''),
	                    }}
	                  />

                  {/* Additional Images */}
                  {post.media
                    .filter((media) => media.mediaType === 'IMAGE')
                    .map((media) => (
                      <figure key={media.id} className="mt-10 overflow-hidden">
                        <div className="overflow-hidden bg-[#f5f2ec]">
                          <img
                            src={publicNewsImage(media.url, asset('DSC04079.jpg'))}
                            alt={media.alt || post.title}
                            className="block h-auto max-h-[700px] w-full object-cover"
                          />
                        </div>

                        {media.caption ? (
                          <figcaption className="mt-3 text-center text-sm italic text-[#625759]">
                            {media.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}

                  {/* Article Footer */}
                  <div className="mt-10 border-t border-black/10 pt-7">
                    {post.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="bg-[#7e1518]/[0.08] px-3 py-1.5 text-xs font-semibold text-[#7e1518]"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <p className="mt-6 max-w-[780px] font-serif text-base leading-[1.8] text-[#625759]">
                      Stories like this reflect the experiences, ideas, and community that continue
                      to shape life at Millennia World School. Follow our latest updates to discover
                      more moments from our school community.
                    </p>
                  </div>
                </article>

                {/* Sidebar */}
                <aside className="min-w-0 lg:sticky lg:top-8">
                  {/* Recent News */}
                  <div className="border border-black/10 bg-white p-5 sm:p-6">
                    <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/10 pb-4">
                      <h2 className="m-0 max-w-[220px] font-sans text-xl font-semibold leading-tight text-[#241718]">
                        Explore More Recent Blogs
                      </h2>

                      <Link
                        to="/news"
                        className="shrink-0 text-xs font-semibold text-[#7e1518] transition-colors hover:text-[#241718]"
                      >
                        View All
                      </Link>
                    </div>

                    {post.relatedNews.length > 0 ? (
                      <div className="flex flex-col">
                        {post.relatedNews.map((relatedPost, index) => (
                          <Link
                            key={relatedPost.id}
                            to={`/news/${relatedPost.slug}`}
                            className={`group flex gap-4 py-4 ${
                              index !== 0 ? 'border-t border-black/[0.08]' : 'pt-0'
                            }`}
                          >
                            <div className="h-20 w-20 shrink-0 overflow-hidden bg-[#f5f2ec]">
                              <img
                                src={publicNewsImage(
                                  relatedPost.coverImage || null,
                                  asset('DSC04079.jpg'),
                                )}
                                alt={relatedPost.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="mb-1 text-[11px] text-[#625759]">
                                {formatNewsDate(relatedPost.publishedAt)}
                              </p>

                              <h3 className="m-0 line-clamp-3 font-sans text-sm font-semibold leading-[1.45] text-[#241718] transition-colors group-hover:text-[#7e1518]">
                                {relatedPost.title}
                              </h3>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="m-0 text-sm text-[#625759]">No recent stories yet.</p>
                    )}

                    <Link
                      to="/news"
                      className="mt-5 flex w-full items-center justify-center border border-[#241718] px-4 py-2.5 text-sm font-semibold text-[#241718] transition-colors hover:bg-[#241718] hover:text-white"
                    >
                      Load More
                    </Link>
                  </div>

                  {/* Book a Tour */}
                  <div className="mt-6 bg-[#7e1518] p-7 text-white">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                      Visit MWS
                    </p>

                    <h2 className="m-0 font-sans text-2xl font-semibold leading-tight text-white">
                      Book a Tour
                    </h2>

                    <p className="mt-4 text-sm leading-[1.7] text-white/85">
                      Come and discover the learning spaces, community, and experience behind
                      Millennia World School.
                    </p>

                    <Link
                      to="/admission"
                      className="mt-6 inline-flex w-full items-center justify-center border border-white px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#7e1518]"
                    >
                      Book a Tour
                    </Link>
                  </div>
                </aside>
              </div>

              {/* Bottom CTA */}
              <div className="mt-16 border-t border-black/10 pt-8 lg:mt-20">
                <p className="m-0 max-w-[760px] font-serif text-lg leading-[1.7] text-[#625759]">
                  Explore our{' '}
                  <Link
                    to="/academic"
                    className="font-semibold text-[#7e1518] underline decoration-[#7e1518]/30 underline-offset-4 transition-colors hover:text-[#241718]"
                  >
                    Academic
                  </Link>{' '}
                  program to see how your child can build strong foundations for future innovation.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
