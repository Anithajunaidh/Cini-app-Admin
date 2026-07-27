/** Centralized query key factory. Always use these — never inline array keys. */
export const queryKeys = {
  testUsers: {
    list: () => ['test-users', 'list'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    syncStatus: ['admin', 'sync', 'status'] as const,
    comments: {
      all: ['admin', 'comments'] as const,
      list: (params?: Record<string, unknown>) => ['admin', 'comments', 'list', params] as const,
    },
    availabilityReports: {
      all: ['admin', 'availability-reports'] as const,
      list: (params?: Record<string, unknown>) =>
        ['admin', 'availability-reports', 'list', params] as const,
    },
    platforms: {
      all: ['admin', 'platforms'] as const,
      list: () => ['admin', 'platforms', 'list'] as const,
    },
    users: {
      all: ['admin', 'users'] as const,
      list: (params?: Record<string, unknown>) => ['admin', 'users', 'list', params] as const,
    },
  },
};
