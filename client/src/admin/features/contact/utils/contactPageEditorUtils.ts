import type { ContactPageContent } from "@/features/contact/contactPageData";

export function linesToText(lines: string[]) {
  return lines.join("\n");
}

export function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function categoryRowsToText(
  categories: ContactPageContent["form"]["categories"],
) {
  return categories
    .map((category) => `${category.value}|${category.label}`)
    .join("\n");
}

export function textToCategoryRows(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawValue, ...labelParts] = line.split("|");
      const categoryValue = rawValue?.trim() || "general";
      const label = labelParts.join("|").trim() || categoryValue;

      return { value: categoryValue, label };
    });
}

export function officeRowsToText(items: ContactPageContent["officeHours"]["items"]) {
  return items.map((item) => `${item.title}|${item.text}`).join("\n");
}

export function textToOfficeRows(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawTitle, ...textParts] = line.split("|");
      const title = rawTitle?.trim() || "Office Hours";
      const text = textParts.join("|").trim() || title;

      return { title, text };
    });
}
