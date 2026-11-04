import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ResponseError } from "../error/response-error";

export type ImageKind = {
  contentType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  extension: "avif" | "jpg" | "png" | "webp";
};

/**
 * The bytes decide what a file is, never a header or a file name: a public
 * link can answer with anything, and a Drive link that is not shared answers
 * with an HTML sign-in page.
 */
export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { contentType: "image/png", extension: "png" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { contentType: "image/webp", extension: "webp" };
  }
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) {
    return { contentType: "image/avif", extension: "avif" };
  }

  return null;
}

/**
 * Share links point at a viewer page, not at the file. Rewrite the common ones
 * to their direct download form so admins can paste what the share dialog gave
 * them.
 */
export function directImageUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new ResponseError(400, "Image link is not a valid URL.");
  }

  const host = url.hostname.toLowerCase();

  if (host === "drive.google.com" || host === "docs.google.com") {
    const id =
      url.pathname.match(/\/(?:file\/)?d\/([\w-]{10,})/)?.[1] ??
      url.searchParams.get("id");

    if (id) {
      return new URL(
        `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`,
      );
    }
  }

  if (host === "www.dropbox.com" || host === "dropbox.com") {
    url.searchParams.delete("dl");
    url.searchParams.set("raw", "1");
  }

  return sizedGooglePhotoUrl(url);
}

/** Google's photo CDN: lh3.googleusercontent.com, lh4..., lh3.google.com. */
export function isGooglePhotoCdn(url: URL) {
  return /^lh\d+\.(?:googleusercontent|google)\.com$/.test(url.hostname.toLowerCase());
}

/**
 * The `=...` suffix on a Google CDN link picks the size Google sends. Ask for
 * no more than the article ever shows, instead of `=s0`/`=d` originals that
 * can be tens of megabytes.
 */
export function sizedGooglePhotoUrl(url: URL, maxEdge = 2000) {
  if (!isGooglePhotoCdn(url)) return url;

  const sized = new URL(url);
  const suffix = `=w${maxEdge}-h${maxEdge}`;
  sized.pathname = /=[^/]*$/.test(sized.pathname)
    ? sized.pathname.replace(/=[^/]*$/, suffix)
    : `${sized.pathname}${suffix}`;
  return sized;
}

function isGooglePhotosPage(url: URL) {
  const host = url.hostname.toLowerCase();
  return host === "photos.google.com" || host === "photos.app.goo.gl";
}

/**
 * A Google Photos share link opens a web page, not the file. The photo it
 * shows is in the page's `og:image` tag, which points at the Google CDN.
 */
export function googlePhotosImageUrl(html: string): URL | null {
  const tag =
    html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i)?.[0] ??
    html.match(/<meta[^>]+content=["'][^"']+["'][^>]+property=["']og:image["'][^>]*>/i)?.[0];
  const raw = tag?.match(/content=["']([^"']+)["']/i)?.[1];
  if (!raw) return null;

  try {
    const url = new URL(raw.replaceAll("&amp;", "&"));
    return isGooglePhotoCdn(url) ? sizedGooglePhotoUrl(url) : null;
  } catch {
    return null;
  }
}

function isPrivateIpv4(address: string) {
  const [a = 0, b = 0] = address.split(".").map(Number);

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version !== 6) return true;

  const value = address.toLowerCase();
  const mapped = value.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) return isPrivateIpv4(mapped);

  return (
    value === "::" ||
    value === "::1" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe8") ||
    value.startsWith("fe9") ||
    value.startsWith("fea") ||
    value.startsWith("feb") ||
    value.startsWith("ff") ||
    value.startsWith("64:ff9b:") ||
    value.startsWith("2001:db8:")
  );
}

type Resolver = (hostname: string) => Promise<string[]>;

const defaultResolver: Resolver = async (hostname) =>
  (await lookup(hostname, { all: true, verbatim: true })).map(
    (entry) => entry.address,
  );

/**
 * The server fetches this URL from inside the network, so a link must never
 * reach the database, MinIO, Redis or a cloud metadata endpoint. Every hop of
 * a redirect goes through this check again.
 */
export async function assertPublicHttpUrl(url: URL, resolve = defaultResolver) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ResponseError(400, "Image link must start with http:// or https://.");
  }
  if (url.username || url.password) {
    throw new ResponseError(400, "Image link must not contain a username or password.");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new ResponseError(400, "Image link must use the standard web port.");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname)
    ? [hostname]
    : await resolve(hostname).catch(() => {
        throw new ResponseError(400, "Image link host could not be found.");
      });

  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new ResponseError(400, "Image link must point to a public website.");
  }
}

const MAX_REDIRECTS = 8;
const FETCH_TIMEOUT_MS = 20_000;

async function readCapped(response: Response, maxBytes: number) {
  const declared = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new ResponseError(400, imageTooLargeMessage(maxBytes));
  }

  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();

  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new ResponseError(400, imageTooLargeMessage(maxBytes));
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export function imageTooLargeMessage(maxBytes: number) {
  const mb = Math.round(maxBytes / (1024 * 1024));
  return `Image file must be ${mb}MB or smaller.`;
}

export async function fetchRemoteImage(
  rawUrl: string,
  options: { maxBytes: number; resolve?: Resolver; fetchImpl?: typeof fetch },
) {
  const fetchImpl = options.fetchImpl ?? fetch;
  let url = directImageUrl(rawUrl);
  let followedPhotosPage = false;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicHttpUrl(url, options.resolve);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.5",
          // Several hosts (Wikimedia among them) refuse requests without one.
          "User-Agent": "MWS-Website-ImageImport/1.0",
        },
      });
    } catch {
      throw new ResponseError(400, "Image link could not be downloaded.");
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel().catch(() => undefined);
      if (!location) break;
      url = sizedGooglePhotoUrl(new URL(location, url));
      continue;
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ResponseError(
        400,
        `Image link answered with HTTP ${response.status}. Make sure the link is public.`,
      );
    }

    const bytes = await readCapped(response, options.maxBytes);
    const kind = detectImageKind(bytes);

    if (!kind && !followedPhotosPage && isGooglePhotosPage(url)) {
      const photo = googlePhotosImageUrl(new TextDecoder().decode(bytes));
      if (!photo) {
        throw new ResponseError(
          400,
          "No photo found on that Google Photos page. Share a single photo (not an album) with link sharing on.",
        );
      }
      followedPhotosPage = true;
      url = photo;
      continue;
    }

    if (!kind) {
      throw new ResponseError(
        400,
        "Image link did not return a JPEG, PNG, WebP or AVIF image. For Google Drive, set sharing to \"Anyone with the link\". iPhone HEIC photos must be exported as JPEG first.",
      );
    }

    return { bytes, kind };
  }

  throw new ResponseError(400, "Image link redirected too many times.");
}
