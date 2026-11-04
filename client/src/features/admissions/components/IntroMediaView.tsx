import type { AdmissionIntroMedia } from '@/features/admissions/admissionPageData';
import { responsiveImage } from '@/lib/api';

type IntroMediaViewProps = {
  media: AdmissionIntroMedia;
};

export default function IntroMediaView({ media }: IntroMediaViewProps) {
  return (
    <div className="mt-10 overflow-hidden bg-[var(--charcoal)]">
      {media.type === 'video' ? (
        <video
          src={media.src}
          poster={media.poster}
          controls
          playsInline
          preload="metadata"
          aria-label={media.alt}
          className="block aspect-video w-full object-cover"
        />
      ) : (
        <img loading="lazy" decoding="async" {...responsiveImage(media.src, '(min-width: 1024px) 50vw, 100vw')} alt={media.alt} className="block aspect-video w-full object-cover" />
      )}
    </div>
  );
}
