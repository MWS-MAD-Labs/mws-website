export default function NewsMessageBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#D97706]">
      {message}
    </div>
  );
}
