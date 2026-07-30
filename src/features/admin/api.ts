import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/query-keys';
import { matchSearchQuery } from '@/lib/search/matchSearchQuery';
import adminUsersData from '@/data/admin-users.json';
import mockData from './mockData.json';
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
};

function normalizeCommentRow(comment: ReportedCommentDto): AdminCommentRow {
  return {
    id: comment.id,
    text: comment.text,
    hidden: comment.isHidden,
    userId: comment.userId,
    username: comment.username,
    titleId: comment.titleId ?? null,
    titleName: comment.titleName ?? null,
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

  if (params.status !== 'all') {
    query.hidden = params.status === 'hidden';
  }

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

function mergeRowsById<T extends { id: string }>(rows: T[], patchRows: T[]) {
  const indexById = new Map(rows.map((row, index) => [row.id, index] as const));
  const nextRows = rows.slice();

  for (const patchRow of patchRows) {
    const matchIndex = indexById.get(patchRow.id);

    if (matchIndex === undefined) {
      nextRows.push(patchRow);
      continue;
    }

    nextRows[matchIndex] = patchRow;
  }

  return nextRows;
}

function normalizeMockCommentRow(comment: {
  id: string;
  text: string;
  title: string;
  authorId: string;
  hidden: boolean;
  createdAt: string;
}): AdminCommentRow {
  return {
    id: comment.id,
    text: comment.text,
    hidden: comment.hidden,
    userId: comment.authorId,
    username: comment.authorId,
    titleId: null,
    titleName: comment.title,
    createdAt: comment.createdAt,
    reportedAt: comment.createdAt,
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

function normalizeMockAvailabilityReportRow(report: {
  id: string;
  titleName: string;
  platform: string | null;
  category: string;
  reportedBy: string;
  resolvedAt: string | null;
  resolution: string | null;
  createdAt: string;
}): AdminAvailabilityReportRow {
  return {
    id: report.id,
    title: report.titleName,
    platform: report.platform,
    category: report.category,
    reportedBy: report.reportedBy,
    reportedAt: report.createdAt,
    resolved: report.resolvedAt !== null,
    resolvedAt: report.resolvedAt,
    resolution: report.resolution,
  };
}

const localCommentRows: AdminCommentRow[] = mockData.comments.map(normalizeMockCommentRow);
const localAvailabilityReportRows: AdminAvailabilityReportRow[] = mockData.reports.map(
  normalizeMockAvailabilityReportRow,
);
const localUserRows: AdminUserRow[] = (adminUsersData as AdminUserDto[]).map(normalizeUserRow);

function updateLocalCommentRow(commentId: string, nextHidden: boolean) {
  const updated = localCommentRows.map(function(row) {
    if (row.id !== commentId) {
      return row;
    }

    return {
      ...row,
      hidden: nextHidden,
    };
  });

  localCommentRows.splice(0, localCommentRows.length, ...updated);

  return localCommentRows.find(function(row) {
    return row.id === commentId;
  });
}

function updateLocalAvailabilityReportRow(
  reportId: string,
  nextResolution: string | null,
  nextResolvedAt: string | null,
) {
  const updated = localAvailabilityReportRows.map(function(row) {
    if (row.id !== reportId) {
      return row;
    }

    return {
      ...row,
      resolved: true,
      resolution: nextResolution,
      resolvedAt: nextResolvedAt,
    };
  });

  localAvailabilityReportRows.splice(0, localAvailabilityReportRows.length, ...updated);

  return localAvailabilityReportRows.find(function(row) {
    return row.id === reportId;
  });
}

function updateLocalUserRow(userId: string, patch: Partial<AdminUserRow>) {
  const updated = localUserRows.map(function(row) {
    if (row.id !== userId) {
      return row;
    }

    return {
      ...row,
      ...patch,
    };
  });

  localUserRows.splice(0, localUserRows.length, ...updated);

  return localUserRows.find(function(row) {
    return row.id === userId;
  });
}

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
// Comment queue
// =====================================================================

/** Fetches the admin comment queue with pagination and status filtering. */
export function useAdminComments(params: AdminCommentsQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.comments.list(params),
    queryFn: async () => {
      try {
        const data = (await apiClient.get(ENDPOINTS.admin.comments, {
          params: buildCommentQueryParams(params),
        })) as PaginatedDto<ReportedCommentDto>;

        const normalizedRows = data.data.map(normalizeCommentRow);
        localCommentRows.splice(0, localCommentRows.length, ...mergeRowsById(localCommentRows, normalizedRows));

        const searchQuery = params.query?.trim() ?? '';

        if (searchQuery.length > 0) {
          const filteredRows = localCommentRows.filter(function(comment) {
            if (params.status === 'reported' && comment.hidden) {
              return false;
            }

            if (params.status === 'hidden' && !comment.hidden) {
              return false;
            }

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
      } catch {
        const searchQuery = params.query?.trim() ?? '';
        const fallbackRows = localCommentRows
          .filter(function(comment) {
            if (params.status === 'reported') {
              return !comment.hidden;
            }

            if (params.status === 'hidden') {
              return comment.hidden;
            }

            return true;
          });

        const searchedRows =
          searchQuery.length > 0
            ? fallbackRows.filter(function(comment) {
                return matchSearchQuery(searchQuery, [
                  comment.text,
                  comment.id,
                  comment.userId,
                  comment.titleName,
                  comment.titleId,
                ]);
              })
            : fallbackRows;

        return paginateRows(searchedRows, params.page, params.limit);
      }
    },
  });
}

/** Toggles a comment's hidden state and refreshes the comment lists. */
export function useSetCommentHidden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, hidden }: CommentVisibilityMutation) => {
      try {
        const data = (await apiClient.patch(
          `${ENDPOINTS.admin.comments}/${id}/hide`,
          { hidden },
        )) as ReportedCommentDto;

        const normalized = normalizeCommentRow(data);
        updateLocalCommentRow(id, normalized.hidden);
        return normalized;
      } catch {
        const updated = updateLocalCommentRow(id, hidden);
        if (!updated) {
          throw new Error('Comment not found in local cache.');
        }
        return updated;
      }
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
    queryFn: async () => mockData.syncStatus as SyncStatusDto,
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
      try {
        const data = (await apiClient.get(
          ENDPOINTS.admin.availabilityReports,
          {
            params,
          },
        )) as PaginatedDto<AvailabilityReportDto>;

        const normalizedRows = data.data.map(normalizeAvailabilityReportRow);
        localAvailabilityReportRows.splice(
          0,
          localAvailabilityReportRows.length,
          ...mergeRowsById(localAvailabilityReportRows, normalizedRows),
        );

        const searchQuery = params.query?.trim() ?? '';

        if (searchQuery.length > 0) {
          const filteredRows = localAvailabilityReportRows.filter(function(report) {
            if (params.resolved === 'true' && !report.resolved) {
              return false;
            }

            if (params.resolved === 'false' && report.resolved) {
              return false;
            }

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
      } catch {
        const searchQuery = params.query?.trim() ?? '';
        const fallbackRows = localAvailabilityReportRows.filter(function(report) {
          if (params.resolved === 'true') {
            return report.resolved;
          }

          if (params.resolved === 'false') {
            return !report.resolved;
          }

          return true;
        });

        const searchedRows =
          searchQuery.length > 0
            ? fallbackRows.filter(function(report) {
                return matchSearchQuery(searchQuery, [
                  report.title,
                  report.platform,
                  report.category,
                  report.reportedBy,
                  report.resolution,
                ]);
              })
            : fallbackRows;

        return paginateRows(searchedRows, params.page, params.limit);
      }
    },
  });
}

/** Marks a report resolved and refreshes the availability report lists. */
export function useResolveAvailabilityReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, resolution }: ResolveAvailabilityReportMutation) => {
      try {
        const data = (await apiClient.patch(
          `${ENDPOINTS.admin.availabilityReports}/${id}/resolve`,
          { resolution },
        )) as AvailabilityReportDto;

        const normalized = normalizeAvailabilityReportRow(data);
        updateLocalAvailabilityReportRow(id, normalized.resolution, normalized.resolvedAt);
        return normalized;
      } catch {
        const resolvedAt = new Date().toISOString();
        const updated = updateLocalAvailabilityReportRow(
          id,
          resolution?.trim() ? resolution.trim() : null,
          resolvedAt,
        );

        if (!updated) {
          throw new Error('Availability report not found in local cache.');
        }

        return updated;
      }
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
      try {
        const data = (await apiClient.get(ENDPOINTS.admin.users, {
          params,
        })) as PaginatedUsersDto;

        const normalizedRows = data.data.map(normalizeUserRow);
        localUserRows.splice(0, localUserRows.length, ...mergeRowsById(localUserRows, normalizedRows));

        const searchQuery = params.query?.trim() ?? '';

        if (searchQuery.length > 0) {
          const filteredRows = localUserRows.filter(function(user) {
            if (params.suspended === 'true' && !user.suspended) {
              return false;
            }

            if (params.suspended === 'false' && user.suspended) {
              return false;
            }

            return matchSearchQuery(searchQuery, [user.name, user.email, user.id, user.role]);
          });

          return paginateRows(filteredRows, params.page, params.limit);
        }

        return {
          data: normalizedRows,
          meta: data.meta,
        };
      } catch {
        const searchQuery = params.query?.trim() ?? '';
        const fallbackRows = localUserRows
          .filter(function(user) {
            if (params.suspended === 'true') {
              return user.suspended;
            }

            if (params.suspended === 'false') {
              return !user.suspended;
            }

            return true;
          });

        const searchedRows =
          searchQuery.length > 0
            ? fallbackRows.filter(function(user) {
                return matchSearchQuery(searchQuery, [user.name, user.email, user.id, user.role]);
              })
            : fallbackRows;

        return paginateRows(searchedRows, params.page, params.limit);
      }
    },
  });
}

