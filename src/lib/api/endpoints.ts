export const ENDPOINTS = {
  comments: {
    list: '/admin/comments',
    hide: (id: string) => `/admin/comments/${id}/hide`,
  },
  sync: {
    status: '/admin/sync/status',
  },
} as const;
