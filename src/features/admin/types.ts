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

/** Admin role enum used across the users API. */
export type AdminUserRole = 'USER' | 'MODERATOR' | 'ADMIN';

/** Raw reported comment from GET /api/v1/admin/comments */
export type ReportedCommentDto = {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
  parentId?: string | null;
  replyCount?: number;
  isHidden: boolean;
  titleId?: string | null;
  titleName?: string | null;
};

/** Raw availability report from GET /api/v1/admin/availability-reports */
export type AvailabilityReportDto = {
  id: string;
  titleName?: string | null;
  title?: string | null;
  platform: string | null;
  category: string;
  reportedBy: string;
  createdAt?: string;
  reportedAt?: string;
  resolvedAt: string | null;
  resolution: string | null;
};

/** Metadata returned alongside paginated admin list responses. */
export type PaginationMetaDto = {
  total: number;
  page: number;
  limit: number;
};

/** Generic paginated API envelope used by the admin list endpoints. */
export type PaginatedDto<T> = {
  data: T[];
  meta: PaginationMetaDto;
};

/** Raw user row from GET /api/v1/admin/users. */
export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  deletedAt?: string | null;
  createdAt?: string;
  joinedAt?: string;
};

/** Generic paginated admin users response. */
export type PaginatedUsersDto = PaginatedDto<AdminUserDto>;

/** Normalized row used by the Comment Queue page. */
export type AdminCommentRow = {
  id: string;
  text: string;
  hidden: boolean;
  userId: string;
  username: string;
  titleId: string | null;
  titleName: string | null;
  createdAt: string;
  reportedAt: string;
};

/** Normalized row used by the Availability Reports page. */
export type AdminAvailabilityReportRow = {
  id: string;
  title: string;
  platform: string | null;
  category: string;
  reportedBy: string;
  reportedAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolution: string | null;
};

/** Normalized row used by the Users page. */
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  suspended: boolean;
  joinedAt: string;
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
