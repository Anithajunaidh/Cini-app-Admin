import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import { SYNC_STATUS_REFETCH_INTERVAL_MS } from '@/constants/cache';
import type {
  AdminPlatformDto,
  AdminStatsDto,
  CreatePlatformDto,
  SyncStatusDto,
  SyncTriggerResponseDto,
  UpdatePlatformDto,
} from './types';

// =====================================================================
// Stats
// =====================================================================

/** Fetches the dashboard stat counters from GET /admin/stats. */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.stats)) as unknown;
      const payload = res as Record<string, unknown>;
      return (payload['data'] ?? payload) as AdminStatsDto;
    },
    retry: false,
  });
}

// =====================================================================
// Sync status
// =====================================================================

/** Fetches TMDB + availability sync timestamps for the Pulse strip. */
export function useAdminSyncStatus() {
  return useQuery({
    queryKey: queryKeys.admin.syncStatus,
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.sync.status)) as unknown;
      const payload = res as Record<string, unknown>;
      return (payload['data'] ?? payload) as SyncStatusDto;
    },
    // Refetch every 60 seconds so the strip stays fresh.
    refetchInterval: SYNC_STATUS_REFETCH_INTERVAL_MS,
    retry: false,
  });
}

/** Triggers an immediate sync for the given target. Returns 202. */
export function useTriggerSync() {
  return useMutation({
    mutationFn: async (target: 'tmdb' | 'availability') => {
      const res = (await apiClient.post(ENDPOINTS.admin.sync.trigger, {
        target,
      })) as { data: SyncTriggerResponseDto };
      return res.data;
    },
  });
}

// =====================================================================
// Platforms
// =====================================================================

/** Fetches all tracked streaming platforms. */
export function usePlatforms() {
  return useQuery({
    queryKey: queryKeys.admin.platforms.list(),
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.platforms.list)) as unknown;
      const payload = res as Record<string, unknown>;
      const list = Array.isArray(payload) ? payload : (payload['data'] ?? []);
      return list as AdminPlatformDto[];
    },
    retry: false,
  });
}

/** Creates a new streaming platform. Invalidates the platform list. */
export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platform: CreatePlatformDto) => {
      const res = (await apiClient.post(ENDPOINTS.admin.platforms.list, platform)) as {
        data: AdminPlatformDto;
      };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.platforms.all });
    },
  });
}

/** Updates an existing platform by id. Invalidates the platform list. */
export function useUpdatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdatePlatformDto }) => {
      const res = (await apiClient.patch(ENDPOINTS.admin.platforms.detail(id), payload)) as {
        data: AdminPlatformDto;
      };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.platforms.all });
    },
  });
}

/** Deletes a platform by id. Returns 204 or 409 (has subscribers). */
export function useDeletePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.admin.platforms.detail(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.platforms.all });
    },
  });
}
