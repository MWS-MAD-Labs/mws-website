import { apiRequest } from "@/lib/api";
import type { OurSchoolPageData } from "@/api/pageApi";
import { env } from "@/config/env";
import type {
  AdmissionPageContent,
  AdmissionPageStatus,
} from "@/features/admissions/admissionPageData";
import type {
  ContactPage,
  ContactPageContent,
} from "@/features/contact/contactPageData";
import type {
  HeroSlideMediaType,
  HeroSlideSourceType,
  ResolvedHeroSlide,
} from "@/features/hero/heroData";
import type { AuthUser, CmsRoleName } from "@/admin/types/auth";

export type DashboardRecentUpdate = {
  type: "news" | "page" | "academic" | "hero";
  title: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED" | "SCHEDULED" | "HIDDEN";
  updatedAt: string;
  editPath: string;
};

export type DashboardContentSummary = {
  news: { published: number; scheduled: number; drafts: number; archived: number };
  hero: { total: number; active: number; missingMedia: number };
  gallery: { galleries: number; images: number; videos: number };
  academic: Array<{
    levelKey: AcademicLevelKey;
    title: string;
    hasUnpublishedChanges: boolean;
    isPublished: boolean;
    updatedAt: string;
  }>;
  users: { active: number; pendingInvitations: number } | null;
  recentUpdates: DashboardRecentUpdate[];
};

export type AdminDashboardData = {
  message: string;
  user: AuthUser;
  content: DashboardContentSummary;
};

export type AnalyticsRange = 7 | 30 | 90;

export type AnalyticsOverview = {
  range: AnalyticsRange;
  totals: { views: number; visits: number; pagesPerVisit: number; activeNow: number };
  /** Percent change against the previous period; null when there is no baseline. */
  change: { views: number | null; visits: number | null };
  daily: Array<{ date: string; views: number; visits: number }>;
  topPages: Array<{ path: string; views: number; visits: number }>;
  referrers: Array<{ source: string; visits: number }>;
  devices: Array<{ device: string; visits: number }>;
};

export type CmsUserListItem = {
  id: string;
  centralUserId: string;
  email: string | null;
  name: string;
  unitId: string;
  unit: string;
  isActive: boolean;
  lastCentralSyncedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    name: CmsRoleName;
    label: string | null;
  } | null;
};

export type CmsRoleListItem = {
  name: CmsRoleName;
  label: string | null;
};

export type CmsUsersData = {
  users: CmsUserListItem[];
  invitations: CmsInvitationListItem[];
  roles: CmsRoleListItem[];
};

export type CmsInvitationListItem = {
  id: string;
  email: string;
  centralUserId: string | null;
  name: string | null;
  unitId: string | null;
  unit: string;
  status: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    name: CmsRoleName;
    label: string | null;
  } | null;
  invitedBy: { id: string; name: string; email: string | null } | null;
  acceptedUser: { id: string; name: string; email: string | null } | null;
};

export type CmsInvitationResult = CmsInvitationListItem & {
  notification: { sent: true } | { sent: false; reason: string };
  loginUrl: string;
};

