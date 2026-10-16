import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, ChevronDown, Map, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import VirtualTourViewer from '@/features/virtual-tour/components/VirtualTourViewer';
import { useVirtualTour, useVirtualTourList } from '@/features/virtual-tour/hooks/useVirtualTours';

function LoadingStage() {
  return (
    <div
      className="flex h-full min-h-[480px] items-center justify-center bg-[#1a1212] px-6 text-center text-white"
      role="status"
    >
      <div>
        <RefreshCw
          className="mx-auto animate-spin text-[var(--gold-light)] motion-reduce:animate-none"
          size={30}
          aria-hidden="true"
        />
        <p className="mb-0 mt-4 text-sm font-semibold">Preparing your virtual tour...</p>
      </div>
    </div>
  );
}

type MessageStageProps = {
  description: string;
  onRetry?: () => void;
  title: string;
};

function MessageStage({ description, onRetry, title }: MessageStageProps) {
  return (
    <div className="flex h-full min-h-[480px] items-center justify-center bg-[var(--warm-white)] px-6 text-center">
      <div className="max-w-lg">
        <Map className="mx-auto text-[var(--burgundy)]" size={36} aria-hidden="true" />
        <h2 className="mb-0 mt-5 text-2xl font-[var(--f-head)] font-bold text-[var(--charcoal)]">
          {title}
        </h2>
        <p className="mb-0 mt-3 text-base text-[var(--charcoal-muted)]">{description}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex min-h-11 items-center gap-2 border border-[var(--burgundy)] px-5 py-2.5 text-sm font-bold text-[var(--burgundy)] transition-colors hover:bg-[var(--burgundy)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--burgundy)]"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function VirtualTourPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestedSceneId, setRequestedSceneId] = useState<string | null>(null);
  const tourList = useVirtualTourList();
  const requestedSlug = searchParams.get('tour');

  const activeSlug = useMemo(() => {
    if (requestedSlug && tourList.tours.some((tour) => tour.slug === requestedSlug)) {
      return requestedSlug;
    }
    return tourList.tours[0]?.slug ?? null;
  }, [requestedSlug, tourList.tours]);

  const tourDetail = useVirtualTour(activeSlug);
  const activeSceneId = useMemo(() => {
    const tour = tourDetail.tour;
    if (!tour) return '';
    return tour.nodes.some((node) => node.id === requestedSceneId)
      ? requestedSceneId!
      : tour.startNodeId;
  }, [requestedSceneId, tourDetail.tour]);

  useEffect(() => {
    if (!activeSlug || requestedSlug === activeSlug) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tour', activeSlug);
    setSearchParams(nextParams, { replace: true });
  }, [activeSlug, requestedSlug, searchParams, setSearchParams]);

  const selectTour = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tour', slug);
    setRequestedSceneId(null);
    setSearchParams(nextParams);
  };

  const selectScene = useCallback((sceneId: string) => {
    setRequestedSceneId(sceneId);
  }, []);

  const isLoading =
    tourList.status === 'loading' ||
    (Boolean(activeSlug) && (tourDetail.status === 'idle' || tourDetail.status === 'loading'));
  const pageDescription =
    tourDetail.tour?.description ??
    'Step inside Millennia World School and explore our learning spaces.';

  return (
    <main className="bg-white">
      <header className="border-b border-[var(--border)] bg-white px-5 py-5 md:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-stretch">
          <div className="min-w-0">
            <h1 className="m-0 text-[clamp(26px,3vw,38px)] font-[var(--f-head)] font-bold leading-tight text-[var(--charcoal)]">
              Virtual Tour
            </h1>
            <p className="mb-0 mt-1 max-w-2xl truncate text-sm text-[var(--charcoal-muted)] max-[760px]:whitespace-normal">
              {pageDescription}
            </p>
          </div>

          {tourList.tours.length ? (
            <div className="grid shrink-0 grid-cols-2 gap-3 max-[560px]:grid-cols-1 md:min-w-[520px]">
              <label className="relative block min-w-0">
                <span className="sr-only">Choose a building or tour</span>
                <Building2
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--burgundy)]"
                  size={18}
                  aria-hidden="true"
                />
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal-muted)]"
                  size={16}
                  aria-hidden="true"
                />
                <select
                  aria-label="Choose a building or tour"
                  value={activeSlug ?? ''}
                  onChange={(event) => selectTour(event.target.value)}
                  className="h-12 w-full appearance-none border border-[var(--border)] bg-white py-2 pl-10 pr-8 text-sm font-bold text-[var(--charcoal)] outline-none transition-colors focus:border-[var(--burgundy)]"
                >
                  {tourList.tours.map((tour) => (
                    <option key={tour.id} value={tour.slug}>
                      {tour.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative block min-w-0">
                <span className="sr-only">Choose a scene</span>
                <Map
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--burgundy)]"
                  size={18}
                  aria-hidden="true"
                />
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal-muted)]"
                  size={16}
                  aria-hidden="true"
                />
                <select
                  aria-label="Choose a scene"
                  value={activeSceneId}
                  disabled={!tourDetail.tour}
                  onChange={(event) => selectScene(event.target.value)}
                  className="h-12 w-full appearance-none border border-[var(--border)] bg-white py-2 pl-10 pr-8 text-sm font-bold text-[var(--charcoal)] outline-none transition-colors focus:border-[var(--burgundy)] disabled:cursor-wait disabled:bg-[var(--warm-white)] disabled:text-[var(--charcoal-muted)]"
                >
                  {tourDetail.tour?.nodes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      </header>

      <section
        aria-label="Interactive school panorama"
        className="h-[calc(100dvh-var(--navbar-height,88px)-116px)] min-h-[560px] max-[760px]:h-[70dvh] max-[760px]:min-h-[480px]"
      >
        {isLoading ? <LoadingStage /> : null}

        {!isLoading && tourList.status === 'error' ? (
          <MessageStage
            title="Virtual tour could not be loaded"
            description={tourList.error ?? 'Please check your connection and try again.'}
            onRetry={tourList.retry}
          />
        ) : null}

        {!isLoading && tourList.status === 'success' && tourList.tours.length === 0 ? (
          <MessageStage
            title="Virtual tour is coming soon"
            description="Our school spaces are being prepared for you. Please check back again soon."
          />
        ) : null}

        {!isLoading && tourDetail.status === 'error' ? (
          <MessageStage
            title="This tour could not be opened"
            description={tourDetail.error ?? 'Please try loading this tour again.'}
            onRetry={tourDetail.retry}
          />
        ) : null}

        {!isLoading && tourDetail.tour && activeSceneId ? (
          <VirtualTourViewer
            key={tourDetail.tour.id}
            tour={tourDetail.tour}
            activeSceneId={activeSceneId}
            onSceneChange={selectScene}
          />
        ) : null}
      </section>
    </main>
  );
}
