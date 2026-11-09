import { ArrowLeft } from 'lucide-react';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import { HERO_SLIDES_PATH } from '../../heroSlideForm';

export default function HeroEditorHeader({
  backLabel,
  breadcrumb,
  description,
  title,
  onClose,
}: {
  backLabel: string;
  breadcrumb: string;
  description: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        aria-label={backLabel}
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:border-[#3C50E0]/30 hover:text-[#3C50E0]"
        type="button"
        onClick={onClose}
      >
        <ArrowLeft size={17} />
      </button>

      <ContentPageHeader
        breadcrumbs={[
          { label: 'Content' },
          { label: 'Home', path: HERO_SLIDES_PATH },
          { label: breadcrumb },
        ]}
        title={title}
        description={description}
      />
    </div>
  );
}
