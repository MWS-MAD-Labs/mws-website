import { useEffect, useState } from 'react';
import Affiliations from '../components/layout/Affiliations';
import CampusSpotlight from '../components/layout/CampusSpotlight';
import Hero from '../components/layout/HeroSlides';
import InfoSection from '../components/layout/InfoSection';
import CommunityVoices from '../components/ui/CommunityVoices';
import { asset, logoUrl } from '../data/site';
import Background from '../components/layout/Background';
import ProgramAcademic from '../components/ui/ProgramAcademic';
import AdmissionsCta from '../components/layout/AdmissionsCta';
import { pageApi, type HomePageData } from '@/api/pageApi';

const heroSlides = [
  {
    image: asset('_DSC4760.jpg'),
    alt: 'Children collaborating on a classroom activity',
    headline: 'Learning starts with curiosity.',
    caption: 'At Millennia World School, students learn to explore, question, and create.',
  },
  {
    image: asset('Elementary.jpg'),
    alt: 'Students walking through a sunlit campus courtyard',
    headline: 'A place to grow together.',
    caption: 'A learning environment designed to encourage curiosity, confidence, and connection.',
  },
  {
    image: asset('DSC04079.jpg'),
    alt: "View of the school's campus architecture",
    headline: 'More than a classroom.',
    caption: 'Discover an environment where learning extends beyond the walls of the classroom.',
  },
];
const infoCards = [
  {
    category: 'admissions',
    image: asset('_DSC4760.jpg'),
    alt: 'MWS Admissions',
    title: 'How to Apply',
    tag: 'Enrollment',
    text: 'Curabitur cubilia velit sed arcu elit sunt exercitation.',
    path: '/admission',
    action: 'Start Application',
  },
  {
    category: 'campuses',
    image: asset('Elementary.jpg'),
    alt: 'MWS Campus',
    title: 'Sunlit Classrooms',
    tag: 'Campus Tour',
    text: 'Ipsum ut ante posuere aliqua enim ad non tempor.',
    path: '/admission',
    action: 'Book a Tour',
  },
  {
    category: 'academic',
    image: asset('DSC04079.jpg'),
    alt: 'MWS Academic',
    title: 'Inquiry Learning',
    tag: 'Curriculum',
    text: 'Lacus aliquip culpa laboris voluptate aute excepteur.',
    path: '/academic',
    action: 'Explore Programs',
  },
  {
    category: 'news',
    image: asset('_DSC4760.jpg'),
    alt: 'MWS News',
    title: 'STEAM Exhibition',
    tag: 'News',
    text: 'Veniam esse ea officia sint ex odio id.',
    path: '/news',
    action: 'Read Story',
  },
  {
    category: 'admissions',
    image: asset('Elementary.jpg'),
    alt: 'MWS Admissions',
    title: 'Tuition & Fees',
    tag: 'Tuition',
    text: 'Pariatur minim dolore orci faucibus deserunt nulla.',
    path: '/admission',
    action: 'View Fees',
  },
];

const filters = [
  { label: 'Admissions', value: 'admissions' },
  { label: 'Campuses', value: 'campuses' },
  { label: 'Academic', value: 'academic' },
  { label: 'News', value: 'news' },
];

const spotlightSlides = [
  {
    image: asset('_DSC4760.jpg'),
    alt: 'Campus Life at MWS',
    quote:
      'Occaecat anim eiusmod tincidunt curabitur, do praesent nulla fermentum laborum orci - mollit ad ipsum et. Culpa elit non suscipit..',
    cite: 'Campus Life at Millennia World School',
  },
  {
    image: asset('Elementary.jpg'),
    alt: 'Inquiry and culture at MWS',
    quote: 'Integer esse excepteur, posuere minim amet commodo luctus id a dolore tempor dolor.',
    cite: 'Student Life & Culture',
  },
  {
    image: asset('DSC04079.jpg'),
    alt: 'Learning environment',
    quote:
      'Laboris adipiscing fugiat gravida sed, sint faucibus veniam. Velit nibh nostrud exercitation deserunt magna.',
    cite: 'Our Learning Spaces',
  },
];

const partnerLogos = [
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/CharterForCompassion.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateChangeSchool.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateActionProject.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/CommonSenseEducation.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/ResponsiveClassroom.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/iEran.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/Climate-Action.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/EraseMeanness.jpg',
  'https://millenniaws.sch.id/wp-content/uploads/2023/11/Empatico.jpg',
];

export default function Home() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const slides = homeData?.heroSlides.length ? homeData.heroSlides : heroSlides;
  const cards = homeData?.infoCards.length ? homeData.infoCards : infoCards;
  const programs = homeData?.programs.length ? homeData.programs : undefined;
  const voices = homeData?.communityVoices.length ? homeData.communityVoices : undefined;
  const affiliations = homeData?.affiliations ?? {
    title: 'Global partners in learning.',
    text: 'Consectetur ullamco primis cubilia, quis aliqua irure incididunt. Feugiat reprehenderit pretium consequat, ultrices est lorem sit cupidatat.',
    logos: partnerLogos,
    logosLabel: 'In partnership with',
  };
  const campusSlides = homeData?.spotlightSlides.length ? homeData.spotlightSlides : spotlightSlides;
  const activeHeroIndex = slides.length ? heroIndex % slides.length : 0;

  const changeHeroSlide = (nextIndex: number) => {
    setHeroIndex(nextIndex);
  };

  useEffect(() => {
    let isMounted = true;

    pageApi
      .home()
      .then((data) => {
        if (!isMounted) return;
        setHomeData(data);
        setLoadError(null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to load home content.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setTimeout(() => {
      setHeroIndex((current) => (current + 1) % slides.length);
    }, 3600);

    return () => window.clearTimeout(timer);
  }, [heroIndex, slides.length]);

  return (
    <main>
      {loadError && (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      )}

      <Hero
        slides={slides}
        activeIndex={activeHeroIndex}
        onSelectSlide={changeHeroSlide}
        onPrevious={() =>
          changeHeroSlide(activeHeroIndex === 0 ? slides.length - 1 : activeHeroIndex - 1)
        }
        onNext={() => changeHeroSlide((activeHeroIndex + 1) % slides.length)}
      />
      <Background
        body={
          homeData?.background.body ??
          'In the 21st century, every educational system faces the challenge of preparing young generations for a life that is not only complex, but constantly changing as well. Millennia World School (MWS) offers a developmentally appropriate experiential approach towards education — enabling every student to fully develop their talents, dispositions and capabilities.'
        }
        logoSrc={logoUrl}
      />

      <InfoSection
        title="Everything you need to know about joining MWS."
        filters={filters}
        cards={cards}
      />

      <ProgramAcademic programs={programs} />

      <CommunityVoices voices={voices} />

      <Affiliations
        title={affiliations.title}
        text={affiliations.text}
        logos={affiliations.logos.length ? affiliations.logos : partnerLogos}
        logosLabel={affiliations.logosLabel}
      />

      <CampusSpotlight slides={campusSlides} />

      <AdmissionsCta
        headline="Ready to begin your journey at MWS?"
        primary={{
          label: 'Start Your Application',
          to: '/admission',
        }}
        secondary={{
          label: 'Visit Our Campus',
          to: '/contact',
        }}
      />
    </main>
  );
}
