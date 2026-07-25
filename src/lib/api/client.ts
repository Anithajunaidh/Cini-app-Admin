import axios, { type InternalAxiosRequestConfig } from 'axios';
import { Env } from '@/libs/Env';
import { normalizeApiError } from './errors';

export const apiClient = axios.create({
  baseURL: Env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const clerk = (window as any).Clerk;
      if (clerk?.session) {
        try {
          const token = await clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to retrieve authentication token from Clerk:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(normalizeApiError(error));
  },
);