export type HeroSlideFormData = {
  sourceType?: HeroSlideSourceType;
  sourceId?: string | null;
  title?: string | null;
  description?: string | null;
  caption?: string | null;
  mediaType?: HeroSlideMediaType | null;
  mediaPath?: string | null;
  mediaAlt?: string | null;
  posterPath?: string | null;
  isLooping?: boolean;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type HomeContentSettings = {
  id: string | null;
  infoSectionTitle: string;
  infoSectionCategoryId: string | null;
  infoSectionCategoryIds: string[];
  updatedAt: string | null;
};

export type CampusSpotlightItem = {
  id: string;
  text: string;
  cite: string;
  sortOrder: number;
  isActive: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HomeContentData = {
  settings: HomeContentSettings;
  categories: NewsCategory[];
  spotlights: CampusSpotlightItem[];
};

export type HomeContentSettingsPayload = {
  infoSectionTitle?: string;
  infoSectionCategoryId?: string | null;
  infoSectionCategoryIds?: string[];
};

export type CampusSpotlightPayload = {
  text: string;
  cite: string;
  sortOrder?: number;
  isActive?: boolean;
  activeFrom?: string | null;
  activeUntil?: string | null;
};

export type GalleryImageItem = {
  id: string;
  galleryId: string;
  path: string;
  title: string | null;
  caption: string | null;
  sortOrder: number;
  previewPath: string;
  createdAt: string;
  updatedAt: string;
};

export type GalleryVideoItem = {
  id: string;
  galleryId: string;
  sourceType: "UPLOAD" | "YOUTUBE";
  source: string;
  title: string | null;
  caption: string | null;
  sortOrder: number;
  previewPath: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  images: GalleryImageItem[];
  videos: GalleryVideoItem[];
  createdAt: string;
  updatedAt: string;
};

export type GalleryPayload = {
  title: string;
  description?: string | null;
};

export type OurSchoolItem = {
  id: string;
  title: string;
  description: string | null;
  content: OurSchoolPageData | (OurSchoolPageData & { status?: "DRAFT" | "PUBLISHED" }) | null;
  galleryId: string | null;
  featuredImageId: string | null;
  gallery: GalleryItem | null;
  featuredImage: GalleryImageItem | null;
  createdAt: string;
  updatedAt: string;
};

export type OurSchoolPayload = {
  title: string;
  description?: string | null;
  content?: (OurSchoolPageData & { status?: "DRAFT" | "PUBLISHED" }) | null;
  galleryId?: string | null;
  featuredImageId?: string | null;
};

export type GalleryImageMetadataPayload = {
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
};

export type GalleryVideoMetadataPayload = GalleryImageMetadataPayload;

export type AdminAdmissionProgram = {
  id: string;
  admissionId?: string | null;
  galleryId?: string | null;
  title: string;
  age: string;
  description: string;
  image: string;
  imageAlt?: string | null;
  path: string;
  adminWhatsapp: string;
  contactLabel?: string | null;
  exploreLabel?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminAdmissionsData = {
  page: {
    id: string | null;
    title: string;
    description: string | null;
    content: (AdmissionPageContent & { status?: AdmissionPageStatus }) | null;
    galleryId: string | null;
    isPublished: boolean;
    updatedAt: string | null;
  };
  programs: AdminAdmissionProgram[];
  galleries: GalleryItem[];
};

export type AdminAdmissionsPayload = {
  content?: (AdmissionPageContent & { status?: AdmissionPageStatus }) | null;
  galleryId?: string | null;
  isPublished?: boolean;
  programs: AdminAdmissionProgram[];
};

export type AcademicLevelKey = "kindergarten" | "elementary" | "high-school";

export type AcademicOverviewItem = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  content: AcademicOverviewContent | null;
  galleryId: string | null;
  gallery?: GalleryItem | null;
  createdAt: string;
  updatedAt: string;
};

export type AcademicOverviewContent = {
  intro: {
    title: string;
    body: string;
    image: string;
    imageAlt: string;
  };
  experience: {
    title: string;
    body: string;
    image: string;
    imageAlt: string;
  };
  approach: Array<{
    title: string;
    body: string;
  }>;
};

export type AcademicOverviewPayload = {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  content?: AcademicOverviewContent | null;
  galleryId?: string | null;
};

export type AcademicMasterLevel = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AcademicMasterLevelPayload = {
  title: string;
  description?: string | null;
};

export type AcademicLevelJson = unknown;

export type AcademicAssetType = "image" | "document";

export type AcademicAssetUploadResult = {
  path: string;
  objectName: string;
  filename: string;
  contentType: string;
  size: number;
};

export type AcademicFaqItem = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  isAdmissionFaq: boolean;
  admissionSortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    kindergartens: number;
    elementaries: number;
    juniorHighs: number;
  };
};

export type AcademicFaqPayload = {
  question: string;
  answer: string;
  isActive?: boolean;
  isAdmissionFaq?: boolean;
  admissionSortOrder?: number;
};

export type AcademicLevelFaqLink = {
  academicLevelId: string;
  faqId: string;
  sortOrder: number;
  faq: AcademicFaqItem;
};

export type FixedAcademicLevelItem = {
  id: string;
  academicLevelId: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  galleryId: string | null;
  hero: AcademicLevelJson;
  overview: AcademicLevelJson;
  sections: AcademicLevelJson;
  faqs?: AcademicLevelFaqLink[];
  status: string;
  publishedAt: string | null;
  academicLevel?: AcademicMasterLevel;
  gallery?: GalleryItem | null;
  createdAt: string;
  updatedAt: string;
};

export type FixedAcademicLevelPayload = {
  academicLevelId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  galleryId?: string | null;
  hero: AcademicLevelJson;
  overview: AcademicLevelJson;
  sections: AcademicLevelJson;
  status?: string;
  publishedAt?: string | null;
};

export type FixedAcademicCrudResource =
  | "kindergartens"
  | "elementaries"
  | "junior-highs";

