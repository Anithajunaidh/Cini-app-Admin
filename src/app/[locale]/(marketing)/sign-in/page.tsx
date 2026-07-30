'use client';

import { useLogin } from '@/features/auth/api';
import type { ApiError } from '@/lib/api/errors';
import { useState } from 'react';

/**
 * Sign-in page — calls POST /auth/login, stores the token, and
 * redirects to /dashboard on success.
 * Styled with the admin design tokens; full-featured UI is owned by another intern.
 */
export default function SignInPage() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const errorMessage =
    login.error != null
      ? ((login.error as ApiError).message ?? 'Sign-in failed. Check your credentials.')
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-deep)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 22,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            MIRALO Admin
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11.5,
              color: 'var(--text-faint)',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
          >
            Sign in to your account
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="sign-in-email"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              Email
            </label>
            <input
              id="sign-in-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-teal)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="sign-in-password"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
              }}
            >
              Password
            </label>
            <input
              id="sign-in-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                padding: '9px 12px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-teal)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {/* Error */}
          {errorMessage != null && (
            <p
              role="alert"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--accent-red)',
                margin: 0,
              }}
            >
              {errorMessage}
            </p>
          )}

          {/* Submit */}
          <button
            id="sign-in-submit"
            type="submit"
            disabled={login.isPending}
            style={{
              marginTop: 4,
              padding: '10px 0',
              background: 'var(--accent-teal)',
              color: '#0F1720',
              border: 'none',
              borderRadius: 7,
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.3px',
              cursor: login.isPending ? 'not-allowed' : 'pointer',
              opacity: login.isPending ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
