import { useCallback, useEffect, useState } from 'react';
import {
  adminApi,
  type GalleryItem,
  type VirtualTourDetail,
  type VirtualTourLink,
  type VirtualTourLinkPayload,
  type VirtualTourListItem,
  type VirtualTourPayload,
  type VirtualTourScene,
  type VirtualTourScenePayload,
} from '@/admin/api/adminApi';

export function useVirtualTours() {
  const [tours, setTours] = useState<VirtualTourListItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const nextTours = await adminApi.virtualTours();
    setTours(nextTours);
  }, []);

  const reloadGalleries = useCallback(async () => {
    const nextGalleries = await adminApi.galleries();
    setGalleries(nextGalleries);
  }, []);

  const retry = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await reload();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load virtual tours.');
    } finally {
      setIsLoading(false);
    }
  }, [reload]);

  const retryGalleries = useCallback(async () => {
    setIsGalleryLoading(true);
    setGalleryError(null);
    try {
      await reloadGalleries();
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Failed to load Gallery images.');
    } finally {
      setIsGalleryLoading(false);
    }
  }, [reloadGalleries]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        void retry();
        void retryGalleries();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [retry, retryGalleries]);

  const saveTour = useCallback(
    async (tourId: string | null, payload: VirtualTourPayload) => {
      const result = tourId
        ? await adminApi.updateVirtualTour(tourId, payload)
        : await adminApi.createVirtualTour(payload);
      let refreshFailed = false;
      try {
        await reload();
      } catch {
        refreshFailed = true;
      }
      return { result, refreshFailed };
    },
    [reload],
  );

  const deleteTour = useCallback(
    async (tourId: string) => {
      await adminApi.deleteVirtualTour(tourId);
      let refreshFailed = false;
      try {
        await reload();
      } catch {
        refreshFailed = true;
      }
      return { refreshFailed };
    },
    [reload],
  );

  return {
    tours,
    galleries,
    isLoading,
    loadError,
    isGalleryLoading,
    galleryError,
    reload,
    retry,
    retryGalleries,
    saveTour,
    deleteTour,
  };
}

export function useVirtualTourDetail(tourId: string | null, onTourChanged: () => void) {
  const [tour, setTour] = useState<VirtualTourDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!tourId) {
      setTour(null);
      return null;
    }

    const nextTour = await adminApi.virtualTour(tourId);
    setTour(nextTour);
    return nextTour;
  }, [tourId]);

  const retry = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      await reload();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load tour scenes.');
    } finally {
      setIsLoading(false);
    }
  }, [reload]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!tourId) {
        if (!cancelled) {
          setTour(null);
          setLoadError(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) void retry();
    });

    return () => {
      cancelled = true;
    };
  }, [retry, tourId]);

  const afterMutation = useCallback(async () => {
    const results = await Promise.allSettled([reload(), onTourChanged()]);
    return results.some((result) => result.status === 'rejected');
  }, [onTourChanged, reload]);

  const saveScene = useCallback(
    async (scene: VirtualTourScene | null, payload: VirtualTourScenePayload) => {
      if (!tourId) return;
      if (scene) await adminApi.updateVirtualTourScene(tourId, scene.id, payload);
      else await adminApi.createVirtualTourScene(tourId, payload);
      return afterMutation();
    },
    [afterMutation, tourId],
  );

  const deleteScene = useCallback(
    async (sceneId: string) => {
      if (!tourId) return;
      await adminApi.deleteVirtualTourScene(tourId, sceneId);
      return afterMutation();
    },
    [afterMutation, tourId],
  );

  const setStartScene = useCallback(
    async (sceneId: string) => {
      if (!tourId) return;
      await adminApi.updateVirtualTour(tourId, { startSceneId: sceneId });
      return afterMutation();
    },
    [afterMutation, tourId],
  );

  const saveLink = useCallback(
    async (
      fromSceneId: string,
      link: VirtualTourLink | null,
      payload: VirtualTourLinkPayload,
    ) => {
      if (!tourId) return;
      if (link) {
        await adminApi.updateVirtualTourLink(tourId, fromSceneId, link.id, payload);
      } else {
        await adminApi.createVirtualTourLink(tourId, fromSceneId, payload);
      }
      return afterMutation();
    },
    [afterMutation, tourId],
  );

  const deleteLink = useCallback(
    async (fromSceneId: string, linkId: string) => {
      if (!tourId) return;
      await adminApi.deleteVirtualTourLink(tourId, fromSceneId, linkId);
      return afterMutation();
    },
    [afterMutation, tourId],
  );

  return {
    tour,
    isLoading,
    loadError,
    reload,
    retry,
    saveScene,
    deleteScene,
    setStartScene,
    saveLink,
    deleteLink,
  };
}
