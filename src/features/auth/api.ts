'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LoginDto } from './types';
import { ACCESS_TOKEN_KEY, AUTH_SIGN_IN_PATH, DASHBOARD_PATH } from '@/constants/api';

/**
 * Stores the Better Auth bearer token in localStorage so apiClient can
 * inject it as `Authorization: Bearer <token>` on every subsequent request.
 * Also sets a cookie so Next.js middleware can detect an authenticated session.
 */
function storeToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; SameSite=Lax`;
}

/** Clears all stored auth tokens from localStorage and cookies. */
export function clearTokens() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0`;
}

/**
 * Mutation hook for POST /api/auth/sign-in/email (Better Auth).
 *
 * Better Auth returns `{ token, user }` in the JSON body. The token is stored
 * in localStorage and forwarded as `Authorization: Bearer <token>` by apiClient.
 */
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginDto) => {
      // Next.js rewrites /api/auth/* → backend /api/auth/*
      const res = await fetch(AUTH_SIGN_IN_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        let message = 'Invalid email or password.';
        try {
          const body = (await res.json()) as { message?: string };
          if (body.message) {
            ({ message } = body);
          }
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      // Better Auth returns { token, user } — store the bearer token so
      // apiClient can attach it as Authorization: Bearer on every API request.
      const body = (await res.json()) as { token?: string; user?: unknown };
      if (body.token) {
        storeToken(body.token);
      }
      return body;
    },
    onSuccess: () => {
      router.push(DASHBOARD_PATH);
    },
  });
}
