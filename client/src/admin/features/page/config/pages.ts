export type PageStatus = "Published" | "Draft";

export type PageTemplate =
  | "Landing"
  | "Listing"
  | "Form Page"
  | "Program Detail"
  | "Generic Page"
  | "Listing / Calendar"
  | "Detail";

export type ManagedPage = {
  id: string;
  title: string;
  path: string;
  template: PageTemplate;
  status: PageStatus;
};

export const managedPages: ManagedPage[] = [
  {
    id: "home",
    title: "Home",
    path: "/",
    template: "Landing",
    status: "Published",
  },
  {
    id: "academic",
    title: "Academics",
    path: "/academic",
    template: "Listing",
    status: "Draft",
  },
  {
    id: "admission",
    title: "Admission",
    path: "/admission",
    template: "Form Page",
    status: "Draft",
  },
  {
    id: "community-stories",
    title: "Community Stories",
    path: "/community-stories",
    template: "Listing",
    status: "Draft",
  },
  {
    id: "contact",
    title: "Contact",
    path: "/contact",
    template: "Form Page",
    status: "Draft",
  },
  {
    id: "kindergarten",
    title: "Kindergarten",
    path: "/kindergarten",
    template: "Program Detail",
    status: "Draft",
  },
  {
    id: "elementary",
    title: "Elementary",
    path: "/elementary",
    template: "Program Detail",
    status: "Draft",
  },
  {
    id: "junior-high",
    title: "Junior High",
    path: "/junior-high",
    template: "Program Detail",
    status: "Draft",
  },
  {
    id: "high-school",
    title: "High School",
    path: "/high-school",
    template: "Program Detail",
    status: "Draft",
  },
  {
    id: "kurikulum",
    title: "Kurikulum",
    path: "/kurikulum",
    template: "Generic Page",
    status: "Draft",
  },
  {
    id: "our-school",
    title: "Our School",
    path: "/our-school",
    template: "Generic Page",
    status: "Draft",
  },
  {
    id: "school-calendar",
    title: "School Calendar",
    path: "/school-calendar",
    template: "Listing / Calendar",
    status: "Draft",
  },
  {
    id: "school-news",
    title: "School News",
    path: "/school-news",
    template: "Listing",
    status: "Draft",
  },
  {
    id: "news-detail",
    title: "News Detail",
    path: "/news/detail",
    template: "Detail",
    status: "Draft",
  },
];

export function getManagedPage(pageId: string | undefined): ManagedPage | undefined {
  return managedPages.find((page) => page.id === pageId);
}
