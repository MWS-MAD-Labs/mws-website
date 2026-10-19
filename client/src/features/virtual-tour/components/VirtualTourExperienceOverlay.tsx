
import { Compass, Home, Info, Map, Move3d, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { PublicVirtualTour, PublicVirtualTourSummary } from '@/api/virtualTourApi';

type VirtualTourExperienceOverlayProps = {
  activeSceneId: string;
  activeTourSlug: string;
  onSceneSelect: (sceneId: string) => void;
  onTourSelect: (slug: string) => void;
  tour: PublicVirtualTour;
  tours: PublicVirtualTourSummary[];
};

export default function VirtualTourExperienceOverlay({
  activeSceneId,
  activeTourSlug,
  onSceneSelect,
  onTourSelect,
  tour,
  tours,
}: VirtualTourExperienceOverlayProps) {
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  const activeScene =
    tour.nodes.find((scene) => scene.id === activeSceneId) ?? null;

  function selectTour(slug: string) {
    onTourSelect(slug);
    setIsExploreOpen(false);
  }

  function selectScene(sceneId: string) {
    onSceneSelect(sceneId);
    setIsExploreOpen(false);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-white">
      {/* Tour information */}
      <div className="pointer-events-auto absolute left-4 top-4 max-w-[min(30rem,calc(100%-7rem))] rounded-xl border border-white/15 bg-black/45 px-4 py-3 shadow-xl backdrop-blur-md sm:left-6 sm:top-6 sm:px-5">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
          Virtual Tour
        </p>

        <h1 className="mb-0 mt-1 font-[var(--f-head)] text-xl font-bold leading-tight sm:text-2xl">
          {tour.title}
        </h1>

        <p className="mb-0 mt-1 line-clamp-2 text-sm text-white/75">
          {activeScene?.name ??
            tour.description ??
            'Explore our learning spaces.'}
        </p>
      </div>

      {/* Top-right actions */}
      <div className="pointer-events-auto absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
        {/* Back to homepage */}
        <Link
          to="/"
          aria-label="Back to home"
          title="Back to home"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Home size={18} aria-hidden="true" />
        </Link>

        {/* How to explore */}
        <OverlayButton
          label="How to explore"
          onClick={() => setIsGuideOpen(true)}
        >
          <Info size={18} aria-hidden="true" />
        </OverlayButton>

        {/* Explore locations */}
        <OverlayButton
          label="Explore locations"
          onClick={() => setIsExploreOpen(true)}
        >
          <Map size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Explore</span>
        </OverlayButton>
      </div>

      {/* Navigation hint */}
      <div className="pointer-events-auto absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-medium text-white/85 shadow-lg backdrop-blur-md sm:flex">
        <Compass size={16} className="text-[var(--gold-light)]" />
        Drag to look around · Select an arrow to move to another space
      </div>

      {/* Welcome guide */}
      {isGuideOpen ? (
        <div className="pointer-events-auto absolute inset-0 z-30 grid place-items-center bg-black/45 p-5 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#1a1212]/90 p-7 text-center shadow-2xl sm:p-9">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--gold)] text-[var(--charcoal)]">
              <Move3d size={24} aria-hidden="true" />
            </span>

            <p className="mb-0 mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold-light)]">
              Welcome to
            </p>

            <h2 className="mb-0 mt-2 font-[var(--f-head)] text-3xl font-bold">
              {tour.title}
            </h2>

            <p className="mb-0 mt-4 text-sm leading-6 text-white/75">
              Drag the panorama to look around. Select the navigation arrows
              to move between spaces.
            </p>

            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="mt-6 inline-flex min-h-11 items-center justify-center bg-[var(--gold)] px-5 py-2.5 text-sm font-bold text-[var(--charcoal)] transition-colors hover:bg-[var(--gold-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Start exploring
            </button>
          </div>
        </div>
      ) : null}

      {/* Explore locations drawer */}
      {isExploreOpen ? (
        <div
          className="pointer-events-auto absolute inset-0 z-20 bg-black/45"
          onClick={() => setIsExploreOpen(false)}
        >
          <aside
            aria-label="Explore locations"
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white text-[var(--charcoal)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-5 sm:px-6">
              <div>
                <p className="mb-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--burgundy)]">
                  Explore locations
                </p>

                <h2 className="mb-0 mt-1 font-[var(--f-head)] text-2xl font-bold">
                  {tour.title}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close locations"
                onClick={() => setIsExploreOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center text-[var(--charcoal-muted)] transition-colors hover:bg-black/5 hover:text-[var(--charcoal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--burgundy)]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Available tours */}
              {tours.length > 1 ? (
                <section className="mb-7">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[var(--charcoal-muted)]">
                    Tours
                  </h3>

                  <div className="grid gap-2">
                    {tours.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectTour(item.slug)}
                        className={`flex w-full items-center justify-between border px-4 py-3 text-left text-sm font-bold transition-colors ${
                          item.slug === activeTourSlug
                            ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-white'
                            : 'border-black/10 bg-white hover:border-[var(--burgundy)]'
                        }`}
                      >
                        <span>{item.title}</span>
                        <span aria-hidden="true">→</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Available scenes */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[var(--charcoal-muted)]">
                  Spaces
                </h3>

                <div className="grid gap-3">
                  {tour.nodes.map((scene) => {
                    const isActive = scene.id === activeSceneId;

                    return (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => selectScene(scene.id)}
                        aria-current={isActive ? 'location' : undefined}
                        className={`group grid grid-cols-[108px_minmax(0,1fr)] overflow-hidden border text-left transition-colors ${
                          isActive
                            ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-white'
                            : 'border-black/10 bg-white hover:border-[var(--burgundy)]'
                        }`}
                      >
                        <img
                          src={scene.thumbnail}
                          alt=""
                          className="h-full min-h-20 w-full object-cover"
                          loading="lazy"
                        />

                        <span className="flex min-w-0 flex-col justify-center px-4 py-3">
                          <strong className="truncate text-sm">
                            {scene.name}
                          </strong>

                          <span
                            className={`mt-1 text-xs ${
                              isActive
                                ? 'text-white/70'
                                : 'text-[var(--charcoal-muted)]'
                            }`}
                          >
                            {isActive ? 'You are here' : 'Open this space'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

type OverlayButtonProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
};

function OverlayButton({
  children,
  label,
  onClick,
}: OverlayButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4"
    >
      {children}
    </button>
  );
}

