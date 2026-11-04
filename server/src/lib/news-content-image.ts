/** `<uuid>.<ext>` — the only names the content image route serves. */
export const NEWS_CONTENT_IMAGE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:avif|jpg|png|webp)$/;

export const NEWS_CONTENT_IMAGE_PATH = "/api/news/content-images/";

export function newsContentImageUrl(name: string) {
  return `${NEWS_CONTENT_IMAGE_PATH}${name}`;
}

/** True only for an image stored by the news content image upload. */
export function isNewsContentImageUrl(value: string) {
  if (!value.startsWith(NEWS_CONTENT_IMAGE_PATH)) return false;
  return NEWS_CONTENT_IMAGE_NAME.test(value.slice(NEWS_CONTENT_IMAGE_PATH.length));
}
