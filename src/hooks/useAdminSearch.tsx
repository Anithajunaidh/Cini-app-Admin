'use client';

import { useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePathname } from '@/libs/I18nNavigation';

type AdminSearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const AdminSearchContext = createContext<AdminSearchContextValue | null>(null);

/**
 * Temporary search context used while the URL-backed provider suspends.
 * @param props - Provider children.
 */
export function AdminSearchFallbackProvider(props: { children: ReactNode }) {
  const [query, setQuery] = useState('');

  return (
    <AdminSearchContext.Provider value={{ query, setQuery }}>
      {props.children}
    </AdminSearchContext.Provider>
  );
}

/**
 * Provides live admin search state shared by the topbar and page tables.
 * Filtering uses the live query; the URL `q` param is updated only after debounce.
 * @param props - Provider children.
 */
export function AdminSearchProvider(props: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 250);

  // Adopt this route's URL `q` when navigating between admin pages.
  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
  }, [pathname]);

  // Keep input/table in sync with browser back/forward.
  useEffect(() => {
    function handlePopState() {
      setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
    }

    window.addEventListener('popstate', handlePopState);
    return function () {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Persist search to the URL without triggering a Next.js navigation cycle.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentQuery = params.get('q') ?? '';

    if (debouncedQuery === currentQuery) {
      return;
    }

    if (debouncedQuery.trim() === '') {
      params.delete('q');
    } else {
      params.set('q', debouncedQuery);
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [debouncedQuery, pathname]);

  return (
    <AdminSearchContext.Provider value={{ query, setQuery }}>
      {props.children}
    </AdminSearchContext.Provider>
  );
}

/**
 * Reads the live admin search query used for filtering tables.
 * @returns Current search query string.
 */
export function useAdminSearchQuery() {
  const context = useContext(AdminSearchContext);

  if (!context) {
    throw new Error('useAdminSearchQuery must be used within AdminSearchProvider');
  }

  return context.query;
}

/**
 * Controls the topbar search input from shared admin search state.
 * @returns Live query value and setter.
 */
export function useAdminSearch() {
  const context = useContext(AdminSearchContext);

  if (!context) {
    throw new Error('useAdminSearch must be used within AdminSearchProvider');
  }

  return context;
}
