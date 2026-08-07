/** DTO returned by GET /api/v1/admin/stats */
export type AdminStatsDto = {
  totalUsers: number;
  activeUsers: number;
  totalTitles: number;
  totalRatings: number;
  pendingReports: number;
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
