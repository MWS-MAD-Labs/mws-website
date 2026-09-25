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

function sanitizedAttributes(tagName: string, rawAttributes: string) {
  if (tagName !== "a") return "";

  const attributes: string[] = [];
  const attributePattern = /([a-zA-Z0-9:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
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
