import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1 min — tune per app
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          if (apiError?.status >= 400 && apiError?.status < 500) return false; // don't retry client errors
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
