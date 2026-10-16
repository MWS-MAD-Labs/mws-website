import { apiRequest, publicAssetUrl } from '@/lib/api';

export type PublicVirtualTourSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startSceneId: string | null;
  sceneCount: number;
  publishedAt: string | null;
  updatedAt: string;
};

export type PublicVirtualTourLink = {
  nodeId: string;
  position: {
    yaw: string;
    pitch: string;
  };
  data?: {
    label: string;
  };
};

export type PublicVirtualTourNode = {
  id: string;
  name: string;
  caption: string;
  description?: string;
  panorama: string;
  thumbnail: string;
  data: {
    slug: string;
    initialPosition: {
      yaw: string;
      pitch: string;
    };
  };
  links: PublicVirtualTourLink[];
};

export type PublicVirtualTour = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startNodeId: string;
  nodes: PublicVirtualTourNode[];
  publishedAt: string | null;
  updatedAt: string;
};

export const virtualTourApi = {
  async list(signal?: AbortSignal): Promise<PublicVirtualTourSummary[]> {
    const response = await apiRequest<{ data: PublicVirtualTourSummary[] }>('/api/virtual-tours', {
      signal,
    });
    return response?.data ?? [];
  },

  async get(slug: string, signal?: AbortSignal): Promise<PublicVirtualTour> {
    const response = await apiRequest<{ data: PublicVirtualTour }>(
      `/api/virtual-tours/${encodeURIComponent(slug)}`,
      { signal },
    );

    if (!response?.data) {
      throw new Error('Virtual tour data is unavailable.');
    }

    return {
      ...response.data,
      nodes: response.data.nodes.map((node) => ({
        ...node,
        panorama: publicAssetUrl(node.panorama),
        thumbnail: publicAssetUrl(node.thumbnail),
      })),
    };
  },
};
