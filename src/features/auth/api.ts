'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LoginDto } from './types';



/** Stores the access token in both localStorage (for apiClient) and a cookie (for middleware). */
function storeToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
  document.cookie = `access_token=${token}; path=/; SameSite=Lax`;
}

/** Clears all stored auth tokens from localStorage and cookies. */
export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'access_token=; path=/; max-age=0';
}

/**
 * Mutation hook for POST /api/auth/sign-in/email (Better Auth).
 */
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginDto) => {
      // With Next.js rewrites, this requests /api/auth/sign-in/email
      // on the frontend server, which proxies to the backend.
      // Better Auth natively sets the `better-auth.session_token` cookie.
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = 'Invalid email or password.';
        try {
          const body = (await res.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      // We still need to manually set `access_token` so Next.js middleware
      // can read it in `src/proxy.ts` without knowing better-auth's internal cookie name.
      // We'll just set it to a dummy value so middleware knows we are authenticated.
      // (The actual API requests rely on `better-auth.session_token` which was set automatically).
      storeToken('authenticated');
      return true;
    },
    onSuccess: () => {
      router.push('/dashboard');
    },
  });
}

