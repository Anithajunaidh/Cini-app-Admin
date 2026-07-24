import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { normalizeApiError } from './errors';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- REQUEST INTERCEPTOR ----
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
   async (error) => Promise.reject(error),
);

// ---- RESPONSE INTERCEPTOR ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      handleLogout();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw normalizeApiError(error as AxiosError<any>);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw normalizeApiError(error as AxiosError<any>);
  },
);

function getAccessToken(): string | null {
  if (typeof window === 'undefined') {return null;}
  return localStorage.getItem('access_token');
}

function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.location.href = '/sign-in';
  }
}
