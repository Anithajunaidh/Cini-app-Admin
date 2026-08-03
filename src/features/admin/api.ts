import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import type {
  AdminPlatformDto,
  AdminStatsDto,
  AdminUserDto,
  AvailabilityReportDto,
  CreatePlatformDto,
  NeedsAttentionItem,
  PaginatedCommentsDto,
  PaginatedReportsDto,
  PaginatedUsersDto,
  ReportedCommentDto,
  ResolveReportDto,
  SyncStatusDto,
  SyncTriggerResponseDto,
  UpdatePlatformDto,
  UserRole,
} from './types';

// =====================================================================
// Stats
// =====================================================================

/** Fetches the 5 dashboard stat counters. */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    // The backend wraps responses in { data, meta }
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.stats)) as { data: AdminStatsDto };
      return res.data;
    },
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
      const res = (await apiClient.get(ENDPOINTS.admin.sync.status)) as { data: SyncStatusDto };
      return res.data;
    },
    // Refetch every 60 seconds so the strip stays fresh.
    refetchInterval: 60 * 1000,
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
      const [commentsRes, reportsRes] = await Promise.all([
        apiClient.get(ENDPOINTS.admin.comments, {
          params: { status: 'reported', limit: 2 },
        }),
        apiClient.get(ENDPOINTS.admin.availabilityReports, {
          params: { resolved: false, limit: 2 },
        }),
      ]);

      const commentItems: NeedsAttentionItem[] = commentsRes.data.map((c: ReportedCommentDto) => ({
        id: c.id,
        source: 'comment' as const,
        detail: c.text,
        createdAt: c.createdAt,
      }));

      const reportItems: NeedsAttentionItem[] = reportsRes.data.map((r: AvailabilityReportDto) => ({
        id: r.id,
        source: 'avail. report' as const,
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
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.platforms.list)) as {
        data: AdminPlatformDto[];
      };
      return res.data;
    },
  });
}

/** Creates a new streaming platform. Invalidates the platform list. */
export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePlatformDto) => {
      const res = (await apiClient.post(ENDPOINTS.admin.platforms.list, payload)) as {
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

// =====================================================================
// Comments
// =====================================================================

type CommentsParams = {
  page?: number;
  limit?: number;
  status?: 'reported' | 'hidden' | 'all';
};

/**
 * Fetches paginated admin comment queue.
 *
 * @param params Query parameters for pagination and status.
 * @returns A query object containing the paginated comments.
 */
export function useAdminComments(params: CommentsParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.comments.list(params),
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.comments, {
        params,
      })) as PaginatedCommentsDto;
      return res;
    },
  });
}

/**
 * Hides a comment by id. Invalidates the comments list.
 *
 * @returns A mutation object to hide the comment.
 */
export function useHideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = (await apiClient.patch(
        `${ENDPOINTS.admin.comments}/${id}/hide`,
      )) as { data: ReportedCommentDto };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all });
    },
  });
}

/**
 * Unhides a comment by id. Invalidates the comments list.
 *
 * @returns A mutation object to unhide the comment.
 */
export function useUnhideComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = (await apiClient.patch(
        `${ENDPOINTS.admin.comments}/${id}/unhide`,
      )) as { data: ReportedCommentDto };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all });
    },
  });
}

// =====================================================================
// Availability Reports
// =====================================================================

type AvailabilityReportsParams = {
  page?: number;
  limit?: number;
  resolved?: boolean | 'all';
};

/**
 * Fetches paginated availability reports.
 *
 * @param params Query parameters for pagination and resolution status.
 * @returns A query object containing the paginated reports.
 */
export function useAvailabilityReports(params: AvailabilityReportsParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.availabilityReports.list(params),
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.availabilityReports, {
        params,
      })) as PaginatedReportsDto;
      return res;
    },
  });
}

/**
 * Resolves an availability report with an optional resolution note.
 *
 * @returns A mutation object to resolve the report.
 */
export function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResolveReportDto }) => {
      const res = (await apiClient.patch(
        `${ENDPOINTS.admin.availabilityReports}/${id}/resolve`,
        payload,
      )) as { data: AvailabilityReportDto };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.availabilityReports.all });
    },
  });
}

// =====================================================================
// Users
// =====================================================================

type UsersParams = {
  page?: number;
  limit?: number;
  role?: UserRole;
  suspended?: boolean | 'all';
};

/**
 * Fetches paginated users list.
 *
 * @param params Query parameters for pagination, role, and suspension status.
 * @returns A query object containing the paginated users.
 */
export function useAdminUsers(params: UsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: async () => {
      const res = (await apiClient.get(ENDPOINTS.admin.users, {
        params,
      })) as PaginatedUsersDto;
      return res;
    },
  });
}

/**
 * Changes a user's role. Returns 400 if targeting own account.
 *
 * @returns A mutation object to change a user's role.
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      const res = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/role`, {
        role,
      })) as { data: AdminUserDto };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
    },
  });
}

/**
 * Suspends a user by id (sets deletedAt).
 *
 * @returns A mutation object to suspend a user.
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/suspend`)) as {
        data: AdminUserDto;
      };
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
    },
  });
}

