import { Mail } from 'lucide-react';
import type { ContactInquiry, ContactInquiryStatus } from '@/admin/api/adminApi';
import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { InquiryStatusBadge } from '@/admin/features/inquiries/components/InquiryListCard';
import {
  INQUIRY_STATUS_OPTIONS,
  formatInquiryDate,
} from '@/admin/features/inquiries/inquiryUtils';

type InquiryDetailModalProps = {
  inquiry: ContactInquiry | null;
  isLoading: boolean;
  isUpdating: boolean;
  message: string | null;
  onClose: () => void;
  onStatusChange: (inquiry: ContactInquiry, status: ContactInquiryStatus) => void;
};

export default function InquiryDetailModal({
  inquiry,
  isLoading,
  isUpdating,
  message,
  onClose,
  onStatusChange,
}: InquiryDetailModalProps) {
  return (
    <Modal open={Boolean(inquiry)} title="Inquiry" onClose={onClose}>
      {inquiry ? (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="min-w-0 text-base font-semibold text-[#1C2434]">{inquiry.subject}</h3>
              <InquiryStatusBadge status={inquiry.status} />
            </div>
            <p className="text-xs text-[#64748B]">
              Received {formatInquiryDate(inquiry.createdAt)}
              {isLoading ? ' · refreshing...' : ''}
            </p>
          </div>

          <dl className="grid gap-3 rounded-lg border border-[#E2E8F0] p-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[#64748B]">Name</dt>
              <dd className="mt-0.5 break-words text-[#1C2434]">{inquiry.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[#64748B]">Email</dt>
              <dd className="mt-0.5 select-all break-all text-[#1C2434]">{inquiry.email}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[#64748B]">Category</dt>
              <dd className="mt-0.5 text-[#1C2434]">{inquiry.category || '-'}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[#64748B]">Source</dt>
              <dd className="mt-0.5 text-[#1C2434]">{inquiry.source || '-'}</dd>
            </div>
          </dl>

          <div className="grid gap-2">
            <h4 className="text-xs font-medium text-[#64748B]">Message</h4>
            <p className="whitespace-pre-wrap break-words rounded-lg bg-[#F1F5F9] p-4 text-sm leading-6 text-[#1C2434]">
              {inquiry.message}
            </p>
          </div>

          <a
            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#3C50E0] hover:underline"
          >
            <Mail size={15} />
            Reply by email
          </a>

          <div className="grid gap-2 border-t border-[#E2E8F0] pt-4">
            <h4 className="text-sm font-semibold text-[#1C2434]">Status</h4>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_STATUS_OPTIONS.filter((option) => option.value !== inquiry.status).map(
                (option) => (
                  <Button
                    key={option.value}
                    disabled={isUpdating}
                    size="sm"
                    type="button"
                    variant={option.value === 'SPAM' ? 'danger' : 'outline'}
                    onClick={() => onStatusChange(inquiry, option.value)}
                  >
                    {option.value === 'SPAM' ? 'Mark as spam' : `Mark as ${option.label.toLowerCase()}`}
                  </Button>
                ),
              )}
            </div>
            {message ? <StatusMessage>{message}</StatusMessage> : null}
          </div>

          <details className="text-xs text-[#64748B]">
            <summary className="cursor-pointer font-medium">Technical details</summary>
            <dl className="mt-2 grid gap-1">
              <div>
                <dt className="inline font-medium">IP address: </dt>
                <dd className="inline break-all">{inquiry.ipAddress || '-'}</dd>
              </div>
              <div>
                <dt className="inline font-medium">User agent: </dt>
                <dd className="inline break-all">{inquiry.userAgent || '-'}</dd>
              </div>
            </dl>
          </details>
        </div>
      ) : null}
    </Modal>
  );
}
