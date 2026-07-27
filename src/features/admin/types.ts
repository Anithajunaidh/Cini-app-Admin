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

/** Sync status shape from GET /api/v1/admin/sync/status */
export type SyncStatusDto = {
  /** ISO 8601 string */
  lastTmdbSync: string | null;
  /** Unix epoch seconds */
  lastAvailSync: number | null;
};

/** Trigger sync response: 202 */
export type SyncTriggerResponseDto = {
  target: 'tmdb' | 'availability';
  triggeredAt: string;
};

/** DTO for a single platform */
export type AdminPlatformDto = {
  id: string;
  name: string;
  slug: string;
  subscriberCount: number;
  titleCount: number;
};

/** Payload for creating a new platform */
export type CreatePlatformDto = {
  name: string;
  slug: string;
};

/** Payload for updating a platform */
export type UpdatePlatformDto = {
  name?: string;
  slug?: string;
};
