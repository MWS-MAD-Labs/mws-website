import { useEffect, useState } from "react";
import Affiliations from "../components/layout/Affiliations";
import CampusSpotlight from "../components/layout/CampusSpotlight";
import Hero from "../components/layout/Hero";
import InfoSection from "../components/layout/InfoSection";
import Philosophy from "../components/layout/Philosophy";
import CommunityVoices from "../components/ui/CommunityVoices";
import ProgramCards from "../components/ui/ProgramCards";
import { asset, logoUrl } from "../data/site";

const heroSlides = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Children collaborating on a classroom activity",
    headline: "",
    caption: "",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Students walking through a sunlit campus courtyard",
    headline: "",
    caption: "",
  },
  {
    image: asset("DSC04079.jpg"),
    alt: "View of the school's campus architecture",
    headline: "",
    caption: "",
  },
];

const infoCards = [
  {
    category: "admissions",
    image: asset("_DSC4760.jpg"),
    alt: "MWS Admissions",
    title: "How to Apply",
    tag: "Enrollment",
    text: "Curabitur cubilia velit sed arcu elit sunt exercitation.",
    path: "/admission",
    action: "Start Application",
  },
  {
    category: "campuses",
    image: asset("Elementary.jpg"),
    alt: "MWS Campus",
    title: "Sunlit Classrooms",
    tag: "Campus Tour",
    text: "Ipsum ut ante posuere aliqua enim ad non tempor.",
    path: "/admission",
    action: "Book a Tour",
  },
  {
    category: "academic",
    image: asset("DSC04079.jpg"),
    alt: "MWS Academic",
    title: "Inquiry Learning",
    tag: "Curriculum",
    text: "Lacus aliquip culpa laboris voluptate aute excepteur.",
    path: "/academic",
    action: "Explore Programs",
  },
  {
    category: "news",
    image: asset("_DSC4760.jpg"),
    alt: "MWS News",
    title: "STEAM Exhibition",
    tag: "News",
    text: "Veniam esse ea officia sint ex odio id.",
    path: "/news",
    action: "Read Story",
  },
  {
    category: "admissions",
    image: asset("Elementary.jpg"),
    alt: "MWS Admissions",
    title: "Tuition & Fees",
    tag: "Tuition",
    text: "Pariatur minim dolore orci faucibus deserunt nulla.",
    path: "/admission",
    action: "View Fees",
  },
];

const filters = [
  { label: "Admissions", value: "admissions" },
  { label: "Campuses", value: "campuses" },
  { label: "Academic", value: "academic" },
  { label: "News", value: "news" },
];

const spotlightSlides = [
  {
    image: asset("_DSC4760.jpg"),
    alt: "Campus Life at MWS",
    quote:
      "Occaecat anim eiusmod tincidunt curabitur, do praesent nulla fermentum laborum orci - mollit ad ipsum et. Culpa elit non suscipit..",
    cite: "Campus Life at Millennia World School",
  },
  {
    image: asset("Elementary.jpg"),
    alt: "Inquiry and culture at MWS",
    quote:
      "Integer esse excepteur, posuere minim amet commodo luctus id a dolore tempor dolor.",
    cite: "Student Life & Culture",
  },
  {
    image: asset("DSC04079.jpg"),
    alt: "Learning environment",
    quote:
      "Laboris adipiscing fugiat gravida sed, sint faucibus veniam. Velit nibh nostrud exercitation deserunt magna.",
    cite: "Our Learning Spaces",
  },
];

const partnerLogos = [
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CharterForCompassion.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateChangeSchool.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ClimateActionProject.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/CommonSenseEducation.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/ResponsiveClassroom.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/iEran.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/Climate-Action.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/EraseMeanness.jpg",
  "https://millenniaws.sch.id/wp-content/uploads/2023/11/Empatico.jpg",
];

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <Hero
        slides={heroSlides}
        activeIndex={heroIndex}
        onSelectSlide={setHeroIndex}
        onPrevious={() =>
          setHeroIndex((current) =>
            current === 0 ? heroSlides.length - 1 : current - 1,
          )
        }
        onNext={() =>
          setHeroIndex((current) => (current + 1) % heroSlides.length)
        }
      />
      <Philosophy
        text="Vitae pretium reprehenderit sit quis lorem luctus ultrices. Tincidunt augue suscipit fermentum qui nostrud primis."
        logoSrc={logoUrl}
      />
      <InfoSection
        title="Everything you need to know about joining MWS."
        filters={filters}
        cards={infoCards}
      />
      <ProgramCards />
      <CampusSpotlight slides={spotlightSlides} />
      <Affiliations
        title="Global partners in learning."
        text="Consectetur ullamco primis cubilia, quis aliqua irure incididunt. Feugiat reprehenderit pretium consequat, ultrices est lorem sit cupidatat."
        logos={partnerLogos}
      />
      <CommunityVoices />
    </main>
  );
}
