/**
 * Widths the API can serve for an uploaded image with `?w=`. Keep in sync with
 * IMAGE_VARIANT_WIDTHS in server/src/lib/image-variant-names.ts.
 */
export const IMAGE_VARIANT_WIDTHS = [320, 640, 960, 1280] as const;

/** Uploaded-image routes that answer `?w=` with a smaller WebP copy. */
const RESIZABLE_IMAGE_PATH =
  /\/api\/(?:gallery-images\/[0-9a-f-]{36}\/file|news\/media\/[0-9a-f-]{36}\/file|news\/content-images\/[\w.-]+|pages\/academic-assets\/academic%2Fimages%2F[^/?#]+)$/i;

export function isResizableImage(src: string | null | undefined) {
  return Boolean(src && RESIZABLE_IMAGE_PATH.test(src));
}

/** `src` must already be a full URL (see responsiveImage in ./api). */
export function responsiveImageAttributes(src: string, sizes: string) {
  if (!isResizableImage(src)) return { src };

  const variants = IMAGE_VARIANT_WIDTHS.map((width) => `${src}?w=${width} ${width}w`);
  // The stored original is at most 2000px wide.
  return { src, srcSet: [...variants, `${src} 2000w`].join(', '), sizes };
}
