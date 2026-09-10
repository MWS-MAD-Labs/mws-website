import { asset } from "@/data/site";
import type { ManagedPage, PageTemplate } from "./pages";

export type SectionPreviewType =
  | "image"
  | "text"
  | "cards"
  | "logos"
  | "chat"
  | "form"
  | "calendar"
  | "article"
  | "table"
  | "map";

export type PageSection = {
  id: string;
  name: string;
  type: string;
  summary: string;
  preview: SectionPreviewType;
  image?: string;
};

const homeSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Carousel",
    summary: "Homepage lead image carousel",
    preview: "image",
    image: asset("_DSC4760.jpg"),
  },
  {
    id: "philosophy",
    name: "Featured Info / Intro",
    type: "Intro Text",
    summary: "Philosophy statement under the hero",
    preview: "text",
  },
  {
    id: "info-section",
    name: "Info Section",
    type: "Filtered Cards",
    summary: "Admissions, campus, academic, and news cards",
    preview: "cards",
    image: asset("Elementary.jpg"),
  },
  {
    id: "programs",
    name: "Programs",
    type: "Card Grid",
    summary: "Academic program cards from the homepage",
    preview: "cards",
    image: asset("Kindergarten.jpg"),
  },
  {
    id: "campus-spotlight",
    name: "Campus / Community Spotlight",
    type: "Media Quote",
    summary: "Campus image and quote carousel",
    preview: "image",
    image: asset("DSC04079.jpg"),
  },
  {
    id: "affiliations",
    name: "Global Partners",
    type: "Logo Grid",
    summary: "Affiliations and global partner logos",
    preview: "logos",
  },
  {
    id: "community-voices",
    name: "Voices of Community",
    type: "Story Cards",
    summary: "Student, parent, educator, and staff stories",
    preview: "cards",
    image: asset("_DSC4760.jpg"),
  },
  {
    id: "mws-ai",
    name: "MWS AI",
    type: "Assistant Entry",
    summary: "Public assistant entry from page layout",
    preview: "chat",
  },
];

const academicSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero / Header",
    type: "Subpage Hero",
    summary: "Academics page hero with breadcrumbs",
    preview: "image",
    image: asset("DSC09500.jpg"),
  },
  {
    id: "overview",
    name: "Overview",
    type: "Two Column Content",
    summary: "Academic intro, body copy, and action links",
    preview: "text",
  },
  {
    id: "rhythm",
    name: "Academic Rhythm",
    type: "Premium List",
    summary: "Inquiry, documentation, and community context list",
    preview: "cards",
  },
  {
    id: "program-cards",
    name: "Programs",
    type: "Card Grid",
    summary: "Program cards reused from public site",
    preview: "cards",
    image: asset("Kindergarten.jpg"),
  },
  {
    id: "pillar-grid",
    name: "Academic Ecosystem",
    type: "Pillar Grid",
    summary: "Learning design, assessment, support, and pathway pillars",
    preview: "cards",
  },
  {
    id: "pathway",
    name: "Pathway Links",
    type: "CTA Cards",
    summary: "Kindergarten, Elementary, and High School pathway cards",
    preview: "cards",
  },
];

const admissionSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Admissions page hero with breadcrumbs",
    preview: "image",
    image: asset("_DSC4760.jpg"),
  },
  {
    id: "how-to-apply",
    name: "How to Apply",
    type: "Content + Steps",
    summary: "Intro copy and admissions step list",
    preview: "cards",
  },
  {
    id: "process-table",
    name: "Admissions Process",
    type: "Table",
    summary: "Step, process, preparation, and outcome table",
    preview: "table",
  },
  {
    id: "inquiry-form",
    name: "Book a Tour / Inquiry",
    type: "Form",
    summary: "Parent inquiry and preferred tour date form",
    preview: "form",
  },
  {
    id: "faq",
    name: "Frequently Asked Questions",
    type: "Accordion",
    summary: "Admissions FAQ accordion",
    preview: "cards",
  },
];

const contactSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Contact page hero with breadcrumbs",
    preview: "image",
    image: asset("DSC05350.jpg"),
  },
  {
    id: "contact-form",
    name: "Send Us a Message",
    type: "Form",
    summary: "Name, email, subject, category, and message form",
    preview: "form",
  },
  {
    id: "campus-address",
    name: "Campus Address",
    type: "Contact Content",
    summary: "School address and location details",
    preview: "text",
  },
  {
    id: "direct-contacts",
    name: "Direct Contacts",
    type: "Contact Content",
    summary: "Phone, WhatsApp, and email contact details",
    preview: "cards",
  },
  {
    id: "office-hours",
    name: "Office Hours",
    type: "Premium List",
    summary: "Weekday, Saturday, and holiday availability",
    preview: "cards",
  },
  {
    id: "campus-map",
    name: "Campus Location",
    type: "Map Embed",
    summary: "Google Maps campus location embed",
    preview: "map",
  },
];

const communitySections: PageSection[] = [
  {
    id: "hero",
    name: "Hero / Header",
    type: "Subpage Hero",
    summary: "Community Stories page hero",
    preview: "image",
    image: asset("Elementary.jpg"),
  },
  {
    id: "intro",
    name: "Intro",
    type: "Centered Text",
    summary: "Community Stories lede paragraph",
    preview: "text",
  },
  {
    id: "voices",
    name: "Community Voices",
    type: "Story Cards",
    summary: "CommunityVoices section without footer link",
    preview: "cards",
    image: asset("_DSC4760.jpg"),
  },
];

const programDetailSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Program detail hero with breadcrumbs",
    preview: "image",
    image: asset("Kindergarten.jpg"),
  },
  {
    id: "overview",
    name: "Overview",
    type: "Two Column Content",
    summary: "Program intro and learning experience copy",
    preview: "text",
  },
  {
    id: "learning-focus",
    name: "Learning Outcomes",
    type: "Premium List",
    summary: "Age range, program focus, and family partnership",
    preview: "cards",
  },
  {
    id: "schedule-table",
    name: "Schedule / Sample Day",
    type: "Table",
    summary: "Area, learning focus, and experience table",
    preview: "table",
  },
  {
    id: "cta",
    name: "CTA",
    type: "Button",
    summary: "Book a Tour action",
    preview: "text",
  },
  {
    id: "activity-grid",
    name: "Activity Grid",
    type: "Card Grid",
    summary: "Purposeful learning activity cards",
    preview: "cards",
    image: asset("Elementary.jpg"),
  },
];

const ourSchoolSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Our School page hero",
    preview: "image",
    image: asset("DSC04079.jpg"),
  },
  {
    id: "story",
    name: "School Story",
    type: "Two Column Content",
    summary: "Intro and about MWS content",
    preview: "text",
  },
  {
    id: "quick-facts",
    name: "Quick Facts",
    type: "Premium List",
    summary: "Student-teacher ratio, pathways, and bilingual instruction",
    preview: "cards",
  },
  {
    id: "vision-mission",
    name: "Vision & Mission",
    type: "Dark Cards",
    summary: "Vision card and mission list",
    preview: "cards",
  },
  {
    id: "core-values",
    name: "MWS Core Values",
    type: "Card Grid",
    summary: "Curiosity, compassion, collaboration, and mindfulness",
    preview: "cards",
  },
];

const kurikulumSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Curriculum page hero",
    preview: "image",
    image: asset("_DSC7101.jpg"),
  },
  {
    id: "overview",
    name: "Curriculum Overview",
    type: "Two Column Content",
    summary: "Curriculum intro and content body",
    preview: "text",
  },
  {
    id: "tri-pillar",
    name: "Tri-Pillar Curriculum",
    type: "Panel List",
    summary: "Cambridge, national core, and character pillars",
    preview: "cards",
  },
  {
    id: "component-details",
    name: "Curriculum Component Details",
    type: "Dark Cards",
    summary: "Cambridge, national alignment, and eco-action cards",
    preview: "cards",
  },
];

const calendarSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero / Header",
    type: "Subpage Hero",
    summary: "School Calendar page hero",
    preview: "image",
    image: asset("DSC05350.jpg"),
  },
  {
    id: "calendar-header",
    name: "Calendar Header",
    type: "Intro Text",
    summary: "Important dates and events introduction",
    preview: "text",
  },
  {
    id: "calendar-grid",
    name: "Calendar Grid",
    type: "Calendar",
    summary: "Month grid with highlighted event days",
    preview: "calendar",
  },
  {
    id: "event-detail",
    name: "Event Detail Panel",
    type: "Detail Panel",
    summary: "Selected date event cards",
    preview: "cards",
  },
  {
    id: "legend",
    name: "Event Legend",
    type: "Legend",
    summary: "Academic, school, milestone, holiday, and wellbeing labels",
    preview: "logos",
  },
];

const schoolNewsSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero / Header",
    type: "Subpage Hero",
    summary: "School News page hero",
    preview: "image",
    image: asset("DSC04079.jpg"),
  },
  {
    id: "news-feed",
    name: "Listing / Grid",
    type: "Article List",
    summary: "School news post feed",
    preview: "article",
    image: asset("_DSC4760.jpg"),
  },
  {
    id: "search",
    name: "Filter / Search",
    type: "Search Form",
    summary: "Search stories form",
    preview: "form",
  },
  {
    id: "categories",
    name: "Categories",
    type: "Sidebar List",
    summary: "Academics, student life, events, and milestones categories",
    preview: "cards",
  },
  {
    id: "schedule-highlights",
    name: "Schedule Highlights",
    type: "Sidebar Widget",
    summary: "Upcoming schedule highlight cards",
    preview: "cards",
  },
  {
    id: "recent-updates",
    name: "Recent Updates",
    type: "Sidebar List",
    summary: "Recent news links",
    preview: "article",
  },
];

const newsDetailSections: PageSection[] = [
  {
    id: "hero",
    name: "Hero",
    type: "Subpage Hero",
    summary: "Article detail hero",
    preview: "image",
    image: asset("_DSC4760.jpg"),
  },
  {
    id: "metadata",
    name: "Metadata",
    type: "Article Meta",
    summary: "Category badge, publish date, and author",
    preview: "text",
  },
  {
    id: "article-content",
    name: "Article / Content",
    type: "Rich Content",
    summary: "Article intro, paragraphs, and quote",
    preview: "article",
  },
  {
    id: "article-media",
    name: "Article Image",
    type: "Media Block",
    summary: "Inline article image and caption",
    preview: "image",
    image: asset("_DSC7101.jpg"),
  },
  {
    id: "related-content",
    name: "Related Content",
    type: "Sidebar List",
    summary: "More News links",
    preview: "article",
  },
  {
    id: "visit-cta",
    name: "Visit CTA",
    type: "CTA Card",
    summary: "Visit Our Campus call to action",
    preview: "text",
  },
];

const sectionsByTemplate: Partial<Record<PageTemplate, PageSection[]>> = {
  "Form Page": admissionSections,
  "Program Detail": programDetailSections,
  "Listing / Calendar": calendarSections,
  Detail: newsDetailSections,
};

export function getPageSections(page: ManagedPage): PageSection[] {
  if (page.id === "home") return homeSections;
  if (page.id === "academic") return academicSections;
  if (page.id === "community-stories") return communitySections;
  if (page.id === "contact") return contactSections;
  if (page.id === "our-school") return ourSchoolSections;
  if (page.id === "kurikulum") return kurikulumSections;
  if (page.id === "school-news") return schoolNewsSections;

  return sectionsByTemplate[page.template] ?? [];
}
