import { Pause, Play, X } from 'lucide-react';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';

export type Voice = {
  id?: string;
  role: string;
  name: string;
  grade: string | null;
  image: string;
  quote: string;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type CommunityVoicesProps = {
  maxItems?: number | null;
  voices?: Voice[];
  showFooterLink?: boolean;
};

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (host.endsWith('youtube.com')) {
      const watchId = parsed.searchParams.get('v');

      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`;
      }

      const parts = parsed.pathname.split('/').filter(Boolean);

      if (parts[0] === 'shorts' || parts[0] === 'embed') {
        return `https://www.youtube.com/embed/${parts[1]}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isVideoAsset(path: string) {
  return /\/videos\//.test(path) || /\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(path);
}

type VoiceMediaProps = {
  alt: string;
  className: string;
  mode: 'card' | 'modal';
  src: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onClick?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
};

function VoiceMedia({
  alt,
  className,
  mode,
  src,
  videoRef,
  onClick,
  onPlay,
  onPause,
  onEnded,
}: VoiceMediaProps) {
  const embedUrl = youtubeEmbedUrl(src);

  if (embedUrl) {
    return (
      <iframe
        className={`${className} ${mode === 'card' ? 'pointer-events-none' : ''}`}
        src={`${embedUrl}?controls=0&rel=0&modestbranding=1`}
        title={alt}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isVideoAsset(src)) {
    return (
      <video
        ref={videoRef}
        className={className}
        src={src}
        autoPlay={false}
        controls={false}
        loop={mode === 'card'}
        muted
        playsInline
        preload="metadata"
        onClick={onClick}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />
    );
  }

  return <img className={className} src={src} alt={alt} />;
}

export default function CommunityVoices({
  maxItems = 5,
  voices = [],
  showFooterLink = true,
}: CommunityVoicesProps) {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = selectedVoice ? isVideoAsset(selectedVoice.image) : false;
  const displayedVoices = maxItems === null ? voices : voices.slice(0, maxItems);

  const showOverlay = !isVideo || isHovered || isPaused;

  useEffect(() => {
    if (!voices.length || !sectionRef.current) return;

    const section = sectionRef.current;

    const reveal = () => {
      section.setAttribute('data-revealed', 'true');
    };

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [voices.length]);

  useEffect(() => {
    if (!selectedVoice) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedVoice(null);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (!focusable.length) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();

      videoRef.current?.pause();
      videoRef.current = null;
    };
  }, [selectedVoice]);

  // Start each opened voice with its overlay visible and the video paused.
  const openVoice = (voice: Voice) => {
    setIsHovered(false);
    setIsPaused(true);
    setSelectedVoice(voice);
  };

  const closeModal = () => {
    setSelectedVoice(null);
  };

  const toggleVideo = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  if (!voices.length) return null;

  return (
    <>
      <section
        ref={sectionRef}
        id="community-voices"
        data-reveal
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none translate-y-7 bg-[var(--warm-white)] px-[max(48px,calc((100vw-1240px)/2+48px))] py-[124px] text-[var(--charcoal)] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:px-6 max-[980px]:py-[76px] max-[980px]:py-[78px] max-[680px]:px-4"
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 z-0 h-[340px] w-[380px] text-[var(--burgundy)] opacity-[0.45] max-[980px]:h-[220px] max-[980px]:w-[240px] max-[680px]:hidden"
          aria-hidden="true"
        >
          <defs>
            <pattern id="cv-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="3" fill="currentColor" />
            </pattern>
            <linearGradient id="cv-fade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="white" />
              <stop offset="0.85" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="cv-mask">
              <rect width="100%" height="100%" fill="url(#cv-fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#cv-dots)" mask="url(#cv-mask)" />
        </svg>
        <div className="mx-auto mb-10 max-w-[600px] text-center max-[680px]:mb-8">
          <h2 className="mb-3 text-[clamp(32px,3.5vw,44px)] font-bold leading-[1.25] text-black max-[680px]:text-[clamp(28px,9vw,34px)]">
            Community Voices
          </h2>

          <p className="m-0 text-base text-black">
            Hear from the students, parents, staff, and alumni who make MWS what it is.
          </p>
        </div>

        <div className="relative mb-[84px] before:pointer-events-none before:absolute before:-bottom-[52px] before:-left-[50px] before:h-[150px] before:w-screen before:bg-[var(--burgundy)] before:content-[''] max-[680px]:before:hidden">
          <div className="grid grid-cols-5 gap-0 max-[1180px]:grid-cols-4 max-[980px]:grid-cols-2 max-[680px]:grid-cols-1">
            {displayedVoices.map((voice) => (
              <article
                key={voice.id ?? voice.name}
                role="button"
                tabIndex={0}
                aria-label={`Baca cerita ${voice.name}, ${voice.role}`}
                className="group relative aspect-[9/16] cursor-pointer overflow-hidden max-[980px]:aspect-[4/5] max-[680px]:aspect-[16/12] max-[680px]:min-h-[260px] max-[430px]:min-h-60"
                onClick={() => openVoice(voice)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openVoice(voice);
                  }
                }}
              >
                <div className="relative h-full w-full overflow-hidden">
                  <VoiceMedia
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    src={voice.image}
                    alt={`${voice.role} Voice`}
                    mode="card"
                  />

                  <div className="absolute left-1/2 top-1/2 z-[2] flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 scale-[0.85] items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <Play
                      className="ml-0.5 h-[22px] w-[22px] fill-[var(--charcoal)] text-[var(--charcoal)]"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-[2] bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.65)_45%,rgba(0,0,0,0.9)_100%)] px-6 pb-6 pt-20 text-white">
                    <h3 className="m-0 text-[22px] font-bold leading-tight text-white">
                      {voice.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-[1.2] text-white">
                      {voice.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {showFooterLink && (
          <div className="mt-20 text-center">
            <Link
              to="/community-stories"
              className="inline-flex items-center gap-2 border-b border-[var(--gold)] pb-1.5 text-sm font-semibold text-black transition-colors duration-200"
            >
              Read all community stories <span>&rarr;</span>
            </Link>
          </div>
        )}
      </section>

      {selectedVoice && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedVoice.name} — ${selectedVoice.role}`}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0" aria-hidden="true" onClick={closeModal} />

          {/* Modal */}
          <div
            className="relative z-10 aspect-[9/16] h-[min(90vh,560px)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Close */}
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute -top-10 right-0 z-30 flex h-8 w-8 items-center justify-center text-white transition-opacity hover:opacity-70"
            >
              <X className="h-7 w-7" strokeWidth={1.8} />
            </button>

            {/* Media */}
            <div className="relative h-full w-full overflow-hidden">
              <VoiceMedia
                videoRef={videoRef}
                className="h-full w-full object-cover"
                src={selectedVoice.image}
                alt={`${selectedVoice.role} Voice`}
                mode="modal"
                onClick={isVideo ? toggleVideo : undefined}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                onEnded={() => setIsPaused(true)}
              />

              {/* Play / Pause */}
              {isVideo && (
                <button
                  type="button"
                  aria-label={isPaused ? 'Play video' : 'Pause video'}
                  onClick={toggleVideo}
                  className={`absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-all duration-200 hover:bg-black/75 ${
                    isPaused || isHovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                  }`}
                >
                  {isPaused ? (
                    <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden="true" />
                  ) : (
                    <Pause className="h-6 w-6 fill-current" aria-hidden="true" />
                  )}
                </button>
              )}

              {/* Info overlay */}
              <div
                className={`absolute inset-x-0 bottom-0 z-10 overflow-hidden bg-gradient-to-t from-black/90 via-black/65 to-transparent px-5 pb-5 pt-16 text-white transition-transform duration-300 ${
                  showOverlay ? 'translate-y-0' : 'translate-y-full'
                }`}
              >
                <p className="m-0 text-lg font-semibold">{selectedVoice.name}</p>

                <p className="mt-0.5 text-xs text-white/70">{selectedVoice.grade ?? 'Unit'}</p>

                <p className="mt-3 text-sm leading-5 text-white/90">{selectedVoice.quote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
