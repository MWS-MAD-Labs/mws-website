/**
 * Widths a page may ask for with `?w=`. A fixed list, so nobody can fill the
 * bucket by requesting every width from 1 to 9999. Keep in sync with
 * IMAGE_VARIANT_WIDTHS in client/src/lib/api.ts.
 */
export const IMAGE_VARIANT_WIDTHS = [320, 640, 960, 1280] as const;

const VARIANT_PREFIX = "variants/";

export function isVariantObjectName(objectName: string) {
  return objectName.startsWith(VARIANT_PREFIX);
}

export function variantObjectName(objectName: string, width: number) {
  return `${VARIANT_PREFIX}w${width}/${objectName}.webp`;
}

/** Every variant key an original may have, for cleanup when it is deleted. */
export function variantObjectNames(objectName: string) {
  if (isVariantObjectName(objectName)) return [];
  return IMAGE_VARIANT_WIDTHS.map((width) => variantObjectName(objectName, width));
}
