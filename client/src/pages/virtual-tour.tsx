import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home, Map, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import VirtualTourViewer from '@/features/virtual-tour/components/VirtualTourViewer';
import {
  useVirtualTour,
  useVirtualTourList,
} from '@/features/virtual-tour/hooks/useVirtualTours';

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
        <p className="mb-0 mt-4 text-sm font-semibold">
          Preparing your virtual tour...
        </p>
      </div>
    </div>
  );
}

type MessageStageProps = {
  description: string;
  onRetry?: () => void;
  title: string;
};

function MessageStage({
  description,
  onRetry,
  title,
}: MessageStageProps) {
  return (
    <div className="flex h-full min-h-[480px] items-center justify-center bg-[var(--warm-white)] px-6 text-center">
      <div className="max-w-lg">
        <Map
          className="mx-auto text-[var(--burgundy)]"
          size={36}
          aria-hidden="true"
        />

        <h2 className="mb-0 mt-5 text-2xl font-[var(--f-head)] font-bold text-[var(--charcoal)]">
          {title}
        </h2>

        <p className="mb-0 mt-3 text-base text-[var(--charcoal-muted)]">
          {description}
        </p>

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
    if (
      requestedSlug &&
      tourList.tours.some((tour) => tour.slug === requestedSlug)
    ) {
      return requestedSlug;
    }

    return tourList.tours[0]?.slug ?? null;
  }, [requestedSlug, tourList.tours]);

  const tourDetail = useVirtualTour(activeSlug);

  const activeSceneId = useMemo(() => {
    const tour = tourDetail.tour;

    if (!tour) return '';

    const requestedScene = tour.nodes.find(
      (node) => node.id === requestedSceneId,
    );

    return requestedScene?.id ?? tour.startNodeId;
  }, [requestedSceneId, tourDetail.tour]);

  useEffect(() => {
    if (!activeSlug || requestedSlug === activeSlug) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tour', activeSlug);

    setSearchParams(nextParams, { replace: true });
  }, [activeSlug, requestedSlug, searchParams, setSearchParams]);

  const selectScene = useCallback((sceneId: string) => {
    setRequestedSceneId(sceneId);
  }, []);

  const isLoading =
    tourList.status === 'loading' ||
    (Boolean(activeSlug) &&
      (tourDetail.status === 'idle' || tourDetail.status === 'loading'));

  return (
    <main className="fixed inset-0 z-[9999] h-[100svh] w-full overflow-hidden bg-[#1a1212]">
      <section
        aria-label="Interactive school panorama"
        className="relative h-full w-full"
      >
        {/* Virtual tour content */}
        {isLoading ? <LoadingStage /> : null}

        {!isLoading && tourList.status === 'error' ? (
          <MessageStage
            title="Virtual tour could not be loaded"
            description={
              tourList.error ?? 'Please check your connection and try again.'
            }
            onRetry={tourList.retry}
          />
        ) : null}

        {!isLoading &&
        tourList.status === 'success' &&
        tourList.tours.length === 0 ? (
          <MessageStage
            title="Virtual tour is coming soon"
            description="Our school spaces are being prepared for you. Please check back again soon."
          />
        ) : null}

        {!isLoading && tourDetail.status === 'error' ? (
          <MessageStage
            title="This tour could not be opened"
            description={
              tourDetail.error ?? 'Please try loading this tour again.'
            }
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

        {/* Back to homepage */}
        <Link
          to="/"
          aria-label="Back to home"
          title="Back to home"
          className="absolute right-4 top-4 z-[10000] inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
        >
          <Home size={20} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
};
