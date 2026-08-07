/**
 * Sync worker health thresholds (milliseconds).
 *
 * A sync is considered healthy (teal) if its last run is younger than the
 * corresponding threshold; otherwise it is stale (amber).
 */

/** TMDB catalogue sync: healthy if last run < 6 hours ago. */
export const TMDB_SYNC_HEALTH_THRESHOLD_MS = 6 * 60 * 60 * 1_000;

/** Availability sync: healthy if last run < 24 hours ago. */
export const AVAIL_SYNC_HEALTH_THRESHOLD_MS = 24 * 60 * 60 * 1_000;

/** Number of stat cards shown during the loading skeleton. */
export const STAT_SKELETON_COUNT = 5;

/** Route segments that require an authenticated admin session. */
export const PROTECTED_ROUTE_SEGMENTS = [
  '/dashboard',
  '/platforms',
  '/sync',
  '/users',
  '/comments',
  '/reports',
];
