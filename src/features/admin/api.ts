import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import mockData from './mockData.json';
import type {
  AdminPlatformDto,
  AdminStatsDto,
  AvailabilityReportDto,
  CreatePlatformDto,
  NeedsAttentionItem,
  ReportedCommentDto,
  SyncStatusDto,
  SyncTriggerResponseDto,
} from './types';

// =====================================================================
// Stats
// =====================================================================

/** Fetches the 5 dashboard stat counters. */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => mockData.stats as AdminStatsDto,
  });
}

// =====================================================================
// Sync status
// =====================================================================

/** Fetches TMDB + availability sync timestamps for the Pulse strip. */
export function useAdminSyncStatus() {
  return useQuery({
    queryKey: queryKeys.admin.syncStatus,
    queryFn: async () => mockData.syncStatus as SyncStatusDto,
    // Refetch every 60 seconds so the strip stays fresh
    refetchInterval: 60 * 1000,
  });
}

/** Triggers an immediate sync for the given target. Returns 202. */
export function useTriggerSync() {
  return useMutation({
    mutationFn: async (target: 'tmdb' | 'availability') => {
      const { data } = await apiClient.post<SyncTriggerResponseDto>(ENDPOINTS.admin.sync.trigger, {
        target,
      });
      return data;
    },
    onSuccess: () => {
      // Nothing to invalidate immediately; sync completion updates redis keys
      // which the strip's refetchInterval will pick up.
    },
  });
}

// =====================================================================
// Needs Attention (Dashboard)
// =====================================================================

/** Merges recent reported comments + unresolved availability reports into
 *  the "Needs attention" list, sorted by createdAt descending. */
export function useNeedsAttention() {
  return useQuery({
    queryKey: ['admin', 'needs-attention'] as const,
    queryFn: async () => {
      // const [commentsRes, reportsRes] = await Promise.all([ ... ])

      const commentItems: NeedsAttentionItem[] = mockData.comments.map((c) => ({
        id: c.id,
        source: 'comment',
        detail: c.text,
        createdAt: c.createdAt,
      }));

      const reportItems: NeedsAttentionItem[] = mockData.reports.map((r) => ({
        id: r.id,
        source: 'avail. report',
        detail: `${r.titleName} — marked unavailable on ${r.platform ?? 'unknown'}`,
        createdAt: r.createdAt,
      }));

      return [...commentItems, ...reportItems].toSorted(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
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
    queryFn: async () => mockData.platforms as AdminPlatformDto[],
  });
}

/** Creates a new streaming platform. Invalidates the platform list. */
export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePlatformDto) => {
      const { data } = await apiClient.post<AdminPlatformDto>(
        ENDPOINTS.admin.platforms.list,
        payload,
      );
      return data;
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
