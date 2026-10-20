import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Home, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicVirtualTour, PublicVirtualTourNode } from '@/api/virtualTourApi';
import { useNavigate } from 'react-router-dom';
import { useVirtualTourList } from '@/features/virtual-tour/hooks/useVirtualTours';

type VirtualTourNavigationProps = {
  tour: PublicVirtualTour;
  activeSceneId: string;
  onSceneSelect: (sceneId: string) => void;
};

export default function VirtualTourNavigation({
  tour,
  activeSceneId,
  onSceneSelect,
}: VirtualTourNavigationProps) {
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);
  const [scenePanelOpen, setScenePanelOpen] = useState(true);
  const navigate = useNavigate();
  const tourList = useVirtualTourList();
  const [tourMenuOpen, setTourMenuOpen] = useState(false);

  const activeScene = useMemo(
    () => tour.nodes.find((node) => node.id === activeSceneId) ?? tour.nodes[0],
    [tour.nodes, activeSceneId],
  );

  const connectedScenes = useMemo(() => {
    if (!activeScene) return [];

    const linkedIds = new Set(activeScene.links.map((link) => link.nodeId));

    return tour.nodes.filter((node) => node.id === activeScene.id || linkedIds.has(node.id));
  }, [activeScene, tour.nodes]);

  function selectScene(scene: PublicVirtualTourNode) {
    onSceneSelect(scene.id);
    setAreaMenuOpen(false);
  }

  if (!activeScene) return null;

  return (
    <>
      {/* Top-right navigation */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-6 sm:top-6">
        <Link
          to="/"
          aria-label="Back to home"
          title="Back to home"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80"
        >
          <Home size={19} aria-hidden="true" />
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-expanded={tourMenuOpen}
            onClick={() => setTourMenuOpen((open) => !open)}
            className="flex h-11 max-w-[min(65vw,260px)] items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/80"
          >
            <MapPin size={17} aria-hidden="true" />
            <span className="truncate">{tour.title}</span>
            <ChevronDown
              size={16}
              className={tourMenuOpen ? 'rotate-180' : ''}
              aria-hidden="true"
            />
          </button>

          {tourMenuOpen && (
            <div className="absolute right-0 mt-2 max-h-80 w-64 max-w-[85vw] overflow-y-auto rounded-xl border border-white/10 bg-[#241718]/95 p-2 text-white shadow-2xl backdrop-blur-xl">
              {tourList.tours.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTourMenuOpen(false);
                    navigate(`/virtual-tour?tour=${encodeURIComponent(item.slug)}`);
                  }}
                  className={`block w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                    item.slug === tour.slug
                      ? 'bg-white/15 font-semibold text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="block">{item.title}</span>
                  {item.description && (
                    <span className="mt-1 line-clamp-2 block text-xs text-white/50">
                      {item.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom scene navigator */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-5 sm:pb-7">
        <div className="flex max-w-full flex-col items-center">
          <button
            type="button"
            aria-expanded={scenePanelOpen}
            aria-label={scenePanelOpen ? 'Hide scene navigator' : 'Show scene navigator'}
            onClick={() => setScenePanelOpen((open) => !open)}
            className="mb-2 flex h-8 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {scenePanelOpen ? (
              <ChevronDown size={17} aria-hidden="true" />
            ) : (
              <ChevronUp size={17} aria-hidden="true" />
            )}
          </button>

          {scenePanelOpen ? (
            <div className="flex max-w-full items-center gap-2 rounded-2xl border border-white/15 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                aria-label="Scroll scenes left"
                onClick={(event) => {
                  event.currentTarget.parentElement
                    ?.querySelector('[data-scene-list]')
                    ?.scrollBy({ left: -220, behavior: 'smooth' });
                }}
                className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>

              <div
                data-scene-list
                className="flex max-w-[min(68vw,720px)] gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {tour.nodes.map((scene, index) => {
                  const selected = scene.id === activeScene.id;

                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => selectScene(scene)}
                      aria-label={`Open scene ${scene.name || scene.caption}`}
                      aria-current={selected ? 'location' : undefined}
                      title={scene.name || scene.caption}
                      className={`group relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition sm:h-14 sm:w-20 ${
                        selected
                          ? 'border-[#D6A13A] ring-1 ring-[#D6A13A]'
                          : 'border-white/20 opacity-75 hover:border-white/60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={scene.thumbnail || scene.panorama}
                        alt=""
                        loading={index > 5 ? 'lazy' : 'eager'}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-1 py-1 text-[9px] font-semibold text-white sm:text-[10px]">
                        {scene.name || scene.caption}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-label="Scroll scenes right"
                onClick={(event) => {
                  event.currentTarget.parentElement
                    ?.querySelector('[data-scene-list]')
                    ?.scrollBy({ left: 220, behavior: 'smooth' });
                }}
                className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
