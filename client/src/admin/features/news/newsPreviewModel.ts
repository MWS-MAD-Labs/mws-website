import type { NewsPost, NewsPostMedia } from '@/admin/api/adminApi';
import type { PublicNewsDetail } from '@/features/news/newsData';

function mediaUrl(media: NewsPostMedia) {
  return media.url.startsWith('news/images/') ? `/api/news/media/${media.id}/file` : media.url;
}

function contentText(content: unknown) {
  if (typeof content === 'string') return content;

  if (content && typeof content === 'object' && 'text' in content) {
    const text = (content as { text?: unknown }).text;
    if (typeof text === 'string') return text;
  }

  return '';
}

function articleMedia(post: NewsPost) {
  return post.media.filter((media) => media.mediaType === 'IMAGE' && mediaUrl(media) !== post.coverImage);
}

export function newsPreviewFromPost(post: NewsPost): PublicNewsDetail {
  const publishedAt = post.publishedAt ?? post.updatedAt ?? post.createdAt;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    coverImageAlt: post.coverImageAlt,
    publishedAt,
    readTime: post.readTime,
    authorName: post.authorName?.trim() || post.author?.name || 'MWS Editorial Team',
    category: post.category
      ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
    content: {
      format: 'plain_text',
      text: contentText(post.content),
    },
    tags: post.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    media: articleMedia(post).map((media) => ({
      id: media.id,
      mediaType: media.mediaType,
      url: mediaUrl(media),
      alt: media.alt,
      caption: media.caption,
      sortOrder: media.sortOrder,
    })),
    seo: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    },
    relatedNews: [],
  };
}
