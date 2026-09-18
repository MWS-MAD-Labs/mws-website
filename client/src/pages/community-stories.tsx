import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageApi, type CommunityStoriesPageData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import SubpageHero from '../components/ui/SubpageHero';
import { asset } from '../data/site';

const defaultCommunityStories: CommunityStoriesPageData = {
  hero: {
    title: 'Community Stories',
    image: asset('Elementary.jpg'),
    imageAlt: 'MWS School Community Stories',
  },
  introTitle: 'The moments that make\nour community.',
  introBody: [
    'From everyday learning to special moments across the school, these are some of the experiences that bring the MWS community together.',
    'Explore moments from life at MWS through our community gallery.',
  ],
  galleryImages: [
  {
    id: '1',
    src: asset('Elementary.jpg'),
    alt: 'MWS student community',
    size: 'large',
  },
  {
    id: '2',
    src: asset('DSC04079.jpg'),
    alt: 'MWS school activity',
    size: 'normal',
  },
  {
    id: '3',
    src: asset('Elementary.jpg'),
    alt: 'MWS students learning together',
    size: 'normal',
  },
  {
    id: '4',
    src: asset('DSC04079.jpg'),
    alt: 'MWS school campus',
    size: 'normal',
  },
  {
    id: '5',
    src: asset('Elementary.jpg'),
    alt: 'MWS student activity',
    size: 'normal',
  },
  {
    id: '6',
    src: asset('DSC04079.jpg'),
    alt: 'MWS community activity',
    size: 'tall',
  },
  {
    id: '7',
    src: asset('Elementary.jpg'),
    alt: 'MWS learning experience',
    size: 'normal',
  },
  {
    id: '8',
    src: asset('DSC04079.jpg'),
    alt: 'MWS school community',
    size: 'large',
  },
  {
    id: '9',
    src: asset('Elementary.jpg'),
    alt: 'MWS students',
    size: 'normal',
  },
  {
    id: '10',
    src: asset('DSC04079.jpg'),
    alt: 'MWS school activity',
    size: 'normal',
  },
  ],
  news: [
  {
    id: '1',
    title: 'Learning through meaningful experiences',
    image: asset('Elementary.jpg'),
    path: '/news/learning-through-meaningful-experiences',
  },
  {
    id: '2',
    title: 'Moments from our school community',
    image: asset('DSC04079.jpg'),
    path: '/news/moments-from-our-school-community',
  },
  {
    id: '3',
    title: 'Students exploring new ideas',
    image: asset('Elementary.jpg'),
    path: '/news/students-exploring-new-ideas',
  },
  {
    id: '4',
    title: 'Growing together at MWS',
    image: asset('DSC04079.jpg'),
    path: '/news/growing-together-at-mws',
  },
  ],
};

export default function CommunityStories() {
  const [content, setContent] = useState<CommunityStoriesPageData>(defaultCommunityStories);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<
    CommunityStoriesPageData['galleryImages'][number] | null
  >(null);

  useEffect(() => {
    let isMounted = true;

    pageApi
      .communityStories()
      .then((data) => {
        if (!isMounted) return;
        setContent({
          ...data,
          galleryImages: data.galleryImages.length
            ? data.galleryImages
            : defaultCommunityStories.galleryImages,
          news: data.news.length ? data.news : defaultCommunityStories.news,
        });
        setLoadError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load community stories.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <main>
      {loadError && (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      )}

      <SubpageHero
        title={content.hero.title}
        image={content.hero.image}
        imageAlt={content.hero.imageAlt}
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'About MWS' },
          { label: 'Community Stories' },
        ]}
      />

      {/* Introduction */}
      <section className="w-full bg-white px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10 md:py-[110px]">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[1.1fr_0.9fr] items-end gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-8">
          <h1 className="max-w-[760px] text-[clamp(42px,5vw,70px)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--charcoal)]">
            {content.introTitle.split('\n').map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>

          <div className="max-w-[520px]">
            {content.introBody.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? 'text-base leading-[1.85] text-[var(--charcoal)] md:text-lg'
                    : 'mt-5 text-base leading-[1.85] text-[var(--charcoal-muted)]'
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="w-full bg-[var(--warm-white)] px-6 py-[90px] max-[680px]:px-5 max-[680px]:py-[65px] md:px-10 md:py-[110px]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid auto-rows-[260px] grid-cols-4 gap-3 max-[1100px]:auto-rows-[220px] max-[1100px]:grid-cols-3 max-[760px]:auto-rows-[220px] max-[760px]:grid-cols-2 max-[500px]:auto-rows-[240px] max-[500px]:grid-cols-1">
            {content.galleryImages.map((image) => {
              const sizeClass =
                image.size === 'large'
                  ? 'col-span-2 row-span-2 max-[500px]:col-span-1 max-[500px]:row-span-1'
                  : image.size === 'tall'
                    ? 'row-span-2 max-[500px]:row-span-1'
                    : '';

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`group relative block min-h-0 w-full cursor-pointer overflow-hidden bg-[var(--charcoal)] text-left ${sizeClass}`}
                  aria-label={`View ${image.alt}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />

                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Popup */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(36,23,24,0.94)] p-5 md:p-10"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {/* School News */}
      <section className="w-full bg-white py-[100px] max-[680px]:py-[70px] md:py-[120px]">
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="mb-12 flex items-end justify-between gap-8 px-6 max-[680px]:mb-8 max-[680px]:px-5 md:px-10">
            <div>
              <h2 className="text-[clamp(36px,4vw,52px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--charcoal)]">
                From our school
              </h2>

              <p className="mt-4 max-w-[600px] text-base leading-[1.8] text-[var(--charcoal-muted)]">
                Discover more stories, activities, and updates from the MWS community.
              </p>
            </div>

            <Link
              to="/news"
              className="hidden shrink-0 items-center gap-3 border-b border-[var(--burgundy)] pb-1.5 text-sm font-semibold text-[var(--burgundy)] transition-colors duration-200 hover:border-[var(--charcoal)] hover:text-[var(--charcoal)] md:inline-flex"
            >
              View all news
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Horizontal News */}
          <div className="overflow-hidden">
            <div className="flex gap-5 overflow-x-auto px-6 pb-5 [scrollbar-width:none] max-[680px]:px-5 md:px-10 [&::-webkit-scrollbar]:hidden">
              {content.news.map((news) => (
                <Link
                  key={news.id}
                  to={news.path}
                  className="group w-[330px] shrink-0 md:w-[380px]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-[var(--warm-white)]">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-5 pt-5">
                    <h3 className="max-w-[310px] text-[20px] font-semibold leading-[1.2] tracking-[-0.015em] text-[var(--charcoal)] transition-colors duration-200 group-hover:text-[var(--burgundy)]">
                      {news.title}
                    </h3>

                    <span
                      aria-hidden="true"
                      className="pt-1 text-[var(--charcoal-muted)] transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 px-6 max-[680px]:px-5 md:hidden md:px-10">
            <Link
              to="/news"
              className="inline-flex items-center gap-3 border-b border-[var(--burgundy)] pb-1.5 text-sm font-semibold text-[var(--burgundy)]"
            >
              View all news
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
