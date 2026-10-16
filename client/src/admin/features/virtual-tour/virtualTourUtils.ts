import type { VirtualTourStatus } from '@/admin/api/adminApi';

export const FIELD_CLASS =
  'w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#3C50E0] focus:ring-2 focus:ring-[#3C50E0]/10 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]';

export function toVirtualTourSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export function statusLabel(status: VirtualTourStatus) {
  if (status === 'PUBLISHED') return 'Live';
  if (status === 'ARCHIVED') return 'Archived';
  return 'Draft';
}

export function sceneImagePath(path: string, imageId: string) {
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `/api/gallery-images/${imageId}/file`;
}
