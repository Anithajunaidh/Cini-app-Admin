import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import { matchSearchQuery } from '@/lib/search/matchSearchQuery';
import type {
  AdminAvailabilityReportRow,
  AdminCommentRow,
  AdminPlatformDto,
  AdminStatsDto,
  AdminUserDto,
  AdminUserRow,
  AvailabilityReportDto,
  CreatePlatformDto,
  PaginatedDto,
  PaginatedUsersDto,
  NeedsAttentionItem,
  ReportedCommentDto,
  SyncStatusDto,
  SyncTriggerResponseDto,
} from './types';

type CommentStatusFilter = 'reported' | 'hidden' | 'all';
type AvailabilityResolvedFilter = 'false' | 'true' | 'all';

type AdminCommentsQueryParams = {
  page: number;
  limit: number;
  status: CommentStatusFilter;
  query?: string;
};

type AdminAvailabilityReportsQueryParams = {
  page: number;
  limit: number;
  resolved: AvailabilityResolvedFilter;
  query?: string;
};

type CommentVisibilityMutation = {
  id: string;
  hidden: boolean;
};

type ResolveAvailabilityReportMutation = {
  id: string;
  resolution?: string;
};

type AdminUsersQueryParams = {
  page: number;
  limit: number;
  suspended: 'all' | 'true' | 'false';
  query?: string;
};

type UpdateUserRoleMutation = {
  id: string;
  role: AdminUserDto['role'];
};

type SuspendUserMutation = {
  id: string;
  currentlySuspended: boolean;
};

function normalizeCommentRow(comment: any): AdminCommentRow {
  return {
    id: comment.id,
    text: comment.body ?? comment.text ?? '',
    hidden: comment.hidden ?? comment.isHidden ?? false,
    userId: comment.userId,
    username: comment.username ?? 'Unknown User',
    titleId: comment.titleId ?? null,
    titleName: comment.titleName ?? 'Unknown Title',
    createdAt: comment.createdAt,
    reportedAt: comment.createdAt,
  };
}

function normalizeAvailabilityReportRow(
  report: AvailabilityReportDto,
): AdminAvailabilityReportRow {
  const createdAt = report.createdAt ?? report.reportedAt ?? report.resolvedAt ?? new Date().toISOString();

  return {
    id: report.id,
    title: report.titleName ?? report.title ?? 'Untitled report',
    platform: report.platform,
    category: report.category,
    reportedBy: report.reportedBy,
    reportedAt: createdAt,
    resolved: report.resolvedAt !== null,
    resolvedAt: report.resolvedAt,
    resolution: report.resolution,
  };
}

function buildCommentQueryParams(params: AdminCommentsQueryParams) {
  const query: Record<string, string | number | boolean> = {
    page: params.page,
    limit: params.limit,
    status: params.status,
  };

  if (params.query) query.query = params.query;

  return query;
}

function paginateRows<T>(rows: T[], page: number, limit: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: rows.slice(start, start + limit),
    meta: {
      total,
      page: safePage,
      limit,
    },
  };
}

function normalizeUserRow(user: AdminUserDto): AdminUserRow {
  const joinedAt = user.joinedAt ?? user.createdAt ?? new Date().toISOString();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    suspended: user.deletedAt != null,
    joinedAt,
  };
}

// =====================================================================
// Stats
// =====================================================================

/** Fetches the 5 dashboard stat counters. */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      const data = (await apiClient.get(ENDPOINTS.admin.stats)) as AdminStatsDto;
      return data;
    },
  });
}

// =====================================================================
// Comment queue
// =====================================================================

/** Fetches the admin comment queue with pagination and status filtering. */
export function useAdminComments(params: AdminCommentsQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.comments.list(params),
    queryFn: async () => {
      const data = (await apiClient.get(ENDPOINTS.admin.comments, {
        params: buildCommentQueryParams(params),
      })) as PaginatedDto<ReportedCommentDto>;

      const normalizedRows = data.data.map(normalizeCommentRow);
      const searchQuery = params.query?.trim() ?? '';

      if (searchQuery.length > 0) {
        const filteredRows = normalizedRows.filter(function(comment) {
          return matchSearchQuery(searchQuery, [
            comment.text,
            comment.id,
            comment.userId,
            comment.titleName,
            comment.titleId,
          ]);
        });

        return paginateRows(filteredRows, params.page, params.limit);
      }

      return {
        data: normalizedRows,
        meta: data.meta,
      };
    },
  });
}

/** Toggles a comment's hidden state and refreshes the comment lists. */
export function useSetCommentHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hidden }: CommentVisibilityMutation) => {
      const endpoint = hidden ? 'hide' : 'unhide';
      const data = (await apiClient.patch(
        `${ENDPOINTS.admin.comments}/${id}/${endpoint}`,
      )) as ReportedCommentDto;

      return normalizeCommentRow(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all });
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
      const data = (await apiClient.get(ENDPOINTS.admin.sync.status)) as SyncStatusDto;
      return data;
    },
    // Refetch every 60 seconds so the strip stays fresh
    refetchInterval: 60 * 1000,
  });
}

