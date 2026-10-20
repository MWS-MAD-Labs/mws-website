import { useCallback, useEffect, useState } from 'react';

import {
  virtualTourApi,
  type PublicVirtualTour,
  type PublicVirtualTourSummary,
} from '@/api/virtualTourApi';

type RequestState = 'idle' | 'loading' | 'success' | 'error';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Virtual tour could not be loaded.';
}

export function useVirtualTourList() {
  const [tours, setTours] = useState<PublicVirtualTourSummary[]>([]);
  const [status, setStatus] = useState<RequestState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);


  useEffect(() => {
    const controller = new AbortController();

    async function loadTours() {
      setStatus('loading');
      setError(null);

      try {
        const result = await virtualTourApi.list(controller.signal);
        if (controller.signal.aborted) return;
        setTours(result);
        setStatus('success');
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setTours([]);
        setError(errorMessage(loadError));
        setStatus('error');
      }
    }

    void loadTours();
    return () => controller.abort();
  }, [requestVersion]);

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  return { tours, status, error, retry };
}

export function useVirtualTour(slug: string | null) {
  const [tour, setTour] = useState<PublicVirtualTour | null>(null);
  const [status, setStatus] = useState<RequestState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    const requestedSlug = slug;

    async function loadTour() {
      setStatus('loading');
      setError(null);
      setTour(null);

      try {
        const result = await virtualTourApi.get(requestedSlug, controller.signal);
        if (controller.signal.aborted) return;
        setTour(result);
        setStatus('success');
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(errorMessage(loadError));
        setStatus('error');
      }
    }

    void loadTour();
    return () => controller.abort();
  }, [requestVersion, slug]);

  const retry = useCallback(() => setRequestVersion((version) => version + 1), []);

  return { tour, status, error, retry };
}
