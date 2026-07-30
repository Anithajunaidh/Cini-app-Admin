import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { normalizeApiError } from './errors';
import type { ApiErrorResponse } from './errors';



async function refreshAccessToken() {
  // Better Auth handles refresh via /api/auth/get-session or token endpoint.
  // If the session cookie is still valid, hitting sign-in again would re-issue a token.
  // For now we throw to let the 401 handler fall through to handleLogout().
  throw new Error('Token refresh not yet implemented — user must sign in again.');
}


function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.location.href = '/sign-in';
  }
}

export const apiClient = axios.create({
  // With Next.js rewrites, we hit the frontend server which proxies to the backend.
  baseURL: '/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are sent on every request
  withCredentials: true,
});

// ---- REQUEST INTERCEPTOR ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (error) => {
    throw error;
  },
);

// ---- RESPONSE INTERCEPTOR ----
apiClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (response) => response.data,
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    // Example: auto-refresh token on 401, retry once
    if (
      originalRequest &&
      error.response?.status === 401 &&
      Reflect.get(originalRequest, '_retry') !== true
    ) {
      Reflect.set(originalRequest, '_retry', true);
      try {
        await refreshAccessToken(); // implement per your auth strategy
        return await apiClient(originalRequest);
      } catch {
        handleLogout(); // clear session, redirect to /login
        throw normalizeApiError(error);
      }
    }

    // Every other error is normalized here, ONCE, centrally.
    throw normalizeApiError(error);
  },
);
