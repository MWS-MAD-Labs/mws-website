import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import SubpageHero from '../../components/ui/SubpageHero';

import { asset } from '../../data/site';

import {
  formatNewsDate,
  newsApi,
  publicNewsImage,
  type PublicNewsDetail,
} from '@/features/news/newsData';
import RelatedNewsSection from './RelatedNewsSection';

export default function NewsDetail() {
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
    <main className="min-w-0 overflow-x-hidden">
      <SubpageHero
        title={post?.title || (isLoading ? 'Loading News...' : 'News Story')}
        image={publicNewsImage(post?.coverImage || null, asset('_DSC4760.jpg'))}
        imageAlt={post?.coverImageAlt || post?.title || 'MWS School News'}
        breadcrumbs={[
          {
            label: 'Home',
            path: '/',
          },
          {
            label: 'School News',
            path: '/news',
          },
          {
            label: post?.title || 'Article Detail',
          },
        ]}
      />

      <section className="relative px-0 py-14 sm:py-16 lg:py-24">
        <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px] sm:w-[calc(100%-40px)] lg:px-12">
          {isLoading ? (
            <div className="border border-black/10 bg-[#faf8f3] px-7 py-11 text-center">
              <p className="m-0 text-sm text-[#625759]">Loading news story...</p>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="border border-[#7e1518]/30 bg-[#faf8f3] px-7 py-11 text-center">
              <p className="m-0 text-[#625759]">{error}</p>

              <Link
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518]"
                to="/news"
              >
                Back to School News
                <span aria-hidden="true" className="text-base">
                  →
                </span>
              </Link>
            </div>
          ) : null}

          {!isLoading && post ? (
            <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:gap-[60px]">
              {/* Article */}
              <article className="min-w-0 max-w-full">
                {/* Category */}
                <span className="mb-3 inline-block bg-[#7e1518]/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#7e1518]">
                  {post.category?.name || 'School News'}
                </span>

                {/* Meta */}
                <span className="mb-6 block text-sm text-[#625759]">
                  Published on {formatNewsDate(post.publishedAt)} - Written by {post.authorName}
                </span>

                {/* Excerpt */}
                {post.excerpt ? (
                  <p className="mb-10 max-w-full font-serif text-[19px] italic leading-[1.55] text-[#625759] sm:text-[22px] sm:leading-[1.6]">
                    {post.excerpt}
                  </p>
                ) : null}

                {/* Article Content */}
                <div
                  className="prose prose-gray prose-headings:font-sans prose-headings:font-semibold prose-headings:text-[#241718] prose-p:text-[#241718] prose-p:leading-[1.7] prose-strong:text-[#241718] prose-a:text-[#7e1518] prose-a:break-words prose-ul:text-[#241718] prose-ol:text-[#241718] prose-blockquote:border-l-[#7e1518] prose-blockquote:text-[#625759] prose-img:mx-auto prose-img:max-w-full prose-hr:border-black/10 prose-li:break-words mt-8 min-w-0 max-w-none break-words [&_a]:break-words [&_a]:[overflow-wrap:anywhere] [&_code]:break-words [&_code]:[overflow-wrap:anywhere] [&_iframe]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_video]:max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: post.content?.text || '',
                  }}
                />

                {/* Additional Media */}
                {post.media
                  .filter((media) => media.mediaType === 'IMAGE')
                  .map((media) => (
                    <figure className="my-10 min-w-0 max-w-full" key={media.id}>
                      <div className="aspect-video w-full overflow-hidden border border-black/10 bg-[#f5f2ec]">
                        <img
                          className="block h-full w-full object-cover"
                          src={publicNewsImage(media.url, asset('DSC04079.jpg'))}
                          alt={media.alt || post.title}
                        />
                      </div>

                      {media.caption ? (
                        <figcaption className="mt-2 text-center text-sm italic text-[#625759]">
                          {media.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}

                {/* Tags */}
                {post.tags.length ? (
                  <div
                    className="mt-9 flex flex-wrap gap-2 border-t border-black/10 pt-6"
                    aria-label="Article tags"
                  >
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-[#7e1518]/[0.08] px-3 py-1.5 text-xs font-bold text-[#7e1518]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>

              {/* Sidebar */}
              <aside className="min-w-0 max-w-full">
                {/* More News */}
                <div className="mb-10 min-w-0 max-w-full overflow-hidden border border-black/[0.14] bg-white p-6 sm:p-9">
                  <h3 className="mb-6 border-b border-black/[0.08] pb-3 font-sans text-lg font-semibold text-[#241718]">
                    More News
                  </h3>

                  {post.relatedNews.length ? (
                    <ul className="m-0 flex list-none flex-col gap-6 p-0">
                      {post.relatedNews.map((relatedPost, index) => (
                        <li
                          className={`min-w-0 ${
                            index === 0 ? '' : 'border-t border-black/[0.08] pt-[18px]'
                          } `}
                          key={relatedPost.id}
                        >
                          <Link
                            className="mb-1 block max-w-full break-words font-sans text-[15px] font-semibold leading-6 text-[#241718] transition-colors hover:text-[#7e1518]"
                            to={`/news/${relatedPost.slug}`}
                          >
                            {relatedPost.title}
                          </Link>

                          <span className="text-xs text-[#625759]">
                            {formatNewsDate(relatedPost.publishedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="m-0 text-sm text-[#625759]">No related stories yet.</p>
                  )}
                </div>

                {/* Visit Campus */}
                <div className="bg-[#7e1518] p-8 text-white sm:p-10">
                  <h3 className="mb-3.5 mt-0 font-sans text-xl font-semibold text-white">
                    Visit Our Campus
                  </h3>

                  <p className="mb-6 text-[15px] leading-[1.6] text-white/85">
                    Discover the learning spaces and community behind our latest stories.
                  </p>

                  <Link
                    className="inline-block w-full border border-white bg-transparent px-5 py-2.5 text-center font-sans text-sm font-semibold text-white transition-colors hover:border-[#5e1013] hover:bg-[#5e1013]"
                    to="/admission"
                  >
                    Book a Tour
                  </Link>
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
      <RelatedNewsSection posts={post?.relatedNews ?? []} />
    </main>
  );
}
