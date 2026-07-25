import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api/errors';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          // Don't retry client errors (4xx)
          if (apiError?.status >= 400 && apiError?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
