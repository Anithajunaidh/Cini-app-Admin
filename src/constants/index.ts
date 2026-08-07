/**
 * Barrel export for all application constants.
 *
 * Consumers should prefer domain-specific imports for tree-shaking, but this
 * barrel is convenient for files that need constants from multiple domains.
 *
 * @example
 * import { STAT_SKELETON_COUNT, TMDB_SYNC_HEALTH_THRESHOLD_MS } from '@/constants';
 */

export * from './api';
export * from './app';
export * from './cache';