/** Updates a user's role and refreshes the user list queries. */
export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: UpdateUserRoleMutation) => {
      try {
        const data = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/role`, { role })) as AdminUserDto;
        const normalized = normalizeUserRow(data);
        updateLocalUserRow(id, { role: normalized.role });
        return normalized;
      } catch {
        const updated = updateLocalUserRow(id, { role });
        if (!updated) {
          throw new Error('User not found in local cache.');
        }
        return updated;
      }
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
    mutationFn: async ({ id }: SuspendUserMutation) => {
      const currentUser = localUserRows.find(function(user) {
        return user.id === id;
      });

      if (!currentUser) {
        throw new Error('User not found in local cache.');
      }

      if (!currentUser.suspended) {
        try {
          const data = (await apiClient.patch(`${ENDPOINTS.admin.users}/${id}/suspend`)) as AdminUserDto;
          const normalized = normalizeUserRow(data);
          updateLocalUserRow(id, { suspended: normalized.suspended });
          return normalized;
        } catch {
          const updated = updateLocalUserRow(id, { suspended: true });
          if (!updated) {
            throw new Error('Unable to suspend this user.');
          }
          return updated;
        }
      }

      const updated = updateLocalUserRow(id, { suspended: false });
      if (!updated) {
        throw new Error('Unable to reinstate this user.');
      }
      return updated;
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
      const data = await apiClient.post<AdminPlatformDto>(
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
