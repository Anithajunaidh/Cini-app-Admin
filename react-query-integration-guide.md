# React Query Integration Guide — Next.js 16

**Audience:** Interns / new developers
**Goal:** Every API call in this app must go through one Axios instance (interceptors handle auth + errors centrally), every endpoint must be defined in one place, and all data fetching must use React Query. Follow this doc exactly — no ad-hoc `fetch()` calls, no inline URLs, no per-component try/catch for network errors.

---

## 1. Folder Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Axios instance + interceptors (THE ONLY place axios is configured)
│   │   ├── endpoints.ts       # ALL API endpoint paths, exported as one object
│   │   └── errors.ts          # Custom error class + error normalizer
│   ├── query/
│   │   ├── query-client.ts    # QueryClient instance + default options
│   │   └── query-keys.ts      # Centralized query key factory
│   └── providers/
│       └── query-provider.tsx # "use client" wrapper with QueryClientProvider
├── features/
│   └── users/
│       ├── api.ts             # React Query hooks for this feature only
│       └── types.ts           # TypeScript types/interfaces for this feature
└── app/
    └── ...                    # Pages — call hooks from features/*, nothing else
```

**Rule of thumb:** `lib/api` = *how* we talk to the backend. `features/*/api.ts` = *what* each feature asks for, using hooks. Pages only ever call hooks from `features/*`.

---

## 2. Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools axios
```

---

## 3. The Axios Client (Single Source of Truth)

`src/lib/api/client.ts`

```ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "./errors";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
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
  (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Example: auto-refresh token on 401, retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken(); // implement per your auth strategy
        return apiClient(originalRequest);
      } catch (refreshError) {
        handleLogout(); // clear session, redirect to /login
        return Promise.reject(normalizeApiError(error));
      }
    }

    // Every other error is normalized here, ONCE, centrally.
    return Promise.reject(normalizeApiError(error));
  }
);

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function refreshAccessToken() {
  // call refresh endpoint, store new token
}

function handleLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  }
}
```

**Non-negotiable rule:** Nobody imports `axios` directly anywhere else in the codebase. Everyone imports `apiClient` from this file.

---

## 4. Centralized Error Shape

`src/lib/api/errors.ts`

```ts
import { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeApiError(error: AxiosError<any>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      data?.message ?? "Something went wrong. Please try again.",
      status,
      data?.code,
      data?.errors
    );
  }
  if (error.request) {
    return new ApiError("Network error. Check your connection.", 0, "NETWORK_ERROR");
  }
  return new ApiError(error.message ?? "Unexpected error.", 0, "UNKNOWN_ERROR");
}
```

Every hook, every component, every toast notification reads errors as an `ApiError`. Nobody parses raw Axios error objects outside `client.ts`.

---

## 5. Endpoints File (Single Source of Truth for URLs)

`src/lib/api/endpoints.ts`

```ts
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    create: "/users",
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  orders: {
    list: "/orders",
    detail: (id: string) => `/orders/${id}`,
  },
} as const;
```

**Rules:**
- No string literal URLs anywhere else in the codebase. Ever.
- Group by resource/domain, not by HTTP method.
- Dynamic segments are functions, not string concatenation at the call site.

---

## 6. QueryClient Setup

`src/lib/query/query-client.ts`

```ts
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1 min — tune per app
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          if (apiError?.status >= 400 && apiError?.status < 500) return false; // don't retry client errors
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
```

`src/lib/providers/query-provider.tsx`

```tsx
"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Wrap it once in `app/layout.tsx`:

```tsx
import { QueryProvider } from "@/lib/providers/query-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

> Next.js 16 note: Server Components cannot use hooks. `QueryProvider` must stay a Client Component boundary, and any component calling `useQuery`/`useMutation` must have `"use client"` at the top.

---

## 7. Query Key Factory

`src/lib/query/query-keys.ts`

```ts
export const queryKeys = {
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
};
```

**Rule:** No inline array keys like `["users", id]` inside components. Always pull from `queryKeys`, so invalidation stays consistent app-wide.

---

## 8. Feature-Level API Hooks (Where Interns Do 90% of Their Work)

`src/features/users/types.ts`

```ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}
```

`src/features/users/api.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/query-keys";
import type { User, CreateUserPayload } from "./types";

// ---- READ ----
export function useUsers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(ENDPOINTS.users.list, { params: filters });
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(ENDPOINTS.users.detail(id));
      return data;
    },
    enabled: !!id,
  });
}

// ---- WRITE ----
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const { data } = await apiClient.post<User>(ENDPOINTS.users.create, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
```

**This is the pattern for every feature.** Copy this file as a template for `orders`, `products`, etc.

---

## 9. Using It in a Component

```tsx
"use client";

import { useUsers, useCreateUser } from "@/features/users/api";
import { ApiError } from "@/lib/api/errors";

export function UsersPage() {
  const { data: users, isLoading, isError, error } = useUsers();
  const createUser = useCreateUser();

  if (isLoading) return <p>Loading...</p>;

  if (isError) {
    const apiError = error as ApiError;
    return <p>Error: {apiError.message}</p>;
  }

  return (
    <div>
      {users?.map((u) => (
        <div key={u.id}>{u.name}</div>
      ))}
      <button
        onClick={() =>
          createUser.mutate(
            { name: "New User", email: "new@example.com" },
            { onError: (err) => console.error((err as ApiError).message) }
          )
        }
      >
        Add User
      </button>
    </div>
  );
}
```

No `try/catch` for network calls in components. `isError` / `error` from the hook, or `onError` on mutations, is the only error-handling surface a component ever touches.

---

## 10. Checklist Before Opening a PR

- [ ] No `fetch()` or `axios.get/post(...)` used directly outside `lib/api/client.ts`
- [ ] No hardcoded URL strings — everything pulled from `ENDPOINTS`
- [ ] Every new endpoint added to `endpoints.ts`, grouped under its resource
- [ ] Every query/mutation uses a key from `queryKeys`, not an inline array
- [ ] Every feature has its own `features/<name>/api.ts` and `types.ts`
- [ ] Components only call hooks from `features/*`, never `apiClient` directly
- [ ] Mutations that change server state call `invalidateQueries` for affected keys
- [ ] Errors surfaced via `isError`/`error` (queries) or `onError` (mutations) — no manual try/catch around API calls
- [ ] All new hooks/types have TypeScript interfaces — no `any`
- [ ] `"use client"` present on any component using `useQuery`/`useMutation`

---

## 11. Common Mistakes to Avoid

| Mistake | Why it's wrong | Fix |
|---|---|---|
| Calling `axios.get("/users")` in a component | Bypasses interceptors, auth, error handling | Use `apiClient` via a feature hook |
| Writing `"/users/" + id` inline | Breaks single source of truth | Use `ENDPOINTS.users.detail(id)` |
| `useQuery({ queryKey: ["users"], ... })` inline | Inconsistent keys → broken cache invalidation | Use `queryKeys.users.*` |
| try/catch around `useQuery` data fetching | React Query already tracks error state | Use `isError`/`error` |
| Fetching data in a Server Component with `fetch` then also using React Query client-side for the same data | Two sources of truth, hydration mismatches | Either fully server-fetch or fully React-Query fetch per route; ask a senior dev if unsure |
| Putting API logic directly in a page/component file | Not reusable, hard to test | Always go through `features/<name>/api.ts` |

---

## 12. Adding a New Feature — Step by Step

1. Create `src/features/<feature>/types.ts` with the TS interfaces for that resource.
2. Add all URLs for that resource to `ENDPOINTS` in `lib/api/endpoints.ts`.
3. Add query keys for that resource to `queryKeys` in `lib/query/query-keys.ts`.
4. Create `src/features/<feature>/api.ts` with `useX` (queries) and `useCreateX`/`useUpdateX`/`useDeleteX` (mutations), following section 8.
5. Import and use the hooks in your page/component. Never touch `apiClient` or raw URLs from there.
6. Run through the checklist in section 10 before requesting review.

If something isn't covered here, ask before improvising a new pattern — consistency across the codebase matters more than any individual preference.