export type AdminCommunityStoriesPage = {
  id: string | null;
  title: string;
  heroImagePath: string | null;
  heroImageAlt: string | null;
  introTitle: string | null;
  introBody: string[];
  galleryId: string | null;
  isPublished: boolean;
};

export type AdminNewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imagePath: string | null;
  imageAlt: string | null;
  galleryId: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommunityStoriesData = {
  page: AdminCommunityStoriesPage;
  galleries: GalleryItem[];
  news: AdminNewsPost[];
  voices: AdminCommunityVoice[];
};

export type AdminCommunityVoice = {
  id: string;
  role: string;
  name: string;
  grade: string | null;
  quote: string;
  imagePath: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommunityVoicePayload = {
  role: string;
  name: string;
  grade?: string | null;
  quote: string;
  imagePath: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdmissionGuidelinesPage = {
  id: string | null;
  slug: string;
  title: string;
  body: AdmissionGuidelinesContent | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  updatedAt: string | null;
};

export type AdmissionGuidelinesContent = {
  title: string;
  hero: {
    title: string;
    description: string;
  };
  body: string;
  checklist: string[];
  documents: string[];
  cta: {
    label: string;
    href: string;
  };
};

export type AdminCommunityStoriesPagePayload = Omit<
  AdminCommunityStoriesPage,
  "id"
>;

export type AdminNewsPayload = Omit<
  AdminNewsPost,
  "id" | "createdAt" | "updatedAt"
>;

export type Partner = {
  id: string;
  name: string;
  description: string;
  logo: string;
  link: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PartnerPayload = {
  name: string;
  description: string;
  logo: string;
  link?: string | null;
  status: string;
};

export type NewsStatus = "ARCHIVED" | "DRAFT" | "PUBLISHED";

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
};

export type NewsCategoryPayload = {
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
};

export type NewsTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: {
    postTags: number;
  };
};

export type NewsTagPayload = {
  name: string;
  slug: string;
};

export type NewsImagePurpose = "ARTICLE" | "COVER";

export type NewsPostMedia = {
  id: string;
  newsPostId: string;
  mediaType: "DOCUMENT" | "IMAGE" | "VIDEO";
  url: string;
  alt: string | null;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type NewsPost = {
  id: string;
  categoryId: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  content: unknown;
  authorName: string | null;
  authorId: string | null;
  status: NewsStatus;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  readTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: NewsCategory | null;
  author: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  media: NewsPostMedia[];
  tags: NewsTag[];
};

export type NewsPostPayload = {
  categoryId?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  content: unknown;
  authorName?: string | null;
  status: NewsStatus;
  isFeatured?: boolean;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readTime?: number;
  tagIds?: string[];
};

export type NewsPostStatusPayload = Pick<NewsPostPayload, "status">;

export type NewsPostFilters = {
  page?: number;
  pageSize?: number;
  status?: NewsStatus;
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  search?: string;
};

export type NewsPostList = {
  items: NewsPost[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ContactInquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string | null;
  message: string;
  status: ContactInquiryStatus;
  source: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactInquiryFilters = {
  page?: number;
  pageSize?: number;
  status?: ContactInquiryStatus | "";
  search?: string;
};

export type ContactInquiryList = {
  items: ContactInquiry[];
  statusCounts: Partial<Record<ContactInquiryStatus, number>>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export const adminApi = {
  async dashboard(): Promise<AdminDashboardData> {
    const response = await apiRequest<{ data: AdminDashboardData }>(
      "/admin/dashboard-data",
    );
    return response!.data;
  },

  async analytics(days: AnalyticsRange): Promise<AnalyticsOverview> {
    const response = await apiRequest<{ data: AnalyticsOverview }>(
      `/admin/analytics?days=${days}`,
    );
    return response!.data;
  },

  async users(): Promise<CmsUsersData> {
    const response = await apiRequest<{ data: CmsUsersData }>("/admin/users");
    return response!.data;
  },

  async updateUserRole(
    userId: string,
    roleName: CmsRoleName | null,
  ): Promise<CmsUserListItem> {
    const response = await apiRequest<{ data: CmsUserListItem }>(
      `/admin/users/${userId}/role`,
      {
        method: "PATCH",
        body: { roleName },
      },
    );
    return response!.data;
  },

  async updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Promise<CmsUserListItem> {
    const response = await apiRequest<{ data: CmsUserListItem }>(
      `/admin/users/${userId}/status`,
      {
        method: "PATCH",
        body: { isActive },
      },
    );
    return response!.data;
  },

  async inviteCmsAdmin(email: string): Promise<CmsInvitationResult> {
    const response = await apiRequest<{ data: CmsInvitationResult }>(
      "/admin/users/invitations",
      {
        method: "POST",
        body: { email, roleName: "ADMIN" },
      },
    );
    return response!.data;
  },

  async resendCmsInvitation(id: string): Promise<CmsInvitationResult> {
    const response = await apiRequest<{ data: CmsInvitationResult }>(
      `/admin/users/invitations/${id}/resend`,
      { method: "POST" },
    );
    return response!.data;
  },

  async revokeCmsInvitation(id: string): Promise<CmsInvitationListItem> {
    const response = await apiRequest<{ data: CmsInvitationListItem }>(
      `/admin/users/invitations/${id}`,
      {
        method: "DELETE",
      },
    );
    return response!.data;
  },

  async contactPage(): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>(
      "/admin/contact-page",
    );
    return response!.data;
  },

  async updateContactPage(content: ContactPageContent): Promise<ContactPage> {
    const response = await apiRequest<{ data: ContactPage }>(
      "/admin/contact-page",
      {
        method: "PUT",
        body: content,
      },
    );
    return response!.data;
  },

  async resetContactPage(): Promise<void> {
    await apiRequest("/admin/contact-page", { method: "DELETE" });
  },

  async heroSlides(): Promise<ResolvedHeroSlide[]> {
    const response = await apiRequest<{ data: ResolvedHeroSlide[] }>(
      "/admin/hero-slides",
    );
    return response?.data ?? [];
  },

  async createHeroSlide(data: HeroSlideFormData): Promise<ResolvedHeroSlide> {
    const response = await apiRequest<{ data: ResolvedHeroSlide }>(
      "/admin/hero-slides",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateHeroSlide(
    id: string,
    data: HeroSlideFormData,
  ): Promise<ResolvedHeroSlide> {
    const response = await apiRequest<{ data: ResolvedHeroSlide }>(
      `/admin/hero-slides/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteHeroSlide(id: string): Promise<void> {
    await apiRequest(`/admin/hero-slides/${id}`, { method: "DELETE" });
  },

  async homeContent(): Promise<HomeContentData> {
    const response = await apiRequest<{ data: HomeContentData }>(
      "/admin/home-content",
    );
    return response!.data;
  },

  async updateHomeContentSettings(
    data: HomeContentSettingsPayload,
  ): Promise<HomeContentData> {
    const response = await apiRequest<{ data: HomeContentData }>(
      "/admin/home-content/settings",
      {
        method: "PUT",
        body: data,
      },
    );
    return response!.data;
  },

  async createCampusSpotlight(
    data: CampusSpotlightPayload,
  ): Promise<CampusSpotlightItem> {
    const response = await apiRequest<{ data: CampusSpotlightItem }>(
      "/admin/home-content/spotlights",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateCampusSpotlight(
    id: string,
    data: Partial<CampusSpotlightPayload>,
  ): Promise<CampusSpotlightItem> {
    const response = await apiRequest<{ data: CampusSpotlightItem }>(
      `/admin/home-content/spotlights/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteCampusSpotlight(id: string): Promise<void> {
    await apiRequest(`/admin/home-content/spotlights/${id}`, {
      method: "DELETE",
    });
  },

  async galleries(): Promise<GalleryItem[]> {
    const response = await apiRequest<{ data: GalleryItem[] }>("/admin/galleries");
    return response?.data ?? [];
  },

  async gallery(id: string): Promise<GalleryItem> {
    const response = await apiRequest<{ data: GalleryItem }>(
      `/admin/galleries/${id}`,
    );
    return response!.data;
  },

  async createGallery(data: GalleryPayload): Promise<GalleryItem> {
    const response = await apiRequest<{ data: GalleryItem }>("/admin/galleries", {
      method: "POST",
      body: data,
    });
    return response!.data;
  },

  async updateGallery(id: string, data: GalleryPayload): Promise<GalleryItem> {
    const response = await apiRequest<{ data: GalleryItem }>(
      `/admin/galleries/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteGallery(id: string): Promise<void> {
    await apiRequest(`/admin/galleries/${id}`, { method: "DELETE" });
  },

  async ourSchools(): Promise<OurSchoolItem[]> {
    const response = await apiRequest<{ data: OurSchoolItem[] }>(
      "/admin/our-school",
    );
    return response?.data ?? [];
  },

  async createOurSchool(data: OurSchoolPayload): Promise<OurSchoolItem> {
    const response = await apiRequest<{ data: OurSchoolItem }>(
      "/admin/our-school",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateOurSchool(
    id: string,
    data: OurSchoolPayload,
  ): Promise<OurSchoolItem> {
    const response = await apiRequest<{ data: OurSchoolItem }>(
      `/admin/our-school/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteOurSchool(id: string): Promise<void> {
    await apiRequest(`/admin/our-school/${id}`, { method: "DELETE" });
  },

  async admissions(): Promise<AdminAdmissionsData> {
    const response = await apiRequest<{ data: AdminAdmissionsData }>(
      "/admin/admissions",
    );
    return response!.data;
  },

  async updateAdmissions(data: AdminAdmissionsPayload): Promise<AdminAdmissionsData> {
    const response = await apiRequest<{ data: AdminAdmissionsData }>(
      "/admin/admissions",
      {
        method: "PUT",
        body: data,
      },
    );
    return response!.data;
  },

  async academicOverviews(): Promise<AcademicOverviewItem[]> {
    const response = await apiRequest<{ data: AcademicOverviewItem[] }>(
      "/admin/academic-crud/academics",
    );
    return response?.data ?? [];
  },

  async createAcademicOverview(
    data: AcademicOverviewPayload,
  ): Promise<AcademicOverviewItem> {
    const response = await apiRequest<{ data: AcademicOverviewItem }>(
      "/admin/academic-crud/academics",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateAcademicOverview(
    id: string,
    data: Partial<AcademicOverviewPayload>,
  ): Promise<AcademicOverviewItem> {
    const response = await apiRequest<{ data: AcademicOverviewItem }>(
      `/admin/academic-crud/academics/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteAcademicOverview(id: string): Promise<void> {
    await apiRequest(`/admin/academic-crud/academics/${id}`, {
      method: "DELETE",
    });
  },

  async academicMasterLevels(): Promise<AcademicMasterLevel[]> {
    const response = await apiRequest<{ data: AcademicMasterLevel[] }>(
      "/admin/academic-crud/academic-levels",
    );
    return response?.data ?? [];
  },

  async createAcademicMasterLevel(
    data: AcademicMasterLevelPayload,
  ): Promise<AcademicMasterLevel> {
    const response = await apiRequest<{ data: AcademicMasterLevel }>(
      "/admin/academic-crud/academic-levels",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateAcademicMasterLevel(
    id: string,
    data: Partial<AcademicMasterLevelPayload>,
  ): Promise<AcademicMasterLevel> {
    const response = await apiRequest<{ data: AcademicMasterLevel }>(
      `/admin/academic-crud/academic-levels/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteAcademicMasterLevel(id: string): Promise<void> {
    await apiRequest(`/admin/academic-crud/academic-levels/${id}`, {
      method: "DELETE",
    });
  },

  async uploadAcademicLevelAsset(
    levelKey: AcademicLevelKey,
    type: AcademicAssetType,
    file: File,
  ): Promise<AcademicAssetUploadResult> {
    const body = new FormData();
    body.append("file", file);
    body.append("type", type);

    const response = await apiRequest<{ data: AcademicAssetUploadResult }>(
      `/admin/academic-levels/${levelKey}/assets`,
      {
        method: "POST",
        body,
      },
    );

    return response!.data;
  },

  async academicFaqs(): Promise<AcademicFaqItem[]> {
    const response = await apiRequest<{ data: AcademicFaqItem[] }>(
      "/admin/academic-crud/faqs",
    );
    return response?.data ?? [];
  },

  async createAcademicFaq(data: AcademicFaqPayload): Promise<AcademicFaqItem> {
    const response = await apiRequest<{ data: AcademicFaqItem }>(
      "/admin/academic-crud/faqs",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateAcademicFaq(
    id: string,
    data: Partial<AcademicFaqPayload>,
  ): Promise<AcademicFaqItem> {
    const response = await apiRequest<{ data: AcademicFaqItem }>(
      `/admin/academic-crud/faqs/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteAcademicFaq(id: string): Promise<void> {
    await apiRequest(`/admin/academic-crud/faqs/${id}`, {
      method: "DELETE",
    });
  },

  async fixedAcademicLevels(
    resource: FixedAcademicCrudResource,
  ): Promise<FixedAcademicLevelItem[]> {
    const response = await apiRequest<{ data: FixedAcademicLevelItem[] }>(
      `/admin/academic-crud/${resource}`,
    );
    return response?.data ?? [];
  },

  async createFixedAcademicLevel(
    resource: FixedAcademicCrudResource,
    data: FixedAcademicLevelPayload,
  ): Promise<FixedAcademicLevelItem> {
    const response = await apiRequest<{ data: FixedAcademicLevelItem }>(
      `/admin/academic-crud/${resource}`,
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateFixedAcademicLevel(
    resource: FixedAcademicCrudResource,
    id: string,
    data: Partial<FixedAcademicLevelPayload>,
  ): Promise<FixedAcademicLevelItem> {
    const response = await apiRequest<{ data: FixedAcademicLevelItem }>(
      `/admin/academic-crud/${resource}/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteFixedAcademicLevel(
    resource: FixedAcademicCrudResource,
    id: string,
  ): Promise<void> {
    await apiRequest(`/admin/academic-crud/${resource}/${id}`, {
      method: "DELETE",
    });
  },

  async attachAcademicFaq(
    resource: FixedAcademicCrudResource,
    id: string,
    data: { faqId: string; sortOrder?: number },
  ): Promise<AcademicLevelFaqLink> {
    const response = await apiRequest<{ data: AcademicLevelFaqLink }>(
      `/admin/academic-crud/${resource}/${id}/faqs`,
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async reorderAcademicFaqs(
    resource: FixedAcademicCrudResource,
    id: string,
    faqIds: string[],
  ): Promise<void> {
    await apiRequest(`/admin/academic-crud/${resource}/${id}/faqs`, {
      method: "PATCH",
      body: { faqIds },
    });
  },

  async detachAcademicFaq(
    resource: FixedAcademicCrudResource,
    id: string,
    faqId: string,
  ): Promise<void> {
    await apiRequest(`/admin/academic-crud/${resource}/${id}/faqs/${faqId}`, {
      method: "DELETE",
    });
  },

  async communityStories(): Promise<AdminCommunityStoriesData> {
    const response = await apiRequest<{ data: AdminCommunityStoriesData }>(
      "/admin/community-stories",
    );
    return response!.data;
  },

  async updateCommunityStoriesPage(
    data: AdminCommunityStoriesPagePayload,
  ): Promise<AdminCommunityStoriesPage> {
    const response = await apiRequest<{ data: AdminCommunityStoriesPage }>(
      "/admin/community-stories/page",
      {
        method: "PUT",
        body: data,
      },
    );
    return response!.data;
  },

  async createCommunityNews(data: AdminNewsPayload): Promise<AdminNewsPost> {
    const response = await apiRequest<{ data: AdminNewsPost }>(
      "/admin/community-stories/news",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateCommunityNews(
    id: string,
    data: AdminNewsPayload,
  ): Promise<AdminNewsPost> {
    const response = await apiRequest<{ data: AdminNewsPost }>(
      `/admin/community-stories/news/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteCommunityNews(id: string): Promise<void> {
    await apiRequest(`/admin/community-stories/news/${id}`, {
      method: "DELETE",
    });
  },

  async communityVoices(): Promise<AdminCommunityVoice[]> {
    const response = await apiRequest<{ data: AdminCommunityVoice[] }>(
      "/admin/community-stories/voices",
    );
    return response!.data;
  },

  async createCommunityVoice(
    data: AdminCommunityVoicePayload,
  ): Promise<AdminCommunityVoice> {
    const response = await apiRequest<{ data: AdminCommunityVoice }>(
      "/admin/community-stories/voices",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateCommunityVoice(
    id: string,
    data: Partial<AdminCommunityVoicePayload>,
  ): Promise<AdminCommunityVoice> {
    const response = await apiRequest<{ data: AdminCommunityVoice }>(
      `/admin/community-stories/voices/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteCommunityVoice(id: string): Promise<void> {
    await apiRequest(`/admin/community-stories/voices/${id}`, {
      method: "DELETE",
    });
  },

  async admissionGuidelines(): Promise<AdmissionGuidelinesPage> {
    const response = await apiRequest<{ data: AdmissionGuidelinesPage }>(
      "/admin/admission-guidelines",
    );
    return response!.data;
  },

  async updateAdmissionGuidelines(data: {
    body: AdmissionGuidelinesContent;
    status: "DRAFT" | "PUBLISHED";
  }): Promise<AdmissionGuidelinesPage> {
    const response = await apiRequest<{ data: AdmissionGuidelinesPage }>(
      "/admin/admission-guidelines",
      {
        method: "PUT",
        body: data,
      },
    );
    return response!.data;
  },

  async partners(): Promise<Partner[]> {
    const response = await apiRequest<{ data: Partner[] }>("/admin/partners");
    return response?.data ?? [];
  },

  async createPartner(data: PartnerPayload): Promise<Partner> {
    const response = await apiRequest<{ data: Partner }>("/admin/partners", {
      method: "POST",
      body: data,
    });
    return response!.data;
  },

  async updatePartner(id: string, data: Partial<PartnerPayload>): Promise<Partner> {
    const response = await apiRequest<{ data: Partner }>("/admin/partners/" + id, {
      method: "PATCH",
      body: data,
    });
    return response!.data;
  },

  async deletePartner(id: string): Promise<void> {
    await apiRequest("/admin/partners/" + id, { method: "DELETE" });
  },

  async contactInquiries(filters: ContactInquiryFilters = {}): Promise<ContactInquiryList> {
    const query = new URLSearchParams();

    if (filters.page) query.set("page", String(filters.page));
    if (filters.pageSize) query.set("pageSize", String(filters.pageSize));
    if (filters.status) query.set("status", filters.status);
    if (filters.search?.trim()) query.set("search", filters.search.trim());

    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await apiRequest<{ data: ContactInquiryList }>(
      `/admin/contact-inquiries${suffix}`,
    );
    return response!.data;
  },

  async contactInquiry(id: string): Promise<ContactInquiry> {
    const response = await apiRequest<{ data: ContactInquiry }>(
      `/admin/contact-inquiries/${id}`,
    );
    return response!.data;
  },

  async updateContactInquiryStatus(
    id: string,
    status: ContactInquiryStatus,
  ): Promise<ContactInquiry> {
    const response = await apiRequest<{ data: ContactInquiry }>(
      `/admin/contact-inquiries/${id}`,
      { method: "PATCH", body: { status } },
    );
    return response!.data;
  },

  async newsPosts(filters: NewsPostFilters = {}): Promise<NewsPostList> {
    const query = new URLSearchParams();

    if (filters.page) query.set("page", String(filters.page));
    if (filters.pageSize) query.set("pageSize", String(filters.pageSize));
    if (filters.status) query.set("status", filters.status);
    if (filters.categoryId) query.set("categoryId", filters.categoryId);
    if (filters.tagId) query.set("tagId", filters.tagId);
    if (filters.isFeatured !== undefined) {
      query.set("isFeatured", String(filters.isFeatured));
    }
    if (filters.search?.trim()) query.set("search", filters.search.trim());

    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await apiRequest<{ data: NewsPostList }>(
      `/admin/news/posts${suffix}`,
    );
    return response!.data;
  },

  async newsPost(id: string): Promise<NewsPost> {
    const response = await apiRequest<{ data: NewsPost }>(
      `/admin/news/posts/${id}`,
    );
    return response!.data;
  },

  async createNewsPost(data: NewsPostPayload): Promise<NewsPost> {
    const response = await apiRequest<{ data: NewsPost }>("/admin/news/posts", {
      method: "POST",
      body: data,
    });
    return response!.data;
  },

  async updateNewsPost(id: string, data: NewsPostPayload): Promise<NewsPost> {
    const response = await apiRequest<{ data: NewsPost }>(
      `/admin/news/posts/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async updateNewsPostStatus(
    id: string,
    data: NewsPostStatusPayload,
  ): Promise<NewsPost> {
    const response = await apiRequest<{ data: NewsPost }>(
      `/admin/news/posts/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteNewsPost(id: string): Promise<void> {
    await apiRequest(`/admin/news/posts/${id}`, { method: "DELETE" });
  },

  /**
   * `purpose` tells the API whether the file becomes the post cover or another
   * article photo; without it every upload would overwrite the cover.
   */
  async uploadNewsImage(
    newsPostId: string,
    data: {
      file: File;
      alt?: string;
      caption?: string;
      purpose: NewsImagePurpose;
    },
  ): Promise<NewsPostMedia> {
    const body = new FormData();
    body.append("file", data.file);
    body.append("purpose", data.purpose);
    if (data.alt) body.append("alt", data.alt);
    if (data.caption) body.append("caption", data.caption);

    const response = await apiRequest<{ data: NewsPostMedia }>(
      `/admin/news/posts/${newsPostId}/media/images`,
      { method: "POST", body },
    );
    return response!.data;
  },

  /** Also removes the stored object; the cover is never reachable this way. */
  async deleteNewsImage(newsPostId: string, mediaId: string): Promise<void> {
    await apiRequest(`/admin/news/posts/${newsPostId}/media/${mediaId}`, {
      method: "DELETE",
    });
  },

  async newsCategories(): Promise<NewsCategory[]> {
    const response = await apiRequest<{ data: NewsCategory[] }>(
      "/admin/news/categories",
    );
    return response?.data ?? [];
  },

  async createNewsCategory(data: NewsCategoryPayload): Promise<NewsCategory> {
    const response = await apiRequest<{ data: NewsCategory }>(
      "/admin/news/categories",
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateNewsCategory(
    id: string,
    data: Partial<NewsCategoryPayload>,
  ): Promise<NewsCategory> {
    const response = await apiRequest<{ data: NewsCategory }>(
      `/admin/news/categories/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteNewsCategory(id: string): Promise<void> {
    await apiRequest(`/admin/news/categories/${id}`, { method: "DELETE" });
  },

  async newsTags(): Promise<NewsTag[]> {
    const response = await apiRequest<{ data: NewsTag[] }>("/admin/news/tags");
    return response?.data ?? [];
  },

  async createNewsTag(data: NewsTagPayload): Promise<NewsTag> {
    const response = await apiRequest<{ data: NewsTag }>("/admin/news/tags", {
      method: "POST",
      body: data,
    });
    return response!.data;
  },

  async updateNewsTag(
    id: string,
    data: Partial<NewsTagPayload>,
  ): Promise<NewsTag> {
    const response = await apiRequest<{ data: NewsTag }>(
      `/admin/news/tags/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteNewsTag(id: string): Promise<void> {
    await apiRequest(`/admin/news/tags/${id}`, { method: "DELETE" });
  },

  async uploadGalleryImage(
    galleryId: string,
    data: {
      file: File;
      title?: string;
      caption?: string;
      sortOrder?: string;
    },
  ): Promise<GalleryImageItem> {
    const body = new FormData();
    body.append("file", data.file);
    if (data.title) body.append("title", data.title);
    if (data.caption) body.append("caption", data.caption);
    if (data.sortOrder) body.append("sortOrder", data.sortOrder);

    const response = await apiRequest<{ data: GalleryImageItem }>(
      `/admin/galleries/${galleryId}/images`,
      {
        method: "POST",
        body,
      },
    );
    return response!.data;
  },

  async updateGalleryImage(
    id: string,
    data: GalleryImageMetadataPayload,
  ): Promise<GalleryImageItem> {
    const response = await apiRequest<{ data: GalleryImageItem }>(
      `/admin/gallery-images/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await apiRequest(`/admin/gallery-images/${id}`, { method: "DELETE" });
  },

  async uploadGalleryVideo(
    galleryId: string,
    data: {
      file: File;
      title?: string;
      caption?: string;
      sortOrder?: string;
    },
  ): Promise<GalleryVideoItem> {
    const body = new FormData();
    body.append("file", data.file);
    if (data.title) body.append("title", data.title);
    if (data.caption) body.append("caption", data.caption);
    if (data.sortOrder) body.append("sortOrder", data.sortOrder);

    const response = await apiRequest<{ data: GalleryVideoItem }>(
      `/admin/galleries/${galleryId}/videos/upload`,
      {
        method: "POST",
        body,
      },
    );
    return response!.data;
  },

  async createYoutubeGalleryVideo(
    galleryId: string,
    data: GalleryVideoMetadataPayload & { url: string },
  ): Promise<GalleryVideoItem> {
    const response = await apiRequest<{ data: GalleryVideoItem }>(
      `/admin/galleries/${galleryId}/videos/youtube`,
      {
        method: "POST",
        body: data,
      },
    );
    return response!.data;
  },

  async updateGalleryVideo(
    id: string,
    data: GalleryVideoMetadataPayload,
  ): Promise<GalleryVideoItem> {
    const response = await apiRequest<{ data: GalleryVideoItem }>(
      `/admin/gallery-videos/${id}`,
      {
        method: "PATCH",
        body: data,
      },
    );
    return response!.data;
  },

  async deleteGalleryVideo(id: string): Promise<void> {
    await apiRequest(`/admin/gallery-videos/${id}`, { method: "DELETE" });
  },

  galleryImageUrl(image: GalleryImageItem): string {
    return `${env.apiBaseUrl}${image.previewPath}`;
  },

  galleryVideoUrl(video: GalleryVideoItem): string {
    return video.previewPath ? `${env.apiBaseUrl}${video.previewPath}` : video.source;
  },

  galleryImagePublicPath(image: GalleryImageItem): string {
    if (image.path.startsWith("/") || image.path.startsWith("http")) {
      return image.path;
    }
    return `/api/gallery-images/${image.id}/file`;
  },

  galleryVideoPublicPath(video: GalleryVideoItem): string {
    if (video.sourceType === "YOUTUBE") return video.source;
    if (video.source.startsWith("/") || video.source.startsWith("http")) {
      return video.source;
    }
    return `/api/gallery-images/videos/${video.id}/file`;
  },

  publicAssetUrl(path: string): string {
    return path.startsWith("/api/") ? `${env.apiBaseUrl}${path}` : path;
  },
};
