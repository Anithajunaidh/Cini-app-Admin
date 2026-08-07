import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { normalizeApiError } from './errors';
import type { ApiErrorResponse } from './errors';
import { API_BASE_PATH, API_TIMEOUT_MS, ACCESS_TOKEN_KEY, SIGN_IN_PATH } from '@/constants/api';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.location.href = SIGN_IN_PATH;
  }
}

export const apiClient = axios.create({
  // With Next.js rewrites, we hit the frontend server which proxies to the backend.
  baseURL: API_BASE_PATH,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies are sent on every request (Better Auth session cookie fallback)
  withCredentials: true,
});

// ---- REQUEST INTERCEPTOR ----
// Injects Authorization: Bearer <token> on every request.
// Better Auth's bearer() plugin on the backend reads this header to verify the session.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    if (error.response?.status === 401) {
      handleLogout();
    }

    // Every other error is normalized here, ONCE, centrally.
    throw normalizeApiError(error);
  },
);
