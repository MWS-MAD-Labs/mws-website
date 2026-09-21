import { apiRequest } from "@/lib/api";
import { env } from "@/config/env";
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

export type AdminDashboardData = {
  message: string;
  user: AuthUser;
};

export type CmsUserListItem = {
  id: string;
  centralUserId: string;
  name: string;
  unitId: string;
  isActive: boolean;
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
  roles: CmsRoleListItem[];
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
  galleryId: string | null;
  gallery: GalleryItem | null;
  createdAt: string;
  updatedAt: string;
};

export type OurSchoolPayload = {
  title: string;
  description?: string | null;
  galleryId?: string | null;
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
  programs: AdminAdmissionProgram[];
  galleries: GalleryItem[];
};

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
};

export type AdminCommunityStoriesPagePayload = Omit<
  AdminCommunityStoriesPage,
  "id"
>;

export type AdminNewsPayload = Omit<
  AdminNewsPost,
  "id" | "createdAt" | "updatedAt"
>;

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

export type NewsTag = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count: {
    postTags: number;
  };
};

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

export const adminApi = {
  async dashboard(): Promise<AdminDashboardData> {
    const response = await apiRequest<{ data: AdminDashboardData }>(
      "/admin/dashboard-data",
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

  async updateAdmissions(
    programs: AdminAdmissionProgram[],
  ): Promise<AdminAdmissionsData> {
    const response = await apiRequest<{ data: AdminAdmissionsData }>(
      "/admin/admissions",
      {
        method: "PUT",
        body: { programs },
      },
    );
    return response!.data;
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

  async deleteNewsPost(id: string): Promise<void> {
    await apiRequest(`/admin/news/posts/${id}`, { method: "DELETE" });
  },

  async newsCategories(): Promise<NewsCategory[]> {
    const response = await apiRequest<{ data: NewsCategory[] }>(
      "/admin/news/categories",
    );
    return response?.data ?? [];
  },

  async newsTags(): Promise<NewsTag[]> {
    const response = await apiRequest<{ data: NewsTag[] }>("/admin/news/tags");
    return response?.data ?? [];
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
