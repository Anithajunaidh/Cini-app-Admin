/**
 * Axios instance for authentication routes.
 *
 * Auth endpoints live at the backend root (e.g. http://localhost:4000/auth/login),
 * NOT under the /api/v1 prefix that apiClient uses. This client is intentionally
 * kept simple — no auth interceptor, no token injection — to avoid circular logic
 * during the login/refresh flow itself.
 */
// eslint-disable-next-line import/no-named-as-default-member
import axios from 'axios';
import type { AxiosError } from 'axios';
import { normalizeApiError } from './errors';
import type { ApiErrorResponse } from './errors';

const AUTH_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_BASE_URL
    ? process.env.NEXT_PUBLIC_AUTH_BASE_URL
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000').replace(
        /\/api\/v1\/?$/,
        '',
      );

// eslint-disable-next-line import/no-named-as-default-member
export const authClient = axios.create({
  baseURL: AUTH_BASE,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (response) => response.data,
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  (error: AxiosError<ApiErrorResponse>) => {
    throw normalizeApiError(error);
  },
);
