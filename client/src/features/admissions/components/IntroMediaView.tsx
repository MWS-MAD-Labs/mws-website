import type { AdmissionIntroMedia } from '@/features/admissions/admissionPageData';

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
        <img src={media.src} alt={media.alt} className="block aspect-video w-full object-cover" />
      )}
    </div>
  );
}