/** Triggers an immediate sync for the given target. Returns 202. */
export function useTriggerSync() {
  return useMutation({
    mutationFn: async (target: 'tmdb' | 'availability') => {
      const data = await apiClient.post<SyncTriggerResponseDto>(ENDPOINTS.admin.sync.trigger, {
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
// Availability reports
// =====================================================================

/** Fetches the admin availability reports with pagination and resolution filtering. */
export function useAdminAvailabilityReports(params: AdminAvailabilityReportsQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.availabilityReports.list(params),
    queryFn: async () => {
      const apiParams: Record<string, string | number | boolean> = {
        page: params.page,
        limit: params.limit,
        resolved: params.resolved,
      };
      if (params.query) apiParams.query = params.query;

      const data = (await apiClient.get(
        ENDPOINTS.admin.availabilityReports,
        {
          params: apiParams,
        },
      )) as PaginatedDto<AvailabilityReportDto>;

      const normalizedRows = data.data.map(normalizeAvailabilityReportRow);
      const searchQuery = params.query?.trim() ?? '';

      if (searchQuery.length > 0) {
        const filteredRows = normalizedRows.filter(function(report) {
          return matchSearchQuery(searchQuery, [
            report.title,
            report.platform,
            report.category,
            report.reportedBy,
            report.resolution,
          ]);
        });

        return paginateRows(filteredRows, params.page, params.limit);
      }

      return {
        data: normalizedRows,
        meta: data.meta,
      };
    },
  });
}

/** Marks a report resolved and refreshes the availability report lists. */
export function useResolveAvailabilityReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, resolution }: ResolveAvailabilityReportMutation) => {
      const data = (await apiClient.patch(
        `${ENDPOINTS.admin.availabilityReports}/${id}/resolve`,
        { resolution },
      )) as AvailabilityReportDto;

      return normalizeAvailabilityReportRow(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.availabilityReports.all });
    },
  });
}

// =====================================================================
// Users
// =====================================================================

/** Fetches the admin user list with pagination and suspension filtering. */
export function useAdminUsers(params: AdminUsersQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: async () => {
      const apiParams: Record<string, string | number | boolean> = {
        page: params.page,
        limit: params.limit,
        suspended: params.suspended,
      };
      if (params.query) apiParams.query = params.query;

      const data = (await apiClient.get(ENDPOINTS.admin.users, {
        params: apiParams,
      })) as PaginatedUsersDto;

      const normalizedRows = data.data.map(normalizeUserRow);
      const searchQuery = params.query?.trim() ?? '';

      if (searchQuery.length > 0) {
        const filteredRows = normalizedRows.filter(function(user) {
          return matchSearchQuery(searchQuery, [user.name, user.email, user.id, user.role]);
        });

        return paginateRows(filteredRows, params.page, params.limit);
      }

      return {
        data: normalizedRows,
        meta: data.meta,
      };
    },
  });
}

/** Updates a user's role and refreshes the user list queries. */
export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: UpdateUserRoleMutation) => {
      const data = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/role`, { role })) as AdminUserDto;
      return normalizeUserRow(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
    },
  });
}

/** Suspends or reinstates a user locally and refreshes the user list queries. */
export function useSuspendAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentlySuspended }: SuspendUserMutation) => {
      if (!currentlySuspended) {
        const data = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/suspend`)) as AdminUserDto;
        return normalizeUserRow(data);
      }

      const data = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/unsuspend`)) as AdminUserDto;
      return normalizeUserRow(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
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
        apiClient.get(ENDPOINTS.admin.comments, { params: { limit: 10, status: 'reported' } }) as Promise<PaginatedDto<ReportedCommentDto>>,
        apiClient.get(ENDPOINTS.admin.availabilityReports, { params: { limit: 10, resolved: 'false' } }) as Promise<PaginatedDto<AvailabilityReportDto>>,
      ]);

      const commentItems: NeedsAttentionItem[] = commentsRes.data.map((c) => ({
        id: c.id,
        source: 'comment',
        detail: c.text ?? '',
        createdAt: c.createdAt,
      }));

      const reportItems: NeedsAttentionItem[] = reportsRes.data.map((r) => ({
        id: r.id,
        source: 'avail. report',
        detail: `${r.titleName ?? r.title ?? 'Untitled report'} — marked unavailable on ${r.platform ?? 'unknown'}`,
        createdAt: r.createdAt ?? r.reportedAt ?? new Date().toISOString(),
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
      const data = (await apiClient.get(ENDPOINTS.admin.platforms.list)) as AdminPlatformDto[];
      return data;
    }
  });
}

/** Creates a new streaming platform. Invalidates the platform list. */
export function useCreatePlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePlatformDto) => {
      const data = (await apiClient.post(
        ENDPOINTS.admin.platforms.list,
        payload,
      )) as AdminPlatformDto;
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
