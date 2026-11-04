import { isNewsContentImageUrl } from "./news-content-image";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "hr",
  "a",
  "img",
]);

const URI_ATTRIBUTES = new Set(["href"]);
const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function isSafeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;

  try {
    return ALLOWED_LINK_PROTOCOLS.includes(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

const ATTRIBUTE_PATTERN = /([a-zA-Z0-9:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

function readAttributes(rawAttributes: string) {
  const values = new Map<string, string>();
  for (const match of rawAttributes.matchAll(ATTRIBUTE_PATTERN)) {
    const name = match[1]!.toLowerCase();
    if (values.has(name)) continue;
    values.set(name, (match[2] ?? "").replace(/^['"]|['"]$/g, ""));
  }
  return values;
}

/**
 * An article image may only show a file stored by the news content image
 * upload. Anything else (another site, a data: URI, a tracking pixel) is
 * dropped together with the tag.
 */
function sanitizedImage(rawAttributes: string) {
  const values = readAttributes(rawAttributes);
  const src = values.get("src")?.trim() ?? "";
  if (!isNewsContentImageUrl(src)) return "";

  // The editor already writes `&amp;`/`&quot;`; keep those instead of turning
  // them into a visible "&amp;amp;".
  const alt = (values.get("alt") ?? "")
    .slice(0, 255)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return `<img src="${escapeAttribute(src)}" alt="${alt}">`;
}

function sanitizedAttributes(tagName: string, rawAttributes: string) {
  if (tagName !== "a") return "";

  const attributes: string[] = [];
  const attributePattern = new RegExp(ATTRIBUTE_PATTERN.source, "g");
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(rawAttributes))) {
    const name = match[1]!.toLowerCase();
    if (!URI_ATTRIBUTES.has(name)) continue;

    const rawValue = match[2] ?? "";
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (name === "href" && isSafeHref(value)) {
      attributes.push(`href="${escapeAttribute(value)}"`);
    }
  }

  if (!attributes.length) return "";
  attributes.push('rel="noopener noreferrer"');
  return ` ${attributes.join(" ")}`;
}

export function sanitizeHtml(input: string) {
  if (!input) return "";

  return input.replace(/<[^>]*>/g, (rawTag) => {
    const match = rawTag.match(/^<\/?\s*([a-zA-Z0-9-]+)([^>]*)>$/);
    if (!match) return escapeHtml(rawTag);

    const tagName = match[1]!.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) return "";

    const isClosing = /^<\//.test(rawTag);
    if (tagName === "img") {
      return isClosing ? "" : sanitizedImage(match[2] ?? "");
    }
    if (isClosing) return `</${tagName}>`;

    const isVoid = tagName === "br" || tagName === "hr";
    const attributes = sanitizedAttributes(tagName, match[2] ?? "");
    return `<${tagName}${attributes}${isVoid ? "" : ""}>`;
  });
}

export function sanitizeNewsContent(content: unknown) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return content;
  }

  const value = content as Record<string, unknown>;
  if (typeof value.text !== "string") return content;

  return {
    ...value,
    text: sanitizeHtml(value.text),
  };
}
