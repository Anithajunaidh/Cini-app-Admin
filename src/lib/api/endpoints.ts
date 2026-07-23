export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  testUsers: {
    list: "/users",
  },
  // Add other domain endpoints here
} as const;
