import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';
import { STALE_TIME_MS, GC_TIME_MS } from '@/constants/cache';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: (failureCount, error) => {
          // Never retry client errors (4xx) or server errors (5xx) — they are
          // deterministic. Only retry network/infra failures (status 0).
          if (error instanceof ApiError && error.status > 0) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
