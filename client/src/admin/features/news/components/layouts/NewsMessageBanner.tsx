import StatusMessage from '@/admin/components/ui/StatusMessage';

export default function NewsMessageBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-3">
      <StatusMessage>{message}</StatusMessage>
    </div>
  );
}
