import type { ContactInquiryList, ContactInquiryStatus } from '@/admin/api/adminApi';

export const INQUIRY_STATUS_OPTIONS: Array<{ value: ContactInquiryStatus; label: string }> = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'SPAM', label: 'Spam' },
];

const STATUS_CLASSES: Record<ContactInquiryStatus, string> = {
  NEW: 'bg-[#3C50E0]/10 text-[#3C50E0] ring-[#3C50E0]/20',
  IN_PROGRESS: 'bg-[#F59E0B]/10 text-[#D97706] ring-[#F59E0B]/20',
  RESOLVED: 'bg-[#10B981]/10 text-[#047857] ring-[#10B981]/20',
  SPAM: 'bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20',
};

export const EMPTY_INQUIRY_RESULT: ContactInquiryList = {
  items: [],
  statusCounts: {},
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
};

export const INQUIRY_PAGE_SIZE = 20;

export function getInquiryStatusLabel(status: string) {
  return INQUIRY_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getInquiryStatusClasses(status: string) {
  return (
    STATUS_CLASSES[status as ContactInquiryStatus] ??
    'bg-[#64748B]/10 text-[#64748B] ring-[#64748B]/20'
  );
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatInquiryDate(value: string) {
  return dateFormatter.format(new Date(value));
}
