import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { normalizeApiError } from './errors';
import type { ApiErrorResponse } from './errors';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('access_token');
}

async function refreshAccessToken() {
  // call refresh endpoint, store new token
}

function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
}

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- REQUEST INTERCEPTOR ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken(); // implement per your auth strategy
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
  (response) => response,
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
