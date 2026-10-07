import type { ContactPageContent } from "@/features/contact/contactPageData";

/** Still used by the unused legacy ContactEditorFields component. */
export function linesToText(lines: string[]) {
  return lines.join("\n");
}

export function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;

  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// ---------- Google Maps embed ----------

export type MapEmbedResult =
  | { ok: true; src: string }
  | { ok: false; error: string };

const EMBED_HELP =
  'In Google Maps, open the place, choose Share → Embed a map → Copy HTML, then paste it here.';

/**
 * Accepts either the full `<iframe ...>` code Google Maps gives you or just
 * its `src` URL, and returns the embeddable URL. Share links and place URLs
 * are refused because Google blocks them inside an iframe.
 */
export function parseMapEmbed(input: string): MapEmbedResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: `Paste the embed code first. ${EMBED_HELP}` };

  const iframeSrc = trimmed.match(/<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (/<iframe/i.test(trimmed) && !iframeSrc) {
    return { ok: false, error: `The iframe code has no map address in it. ${EMBED_HELP}` };
  }

  const candidate = (iframeSrc ?? trimmed).replace(/&amp;/g, "&");

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: `This is not a Google Maps embed. ${EMBED_HELP}` };
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "maps.app.goo.gl" || host === "goo.gl" || url.pathname.startsWith("/maps/place")) {
    return {
      ok: false,
      error: `This is a share link, and Google does not allow it inside a page. ${EMBED_HELP}`,
    };
  }

  const isEmbedPath = host === "google.com" && url.pathname.startsWith("/maps/embed");
  const isLegacyEmbed =
    (host === "google.com" || host === "maps.google.com") &&
    url.pathname === "/maps" &&
    url.searchParams.get("output") === "embed";

  if (url.protocol !== "https:" || !(isEmbedPath || isLegacyEmbed)) {
    return { ok: false, error: `This is not a Google Maps embed. ${EMBED_HELP}` };
  }

  return { ok: true, src: url.toString() };
}

export type MapLocation = {
  name: string | null;
  lat: number | null;
  lng: number | null;
};

/** Reads the place name and coordinates Google encodes in an embed URL. */
export function readMapLocation(src: string): MapLocation {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return { name: null, lat: null, lng: null };
  }

  const query = url.searchParams.get("q");
  const pb = url.searchParams.get("pb") ?? "";
  const lat = Number(pb.match(/!3d(-?\d+(?:\.\d+)?)/)?.[1] ?? NaN);
  const lng = Number(pb.match(/!2d(-?\d+(?:\.\d+)?)/)?.[1] ?? NaN);

  const names = [...pb.matchAll(/!2s([^!]+)/g)]
    .map((match) => {
      try {
        return decodeURIComponent(match[1].replace(/\+/g, " "));
      } catch {
        return match[1];
      }
    })
    // Skip the two-letter language codes Google also stores as !2s.
    .filter((value) => !/^[a-z]{2}$/i.test(value) && !/^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(value));

  return {
    name: names[0] ?? query ?? null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

// ---------- Save preparation ----------

/** Drops rows the editor left completely empty and trims every text value. */
export function cleanContactContent(content: ContactPageContent): ContactPageContent {
  return {
    ...content,
    hero: {
      title: content.hero.title.trim(),
      image: content.hero.image.trim(),
      imageAlt: content.hero.imageAlt.trim(),
    },
    intro: content.intro.trim(),
    form: {
      title: content.form.title.trim(),
      successMessage: content.form.successMessage.trim(),
      categories: content.form.categories
        .map((category) => ({
          label: category.label.trim(),
          value: category.value.trim() || slugify(category.label),
        }))
        .filter((category) => category.label),
    },
    address: {
      title: content.address.title.trim(),
      name: content.address.name.trim(),
      lines: content.address.lines.map((line) => line.trim()).filter(Boolean),
    },
    directContacts: {
      title: content.directContacts.title.trim(),
      heading: content.directContacts.heading.trim(),
      phone: content.directContacts.phone.trim(),
      whatsapp: content.directContacts.whatsapp.trim(),
      email: content.directContacts.email.trim(),
    },
    officeHours: {
      title: content.officeHours.title.trim(),
      items: content.officeHours.items
        .map((item) => ({ title: item.title.trim(), text: item.text.trim() }))
        .filter((item) => item.title || item.text),
    },
    map: {
      title: content.map.title.trim(),
      src: content.map.src.trim(),
      titleAttr: content.map.titleAttr.trim(),
    },
  };
}

/** Returns the first problem that would make the server refuse the save. */
export function validateContactContent(content: ContactPageContent): string | null {
  const required: Array<[string, string]> = [
    [content.hero.title, "Introduction: title"],
    [content.intro, "Introduction: text"],
    [content.hero.image, "Introduction: image"],
    [content.hero.imageAlt, "Introduction: image alt text"],
    [content.form.title, "Contact form: title"],
    [content.form.successMessage, "Contact form: success message"],
    [content.directContacts.title, "Contact information: section title"],
    [content.directContacts.heading, "Contact information: heading"],
    [content.directContacts.phone, "Contact information: phone"],
    [content.directContacts.whatsapp, "Contact information: WhatsApp"],
    [content.directContacts.email, "Contact information: email"],
    [content.address.title, "Address: title"],
    [content.address.name, "Address: school name"],
    [content.officeHours.title, "Office hours: title"],
    [content.map.title, "Map: section title"],
    [content.map.titleAttr, "Map: accessible title"],
  ];

  const missing = required.find(([value]) => !value);
  if (missing) return `${missing[1]} is required.`;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.directContacts.email)) {
    return "Contact information: email is not a valid address.";
  }
  if (!content.form.categories.length) return "Contact form: add at least one category.";
  if (!content.address.lines.length) return "Address: add at least one address line.";
  if (!content.officeHours.items.length) return "Office hours: add at least one row.";

  const incompleteHours = content.officeHours.items.findIndex((item) => !item.title || !item.text);
  if (incompleteHours >= 0) {
    return `Office hours: row ${incompleteHours + 1} needs both a day and hours.`;
  }

  const mapCheck = parseMapEmbed(content.map.src);
  if (!mapCheck.ok) return `Map: ${mapCheck.error}`;

  return null;
}
