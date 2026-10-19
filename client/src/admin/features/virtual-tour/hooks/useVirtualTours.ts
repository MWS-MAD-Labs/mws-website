import { useCallback, useEffect, useState } from 'react';
import {
  adminApi,
  type VirtualTourListItem,
  type VirtualTourPayload,
} from '@/admin/api/adminApi';

export function useVirtualTours() {
  const [tours, setTours] = useState<VirtualTourListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const nextTours = await adminApi.virtualTours();
    setTours(nextTours);
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

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) void retry();
    });

    return () => {
      cancelled = true;
    };
  }, [retry]);

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
    isLoading,
    loadError,
    reload,
    retry,
    saveTour,
    deleteTour,
  };
}
