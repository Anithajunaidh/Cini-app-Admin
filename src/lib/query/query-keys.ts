export const queryKeys = {
  comments: {
    all: ['comments'] as const,
    list: (filters?: Record<string, unknown>) => ['comments', 'list', filters] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: (filters?: Record<string, unknown>) => ['tickets', 'list', filters] as const,
  },
  sync: {
    status: ['sync', 'status'] as const,
  },
} as const;
