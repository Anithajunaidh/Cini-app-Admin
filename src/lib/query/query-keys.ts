/** Centralized query key factory. Always use these — never inline array keys. */
export const queryKeys = {
  testUsers: {
    list: () => ['test-users', 'list'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    syncStatus: ['admin', 'sync', 'status'] as const,
    platforms: {
      all: ['admin', 'platforms'] as const,
      list: () => ['admin', 'platforms', 'list'] as const,
    },
  },
};
