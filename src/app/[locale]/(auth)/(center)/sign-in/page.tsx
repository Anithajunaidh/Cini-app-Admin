'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Better-Auth is mounted at /api/auth in the backend
      const authUrl = 'http://localhost:4000/api/auth/sign-in/email';
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Sign-in failed. Please check your credentials.');
      }

      const data = await response.json();
      
      // Better-Auth with bearer() plugin returns the token in the response payload
      if (data.token) {
        localStorage.setItem('access_token', data.token);
        router.push('/dashboard');
      } else {
        throw new Error('No access token received from backend. Is the bearer() plugin active?');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Sign In
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your admin credentials to access the dashboard.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSignIn}>
          <div className="grid gap-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-200">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent-teal)] px-4 py-2 text-sm font-medium text-[#06231F] hover:bg-[#2E7D74] hover:text-white transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
