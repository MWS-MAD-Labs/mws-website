import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ExternalLink } from 'lucide-react';

import { adminApi, type NewsPost } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import { newsPreviewFromPost } from '@/admin/features/news/newsPreviewModel';
import { asset } from '@/data/site';
import {
  formatNewsDate,
  publicNewsImage,
  type PublicNewsDetail,
} from '@/features/news/newsData';
import { isNewsScheduled, newsPublicationLabel } from '../newsUtils';

export default function NewsPreviewPage() {
  const { newsId = '' } = useParams<{ newsId: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
        if (!isCurrent) return;

      setPost(null);
      setIsLoading(true);
      setError(null);

      adminApi
        .newsPost(newsId)
        .then((nextPost) => {
          if (isCurrent) setPost(nextPost);
        })
        .catch((requestError) => {
          if (!isCurrent) return;
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this news preview.',
          );
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
    });

    return () => {
      isCurrent = false;
    };
  }, [newsId]);

  const preview = useMemo(() => (post ? newsPreviewFromPost(post) : null), [post]);

  return (
    <main className="min-w-0 overflow-x-hidden bg-[#faf8f3]">
      <AdminPreviewBar post={post} />

      {isLoading ? (
        <div className="mx-auto max-w-[1240px] px-4 py-14 text-center text-sm text-[#625759] sm:px-6 lg:px-8">
          Loading news preview...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="mx-auto max-w-[1240px] px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="border border-[#7e1518]/20 bg-white px-6 py-14">
            <p className="m-0 text-[#625759]">{error}</p>
            <Link
              to="/admin/news"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#241718] transition-colors hover:text-[#7e1518]"
            >
              Back to News CMS
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && preview ? <NewsPreviewArticle post={preview} /> : null}
    </main>
  );
}

function AdminPreviewBar({ post }: { post: NewsPost | null }) {
  const statusLabel = post ? newsPublicationLabel(post) : 'Preview';
  const isScheduled = post ? isNewsScheduled(post) : false;

  return (
    <div className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#3C50E0]">
            CMS news preview
          </p>
          <p className="mt-0.5 text-sm text-[#475569]">
            {post
              ? `${post.status}${isScheduled ? ' · scheduled' : ''} · ${statusLabel}`
              : 'Loading saved CMS content...'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {post?.slug ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(`/news/${post.slug}`, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink size={14} />
              Public URL
            </Button>
          ) : null}

          <Link
            to={post ? `/admin/news/${post.id}/edit` : '/admin/news'}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent bg-[#3C50E0] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#2F3EC8]"
          >
            Back to editor
          </Link>
        </div>
      </div>
    </div>
  );
}

function NewsPreviewArticle({ post }: { post: PublicNewsDetail }) {
  return (
    <>
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
            <span className="truncate text-white/90">{post.title || 'Article Detail'}</span>
          </nav>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
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

          <article className="max-w-[920px]">
            <figure className="overflow-hidden bg-[#f5f2ec]">
              <img
                src={publicNewsImage(post.coverImage || null, asset('_DSC4760.jpg'))}
                alt={post.coverImageAlt || post.title || 'MWS School News'}
                className="block aspect-[16/9] h-auto w-full object-cover"
              />
            </figure>

            <div
              className="public-rich-text mt-10 max-w-none break-words font-sans leading-[1.8] text-[#241718]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content?.text || ''),
              }}
            />

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

            {post.tags.length ? (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-black/10 pt-7">
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
          </article>
        </div>
      </section>
    </>
  );
}
