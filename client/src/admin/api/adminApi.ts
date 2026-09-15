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

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  images: GalleryImageItem[];
  createdAt: string;
  updatedAt: string;
};

export type GalleryPayload = {
  title: string;
  description?: string | null;
};

export type GalleryImageMetadataPayload = {
  title?: string | null;
  caption?: string | null;
  sortOrder?: number;
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

  galleryImageUrl(image: GalleryImageItem): string {
    return `${env.apiBaseUrl}${image.previewPath}`;
  },
};
