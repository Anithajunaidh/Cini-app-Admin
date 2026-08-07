/** All API endpoint paths. Group by resource/domain. */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  testUsers: {
    list: '/users',
  },
  admin: {
    stats: '/admin/stats',
    sync: {
      status: '/admin/sync/status',
      trigger: '/admin/sync/trigger',
    },
    comments: '/admin/comments',
    availabilityReports: '/admin/availability-reports',
    platforms: {
      list: '/admin/platforms',
      detail: (id: string) => `/admin/platforms/${id}`,
    },
    users: '/admin/users',
  },
} as const;
