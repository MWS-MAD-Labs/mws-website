/**
 * Turns what an editor pastes (the full `<iframe>` code from Google Maps or
 * just its URL) into an embeddable Google Maps URL. Anything else, such as a
 * share link Google refuses to show inside an iframe, returns null.
 */
export function normalizeMapEmbedSrc(input: string): string | null {
  const trimmed = input.trim();
  const iframeSrc = trimmed.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
  const candidate = (iframeSrc ?? trimmed).replace(/&amp;/g, "&");

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const isEmbedPath = host === "google.com" && url.pathname.startsWith("/maps/embed");
  const isLegacyEmbed =
    (host === "google.com" || host === "maps.google.com") &&
    url.pathname === "/maps" &&
    url.searchParams.get("output") === "embed";

  if (url.protocol !== "https:" || !(isEmbedPath || isLegacyEmbed)) return null;
  return url.toString();
}

export const MAP_EMBED_ERROR =
  "Map must be a Google Maps embed. In Google Maps use Share → Embed a map → Copy HTML.";
