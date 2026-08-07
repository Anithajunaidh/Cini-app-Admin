'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '../../lib/api/client';
import { ENDPOINTS } from '../../lib/api/endpoints';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        // Not authenticated
        router.push('/sign-in');
        return;
      }

      try {
        // Verify token and admin role via Better Auth session
        const sessionResponse: any = await apiClient.get(ENDPOINTS.auth.getSession);
        
        const userRole = sessionResponse?.user?.role || sessionResponse?.data?.user?.role;
        const userPermissions = sessionResponse?.user?.permissions || sessionResponse?.data?.user?.permissions || [];
        const isAdmin = userRole === 'admin' || userRole === 'ADMIN' || userPermissions.includes('admin') || userPermissions.includes('ADMIN');

        if (!isAdmin) {
          // Insufficient permissions
          localStorage.removeItem('access_token'); // invalidate session
          router.push('/sign-in?error=unauthorized');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        // Token invalid or expired, or network error
        console.error('Authorization check failed:', error);
        localStorage.removeItem('access_token');
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F1720]">
        <svg
          className="h-8 w-8 animate-spin text-[#4FD1C5]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
