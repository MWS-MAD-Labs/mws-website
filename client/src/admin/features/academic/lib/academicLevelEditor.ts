import type { AcademicSection } from '../academicCrudModel';

export type ImageField = 'cover' | 'hero' | 'intro' | `section-${number}`;

export function optionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

export function datetimeLocalValue(value: string | null) {
  if (!value) return '';
  return value.slice(0, 16);
}

export function isoFromDatetimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null;
}

// The public page alternates image sides by order, so the CMS keeps
// imagePosition in sync instead of exposing it as a layout control.
export function withAlternatingImages(sections: AcademicSection[]): AcademicSection[] {
  return sections.map((section, index) => ({
    ...section,
    imagePosition: index % 2 === 0 ? 'right' : 'left',
  }));
}
