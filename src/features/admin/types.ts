/** DTO returned by GET /api/v1/admin/stats */
export type AdminStatsDto = {
  totalUsers: number;
  activeUsers: number;
  totalTitles: number;
  totalRatings: number;
  pendingReports: number;
};

/** Source type for needs-attention items */
export type NeedsAttentionSource = 'comment' | 'avail. report' | 'user';

/** A single row in the Dashboard "Needs attention" panel */
export type NeedsAttentionItem = {
  id: string;
  source: NeedsAttentionSource;
  detail: string;
  /** ISO date string for sorting/display */
  createdAt: string;
};

/** Raw reported comment from GET /api/v1/admin/comments */
export type ReportedCommentDto = {
  id: string;
  text: string;
  title: string;
  authorId: string;
  hidden: boolean;
  createdAt: string;
};

/** Raw availability report from GET /api/v1/admin/availability-reports */
export type AvailabilityReportDto = {
  id: string;
  titleName: string;
  platform: string | null;
  category: string;
  reportedBy: string;
  resolvedAt: string | null;
  resolution: string | null;
  createdAt: string;
};

export type SyncStatusDto = {
  /** ISO 8601 string */
  lastTmdbSync: string | null;
  /** Unix epoch seconds */
  lastAvailabilitySync: number | null;
};

/** Trigger sync response: 202 */
export type SyncTriggerResponseDto = {
  target: 'tmdb' | 'availability';
  triggeredAt: string;
};

export type AdminPlatformDto = {
  id: string;
  nameEs: string;
  slug: string;
  subscriberCount: number;
};

export type CreatePlatformDto = {
  nameEs: string;
  slug: string;
  type: 'SVOD' | 'TVOD' | 'AVOD' | 'LINEAR';
};

export type UpdatePlatformDto = {
  nameEs?: string;
  slug?: string;
  type?: 'SVOD' | 'TVOD' | 'AVOD' | 'LINEAR';
};

/** Paginated response from GET /api/v1/admin/comments */
export type PaginatedCommentsDto = {
  data: ReportedCommentDto[];
  total: number;
  page: number;
  limit: number;
};

/** Paginated response from GET /api/v1/admin/availability-reports */
export type PaginatedReportsDto = {
  data: AvailabilityReportDto[];
  total: number;
  page: number;
  limit: number;
};

