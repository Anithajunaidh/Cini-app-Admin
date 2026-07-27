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
    stats: '/api/v1/admin/stats',
    sync: {
      status: '/api/v1/admin/sync/status',
      trigger: '/api/v1/admin/sync/trigger',
    },
    comments: '/api/v1/admin/comments',
    availabilityReports: '/api/v1/admin/availability-reports',
    platforms: {
      list: '/api/v1/admin/platforms',
      detail: (id: string) => `/api/v1/admin/platforms/${id}`,
    },
    users: '/api/v1/admin/users',
  },
} as const;
