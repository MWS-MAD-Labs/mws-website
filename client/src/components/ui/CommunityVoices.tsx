import { useState } from "react";
import { Link } from "react-router-dom";
import { communityVoices } from "../../data/site";

type Voice = (typeof communityVoices)[number];

export default function CommunityVoices({ showFooterLink = true }) {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  return (
    <>
      <section
        className="relative left-1/2 right-1/2 w-screen max-w-none -ml-[50vw] -mr-[50vw] translate-y-7 bg-[var(--charcoal)] px-[max(48px,calc((100vw-1240px)/2+48px))] py-[124px] text-[rgba(248,247,243,0.76)] opacity-0 transition-[opacity,transform] duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none max-[980px]:px-6 max-[980px]:py-[78px] max-[680px]:px-4 max-[680px]:py-[62px]"
        id="community-voices"
        data-reveal
      >
        <div className="mx-auto mb-10 max-w-[600px] text-center max-[680px]:mb-8">
          <h2 className="mb-3 text-[clamp(32px,3.5vw,44px)] font-semibold leading-[1.25] tracking-normal text-[var(--warm-white)] max-[680px]:text-[clamp(28px,9vw,34px)]">
            Voices of our community.
          </h2>
          <p className="m-0 text-base text-[rgba(248,247,243,0.62)]">
            Augue vel ea in arcu aliquip vitae curae quis praesent augue esse.
          </p>
        </div>

        <div className="mb-9 grid grid-cols-4 gap-5 max-[980px]:grid-cols-2 max-[680px]:grid-cols-1">
          {communityVoices.map((voice) => (
            <article
              key={voice.name}
              className="group relative aspect-[9/14] cursor-pointer overflow-hidden border border-[rgba(248,247,243,0.12)] bg-[var(--charcoal)] max-[980px]:aspect-[4/5] max-[680px]:aspect-[16/12] max-[680px]:min-h-[260px] max-[430px]:min-h-60"
              onClick={() => setSelectedVoice(voice)}
            >
              <div className="relative h-full w-full">
                <img
                  className="h-full w-full object-cover transition-[transform,filter] duration-500 ease-in-out group-hover:scale-105 group-hover:blur-[4px] group-hover:brightness-[0.7]"
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
                <h3 className="m-0 text-lg font-semibold text-[var(--warm-white)]">
                  {voice.name}
                </h3>
              </div>
            </article>
          ))}
        </div>

        {showFooterLink && (
          <div className="mt-6 text-center">
            <Link
              to="/community-stories"
              className="inline-flex items-center gap-2 border-b border-[var(--gold)] pb-1.5 text-sm font-semibold text-[var(--warm-white)] transition-colors duration-200 hover:text-[var(--gold)]"
            >
              Read all community stories <span>&rarr;</span>
            </Link>
          </div>
        )}
      </section>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center opacity-0 transition-opacity duration-300 ${
          selectedVoice ? "pointer-events-auto opacity-100" : "pointer-events-none"
        }`}
        aria-hidden={!selectedVoice}
      >
        <div
          className="absolute inset-0 bg-[rgba(36,23,24,0.85)] backdrop-blur-lg"
          onClick={() => setSelectedVoice(null)}
        />
        <div className="relative z-[2] max-h-[85vh] w-[90%] max-w-[860px] overflow-hidden rounded-2xl bg-[var(--white)] shadow-[0_24px_48px_rgba(36,23,24,0.3)] max-[680px]:max-h-[calc(100dvh-24px)] max-[680px]:w-[min(100%_-_24px,860px)] max-[680px]:overflow-y-auto">
          <button
            className="absolute right-5 top-4 z-10 cursor-pointer border-0 bg-transparent text-[32px] leading-none text-[var(--charcoal)]"
            type="button"
            aria-label="Close modal"
            onClick={() => setSelectedVoice(null)}
          >
            &times;
          </button>

          <div className="flex h-full max-h-[85vh] max-[768px]:max-h-none max-[768px]:flex-col max-[768px]:overflow-y-auto">
            <div className="flex aspect-[9/16] basis-[40%] items-center justify-center bg-[var(--charcoal)] max-[768px]:h-80 max-[768px]:w-full max-[768px]:basis-auto">
              {selectedVoice && (
                <img
                  className="h-full w-full object-cover"
                  src={selectedVoice.image}
                  alt=""
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center bg-[var(--warm-white)] px-10 py-12 max-[768px]:p-6">
              <span className="mb-4 text-xs font-bold uppercase tracking-[1.5px] text-[var(--burgundy)]">
                {selectedVoice?.role ?? "Role"}
              </span>
              <blockquote className="m-0 mb-7 font-[var(--f-voice)] text-[clamp(18px,1.8vw,22px)] italic leading-[1.45] text-[var(--charcoal)]">
                {selectedVoice
                  ? `"${selectedVoice.quote}"`
                  : '"Quote text goes here..."'}
              </blockquote>
              <div>
                <h4 className="m-0 mb-1 text-lg font-semibold text-[var(--charcoal)]">
                  {selectedVoice?.name ?? "Author Name"}
                </h4>
                <p className="m-0 text-sm text-[var(--charcoal-muted)]">
                  {selectedVoice?.grade ?? "Sub-info / Grade"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
