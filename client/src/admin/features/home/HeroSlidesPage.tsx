import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, LayoutList, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import { useToastState } from '@/admin/components/ui/toastContext';
import NewsMessageBanner from '@/admin/features/news/components/layouts/NewsMessageBanner';
import type { ResolvedHeroSlide } from '@/features/hero/heroData';
import HeaderHero from './components/layouts/HeaderHero';
import {
  HERO_SLIDE_NEW_PATH,
  HOME_INFO_SECTION_PATH,
  getHeroCtaLinkLabel,
  getHeroSlideEditPath,
  type HeroSlidesReturnState,
} from './heroSlideForm';

const headerCellClass =
  'px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]';

function slideLabel(slide: ResolvedHeroSlide) {
  return slide.title || 'Untitled home slide';
}

function HeroMediaThumbnail({ slide }: { slide: ResolvedHeroSlide }) {
  const mediaUrl = slide.mediaPath ? adminApi.publicAssetUrl(slide.mediaPath) : '';

  return (
    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9]">
      {mediaUrl ? (
        slide.mediaType === 'VIDEO' ? (
          <>
            <video className="h-full w-full object-cover" src={mediaUrl} muted playsInline />
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Video
            </span>
          </>
        ) : (
          <img
            className="h-full w-full object-cover"
            src={mediaUrl}
            alt={slide.mediaAlt || slideLabel(slide)}
          />
        )
      ) : (
        <div className="grid h-full place-items-center text-[#64748B]">
          <ImagePlus size={18} />
        </div>
      )}
    </div>
  );
}

function HeroStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        'inline-flex rounded-md px-2 py-1 text-[11px] font-semibold',
        isActive ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F1F5F9] text-[#64748B]',
      ].join(' ')}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

function HeroRowActions({
  deletingId,
  iconSize = 15,
  slide,
  onDelete,
}: {
  deletingId: string | null;
  iconSize?: number;
  slide: ResolvedHeroSlide;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1.5">
      <Link
        to={getHeroSlideEditPath(slide.id)}
        aria-label={`Edit ${slideLabel(slide)}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#3C50E0]/30 hover:bg-[#3C50E0]/5 hover:text-[#3C50E0]"
      >
        <Pencil size={iconSize} />
      </Link>

      <Button
        aria-label={`Delete ${slideLabel(slide)}`}
        className="rounded-md"
        disabled={deletingId === slide.id}
        iconOnly
        size="sm"
        type="button"
        variant="danger"
        onClick={onDelete}
      >
        <Trash2 size={iconSize} />
      </Button>
    </div>
  );
}

export default function HeroSlidesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [slides, setSlides] = useState<ResolvedHeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useToastState<string | null>(null);

  const loadSlides = useCallback(async () => {
    setSlides(await adminApi.heroSlides());
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadSlides()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load hero slides.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, [loadSlides, setMessage]);

  // Show the message passed back from the create/edit page, then clear it so a
  // refresh does not show it again.
  useEffect(() => {
    const returnMessage = (location.state as HeroSlidesReturnState)?.message;
    if (!returnMessage) return;

    setMessage(returnMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, setMessage]);

  async function deleteSlide(slide: ResolvedHeroSlide) {
    const confirmed = window.confirm(
      `Delete "${slide.title || 'this home hero slide'}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(slide.id);
    setMessage(null);

    try {
      await adminApi.deleteHeroSlide(slide.id);
      await loadSlides();
      setMessage('Home hero slide deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete hero slide.');
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = slides.filter((slide) => slide.isActive).length;

  return (
    <AppShell title="Home Hero">
      <section className="space-y-5 p-6">
        <HeaderHero
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                className="inline-flex items-center gap-2"
                type="button"
                variant="outline"
                onClick={() => navigate(HOME_INFO_SECTION_PATH)}
              >
                <LayoutList size={16} />
                Info Section
              </Button>

              <Button
                className="inline-flex items-center gap-2"
                type="button"
                onClick={() => navigate(HERO_SLIDE_NEW_PATH)}
              >
                <Plus size={16} />
                Create Slide
              </Button>
            </div>
          }
        />

        <NewsMessageBanner message={message} />

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1C2434]">Hero slides</h2>

              <p className="mt-0.5 text-sm text-[#64748B]">
                {slides.length} {slides.length === 1 ? 'slide' : 'slides'} · {activeCount} active
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-[#64748B]">Loading hero slides...</div>
          ) : !slides.length ? (
            <div className="p-10 text-center">
              <p className="font-medium text-[#1C2434]">No hero slides yet.</p>
              <p className="mt-1 text-sm text-[#64748B]">
                Create a slide to show it in the homepage hero carousel.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#E2E8F0] lg:hidden">
                {slides.map((slide) => (
                  <article className="p-4" key={slide.id}>
                    <div className="flex min-w-0 gap-3">
                      <HeroMediaThumbnail slide={slide} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate text-sm font-semibold text-[#1C2434]">
                            {slideLabel(slide)}
                          </h3>

                          <HeroRowActions
                            deletingId={deletingId}
                            iconSize={14}
                            slide={slide}
                            onDelete={() => void deleteSlide(slide)}
                          />
                        </div>

                        {slide.caption ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[#64748B]">
                            {slide.caption}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                          <HeroStatusBadge isActive={slide.isActive} />
                          <span>{slide.ctaLabel || 'Learn More'}</span>
                          <span>•</span>
                          <span className="truncate">{getHeroCtaLinkLabel(slide.ctaUrl)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[960px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] text-left">
                      <th className={headerCellClass}>Hero Image or Video</th>
                      <th className={headerCellClass}>Headline</th>
                      <th className={headerCellClass}>Caption</th>
                      <th className={headerCellClass}>Button Text</th>
                      <th className={headerCellClass}>Button Link</th>
                      <th className={headerCellClass}>Status</th>
                      <th className={`${headerCellClass} text-right`}>Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E2E8F0]">
                    {slides.map((slide) => (
                      <tr className="transition-colors hover:bg-[#F1F5F9]/50" key={slide.id}>
                        <td className="px-5 py-4 align-middle">
                          <HeroMediaThumbnail slide={slide} />
                        </td>

                        <td className="max-w-[220px] px-5 py-4 align-middle">
                          <span className="line-clamp-2 text-sm font-semibold text-[#1C2434]">
                            {slideLabel(slide)}
                          </span>
                        </td>

                        <td className="max-w-[280px] px-5 py-4 align-middle">
                          <span className="line-clamp-2 text-sm text-[#64748B]">
                            {slide.caption || '-'}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-middle text-sm text-[#1C2434]">
                          {slide.ctaLabel || (
                            <span className="text-[#64748B]">Learn More (default)</span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-middle text-sm text-[#64748B]">
                          {getHeroCtaLinkLabel(slide.ctaUrl)}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <HeroStatusBadge isActive={slide.isActive} />
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <HeroRowActions
                            deletingId={deletingId}
                            slide={slide}
                            onDelete={() => void deleteSlide(slide)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </AppShell>
  );
}
