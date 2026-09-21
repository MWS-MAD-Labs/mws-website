import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { communityVoices } from "../../data/site";

export type Voice = {
  id?: string;
  role: string;
  name: string;
  grade: string | null;
  image: string;
  quote: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type CommunityVoicesProps = {
  voices?: Voice[];
  showFooterLink?: boolean;
};

const defaultVoices: Voice[] = communityVoices;

export default function CommunityVoices({
  voices = defaultVoices,
  showFooterLink = true,
}: CommunityVoicesProps) {
  const items = voices.length ? voices : defaultVoices;
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedVoice) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedVoice(null);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

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

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [selectedVoice]);

  return (
    <>
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none translate-y-7 bg-[var(--warm-white)] px-[max(48px,calc((100vw-1240px)/2+48px))] py-[124px] text-[var(--charcoal)] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:px-6 max-[980px]:py-[78px] max-[680px]:px-4 max-[680px]:py-[62px]"
        id="community-voices"
        data-reveal
      >
        <div className="mx-auto mb-10 max-w-[600px] text-center max-[680px]:mb-8">
          <h2 className="mb-3 text-[clamp(32px,3.5vw,44px)] font-bold leading-[1.25] tracking-normal text-black max-[680px]:text-[clamp(28px,9vw,34px)]">
            Community Voices
          </h2>
          <p className="m-0 text-base text-black">
            Augue vel ea in arcu aliquip vitae curae quis praesent augue esse.
          </p>
        </div>

        <div className="mb-9 grid grid-cols-4 gap-5 max-[980px]:grid-cols-2 max-[680px]:grid-cols-1">
          {items.map((voice) => (
            <article
              key={voice.id ?? voice.name}
              role="button"
              tabIndex={0}
              aria-label={`Baca cerita ${voice.name}, ${voice.role}`}
              className="group relative aspect-[9/16] cursor-pointer overflow-hidden max-[980px]:aspect-[4/5] max-[680px]:aspect-[16/12] max-[680px]:min-h-[260px] max-[430px]:min-h-60"
              onClick={() => setSelectedVoice(voice)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedVoice(voice);
                }
              }}
            >
              <div className="relative h-full w-full">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  src={voice.image}
                  alt={`${voice.role} Voice`}
                />
                <div className="absolute left-1/2 top-1/2 z-[2] flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 scale-[0.85] items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <svg
                    className="ml-0.5 h-[22px] w-[22px] fill-[var(--charcoal)]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 z-[2] bg-[linear-gradient(180deg,transparent_0%,rgba(36,23,24,0.85)_100%)] p-5 text-[var(--white)]">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--gold)]">
                  {voice.role}
                </span>
                <h3 className="m-0 text-lg font-semibold text-[var(--warm-white)]">{voice.name}</h3>
              </div>
            </article>
          ))}
        </div>

        {showFooterLink && (
          <div className="mt-6 text-center">
            <Link
              to="/community-stories"
              className="inline-flex items-center gap-2 border-b border-[var(--gold)] pb-1.5 text-sm font-semibold text-black transition-colors duration-200"
            >
              Read all community stories <span>&rarr;</span>
            </Link>
          </div>
        )}
      </section>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={
          selectedVoice ? `${selectedVoice.name} — ${selectedVoice.role}` : 'Community voice'
        }
        className={`fixed inset-0 z-[9999] flex items-center justify-center px-6 py-8 transition-opacity duration-300 max-[680px]:px-3 max-[680px]:py-3 ${
          selectedVoice ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!selectedVoice}
        inert={!selectedVoice}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[rgba(36,23,24,0.76)] backdrop-blur-md"
          onClick={() => setSelectedVoice(null)}
        />

        {/* Modal */}
        <div
          className={`relative z-[2] flex max-h-[calc(100dvh-64px)] w-full max-w-[1100px] overflow-hidden bg-[var(--warm-white)] shadow-[0_30px_100px_rgba(36,23,24,0.35)] transition-all duration-300 ${
            selectedVoice
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-5 scale-[0.97] opacity-0'
          } max-[768px]:max-h-[calc(100dvh-24px)] max-[768px]:flex-col`}
        >
          {/* Close */}
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close modal"
            onClick={() => setSelectedVoice(null)}
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center border border-black/10 bg-white/90 text-xl leading-none text-[var(--charcoal)] backdrop-blur-sm transition-colors duration-200 hover:bg-[var(--charcoal)] hover:text-white max-[680px]:right-3 max-[680px]:top-3"
          >
            &times;
          </button>

          {/* Image — 9:16 */}
          <div className="relative aspect-[9/16] h-[min(82vh,720px)] shrink-0 bg-[var(--charcoal)] max-[768px]:aspect-[9/16] max-[768px]:h-auto max-[768px]:max-h-[55vh] max-[768px]:w-full">
            {selectedVoice && (
              <img
                className="h-full w-full object-cover"
                src={selectedVoice.image}
                alt={`${selectedVoice.role} Voice`}
              />
            )}

            <div className="absolute inset-0 bg-[rgba(36,23,24,0.08)]" />
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-center px-14 py-14 max-[900px]:px-10 max-[768px]:px-8 max-[768px]:py-10 max-[520px]:px-6 max-[520px]:py-8">
            {/* Quote */}
            <blockquote className="m-0 max-w-[600px] text-[clamp(22px,2.3vw,32px)] font-[var(--f-voice)] italic leading-[1.45] text-[var(--charcoal)]">
              {selectedVoice ? `"${selectedVoice.quote}"` : '"Quote text goes here..."'}
            </blockquote>

            {/* Name + Unit */}
            <div className="mt-10 border-t border-[var(--border)] pt-5">
              <h3 className="m-0 text-lg font-semibold text-[var(--charcoal)]">
                {selectedVoice?.name ?? 'Author Name'}
              </h3>

              <p className="mt-1 text-sm text-[var(--charcoal-muted)]">
                {selectedVoice?.grade ?? 'Unit'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
