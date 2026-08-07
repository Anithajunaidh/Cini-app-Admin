# Cini Admin — API Layer & Sync Status: Full Technical Reference

---

## 1. Architecture Overview

```
Browser UI Components
  └─ TanStack Query hooks  (src/features/admin/api.ts)
       └─ apiClient        (src/lib/api/client.ts)
            └─ ENDPOINTS   (src/lib/api/endpoints.ts)
                 └─ Next.js rewrite proxy  →  Backend /api/v1/*
```

All state — loading, error, caching — is managed by **TanStack React Query**.  
All HTTP traffic goes through a single **Axios instance** (`apiClient`) with request/response interceptors.  
Query cache keys are defined centrally in `queryKeys` so invalidation is always consistent.

---

## 2. File Map

| File | Role |
|---|---|
| [client.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/client.ts) | Axios instance, interceptors, token refresh, logout |
| [endpoints.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/endpoints.ts) | Single source of truth for every URL path |
| [errors.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/errors.ts) | `ApiError` class + `normalizeApiError` normalizer |
| [query-client.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/query/query-client.ts) | `makeQueryClient()` — retry policy + stale/gc times |
| [query-keys.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/query/query-keys.ts) | Centralized React Query key factory |
| [features/admin/types.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/features/admin/types.ts) | All DTO types for admin API responses |
| [features/admin/api.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/features/admin/api.ts) | Every query + mutation hook consumed by UI |
| [features/admin/mockData.json](file:///home/mohammed-aslam/Cini%20app%20admin/src/features/admin/mockData.json) | Static mock data for offline/dev testing |

---

## 3. HTTP Client — `apiClient`

**File:** [src/lib/api/client.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/client.ts)

```ts
export const apiClient = axios.create({
  baseURL: '/api/v1',        // Next.js rewrites proxy this to the backend
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,     // session cookies sent on every request
});
```

### Request Interceptor
Passes through every config unchanged. Any pre-request error is re-thrown immediately.

### Response Interceptor (the important one)

| Step | What happens |
|---|---|
| **Success** | `response.data` is returned directly — so every `await apiClient.get(…)` resolves to the parsed JSON body, not the full Axios response |
| **401 + not retried** | Calls `refreshAccessToken()` (placeholder — throws immediately), then `handleLogout()` which clears `access_token` from `localStorage` and redirects to `/sign-in` |
| **All other errors** | Passed to `normalizeApiError()` and thrown as an `ApiError` |

> [!IMPORTANT]
> Because the response interceptor returns `response.data`, every query/mutation function must cast the awaited result:
> ```ts
> const res = (await apiClient.get(ENDPOINTS.admin.stats)) as { data: AdminStatsDto };
> return res.data;
> ```
> The outer `{ data }` envelope is the backend's standard `{ data, meta }` wrapper.

---

## 4. Error Handling — `ApiError`

**File:** [src/lib/api/errors.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/errors.ts)

```ts
class ApiError extends Error {
  status: number;        // HTTP status code (0 for network errors)
  code?: string;         // machine-readable error code from backend
  fieldErrors?: Record<string, string[]>;  // validation field errors
}
```

### `normalizeApiError(error: AxiosError)`
| Condition | Result |
|---|---|
| Has `error.response` | Builds `ApiError` from `status` + `data.message` / `data.code` / `data.errors` |
| Has `error.request` (no response) | `ApiError` with status `0` and code `NETWORK_ERROR` |
| Neither | `ApiError` with status `0` and code `UNKNOWN_ERROR` |

---

## 5. Query Client — `makeQueryClient()`

**File:** [src/lib/query/query-client.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/query/query-client.ts)

| Setting | Value | Rationale |
|---|---|---|
| `staleTime` | 60 s | Data considered fresh for 1 minute |
| `gcTime` | 5 min | Cache entry kept 5 minutes after last subscriber |
| `retry` | Skip 4xx; retry up to 2× for 5xx | Never retry client errors |
| `refetchOnWindowFocus` | `false` | Admin panel — no surprise refreshes |
| `mutations.retry` | `0` | Mutations never auto-retry |

---

## 6. Endpoint Definitions

**File:** [src/lib/api/endpoints.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/api/endpoints.ts)

All paths are relative to the `baseURL` of `/api/v1`.

```
/api/v1
├── /auth/login
├── /auth/refresh
├── /auth/logout
├── /users                                   (test users)
└── /admin
    ├── /stats                               ← GET dashboard counters
    ├── /sync
    │   ├── /status                          ← GET sync timestamps
    │   └── /trigger                         ← POST trigger sync
    ├── /comments                            ← GET / PATCH comments
    ├── /availability-reports                ← GET / PATCH reports
    ├── /platforms                           ← GET / POST platforms
    │   └── /:id                             ← PATCH / DELETE platform
    └── /users                               ← GET / PATCH users
        └── /:id/(role|suspend)
```

---

## 7. Query Keys

**File:** [src/lib/query/query-keys.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/lib/query/query-keys.ts)

| Key | Array | Used by |
|---|---|---|
| `queryKeys.admin.stats` | `['admin', 'stats']` | `useAdminStats` |
| `queryKeys.admin.syncStatus` | `['admin', 'sync', 'status']` | `useAdminSyncStatus` |
| `queryKeys.admin.comments.all` | `['admin', 'comments']` | invalidation in hide/unhide |
| `queryKeys.admin.comments.list(params)` | `['admin', 'comments', 'list', params]` | `useAdminComments` |
| `queryKeys.admin.availabilityReports.all` | `['admin', 'availability-reports']` | invalidation in resolve |
| `queryKeys.admin.platforms.all` | `['admin', 'platforms']` | invalidation in create/update/delete |
| `queryKeys.admin.users.all` | `['admin', 'users']` | invalidation in role/suspend |

> [!TIP]
> `.all` keys are the broad parent — invalidating them clears every sub-key (e.g., all page variants of comments). `.list(params)` keys carry params so each unique filter set is cached separately.

---

## 8. All API Hooks (`features/admin/api.ts`)

### 8.1 Dashboard — Stats

| Hook | `useAdminStats()` |
|---|---|
| **Type** | Query |
| **Endpoint** | `GET /api/v1/admin/stats` |
| **Query key** | `['admin', 'stats']` |
| **Returns** | `AdminStatsDto` |
| **Used in** | [StatGrid.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/components/organisms/StatGrid/StatGrid.tsx) |

**`AdminStatsDto`**
```ts
{
  totalUsers: number;
  activeUsers: number;
  totalTitles: number;
  totalRatings: number;
  pendingReports: number;
}
```

---

### 8.2 Sync Status — Queries & Mutations

#### `useAdminSyncStatus()`

| Property | Value |
|---|---|
| **Type** | Query |
| **Endpoint** | `GET /api/v1/admin/sync/status` |
| **Query key** | `['admin', 'sync', 'status']` |
| **Returns** | `SyncStatusDto` |
| **Refetch interval** | Every **60 seconds** automatically |
| **Used in** | [SyncPulseStrip.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/components/organisms/SyncPulseStrip/SyncPulseStrip.tsx), [SyncStatusTemplate.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/templates/SyncStatusTemplate/SyncStatusTemplate.tsx) |

**`SyncStatusDto`**
```ts
{
  lastTmdbSync: string | null;        // ISO 8601 — written by TmdbWorker
  lastAvailabilitySync: number | null; // Unix epoch seconds — written by AvailabilityWorker
}
```

> [!NOTE]
> The two timestamps use different formats deliberately — `lastTmdbSync` is an ISO string (written by the TMDB worker), while `lastAvailabilitySync` is a Unix epoch integer (written by the Availability worker). The frontend handles the conversion difference in its color/display helpers.

#### `useTriggerSync()`

| Property | Value |
|---|---|
| **Type** | Mutation |
| **Endpoint** | `POST /api/v1/admin/sync/trigger` |
| **Request body** | `{ target: 'tmdb' \| 'availability' }` |
| **Returns** | `SyncTriggerResponseDto` (HTTP 202) |
| **Cache invalidation** | None — relies on `refetchInterval` to pick up completion |
| **Used in** | [SyncPulseStrip.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/components/organisms/SyncPulseStrip/SyncPulseStrip.tsx), [SyncStatusTemplate.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/templates/SyncStatusTemplate/SyncStatusTemplate.tsx) |

**`SyncTriggerResponseDto`**
```ts
{
  target: 'tmdb' | 'availability';
  triggeredAt: string; // ISO string of when the trigger was accepted
}
```

---

### 8.3 Dashboard — Needs Attention

#### `useNeedsAttention()`

| Property | Value |
|---|---|
| **Type** | Query |
| **Query key** | `['admin', 'needs-attention']` |
| **Endpoints** | `GET /api/v1/admin/comments?status=reported&limit=2` AND `GET /api/v1/admin/availability-reports?resolved=false&limit=2` (parallel) |
| **Returns** | `NeedsAttentionItem[]` (merged + sorted) |
| **Used in** | [NeedsAttentionTable.tsx](file:///home/mohammed-aslam/Cini%20app%20admin/src/components/organisms/NeedsAttentionTable/NeedsAttentionTable.tsx) |

**Merge logic:**
```
Promise.all([comments, reports])
  → map comments  → NeedsAttentionItem { source: 'comment', detail: c.text, ... }
  → map reports   → NeedsAttentionItem { source: 'avail. report', detail: `${titleName} — marked unavailable on ${platform}`, ... }
  → concat + toSorted(desc by createdAt)
```

---

### 8.4 Platforms

| Hook | Endpoint | Method | Returns |
|---|---|---|---|
| `usePlatforms()` | `/admin/platforms` | GET | `AdminPlatformDto[]` |
| `useCreatePlatform()` | `/admin/platforms` | POST | `AdminPlatformDto` |
| `useUpdatePlatform()` | `/admin/platforms/:id` | PATCH | `AdminPlatformDto` |
| `useDeletePlatform()` | `/admin/platforms/:id` | DELETE | `void` (204) |

All mutations invalidate `queryKeys.admin.platforms.all`.  
Delete returns **409** if the platform has active subscribers.

---

### 8.5 Comments

| Hook | Endpoint | Method | Returns |
|---|---|---|---|
| `useAdminComments(params)` | `/admin/comments` | GET (paginated) | `PaginatedCommentsDto` |
| `useHideComment()` | `/admin/comments/:id/hide` | PATCH | `ReportedCommentDto` |
| `useUnhideComment()` | `/admin/comments/:id/unhide` | PATCH | `ReportedCommentDto` |

**`CommentsParams`**: `{ page?, limit?, status?: 'reported' | 'hidden' | 'all' }`  
Mutations invalidate `queryKeys.admin.comments.all`.

---

### 8.6 Availability Reports

| Hook | Endpoint | Method | Returns |
|---|---|---|---|
| `useAvailabilityReports(params)` | `/admin/availability-reports` | GET (paginated) | `PaginatedReportsDto` |
| `useResolveReport()` | `/admin/availability-reports/:id/resolve` | PATCH | `AvailabilityReportDto` |

**`AvailabilityReportsParams`**: `{ page?, limit?, resolved?: boolean | 'all' }`  
`useResolveReport` payload: `{ resolution?: string }` — the optional resolution note.

---

### 8.7 Users

| Hook | Endpoint | Method | Returns |
|---|---|---|---|
| `useAdminUsers(params)` | `/admin/users` | GET (paginated) | `PaginatedUsersDto` |
| `useChangeUserRole()` | `/admin/users/:id/role` | PATCH | `AdminUserDto` |
| `useSuspendUser()` | `/admin/users/:id/suspend` | PATCH | `AdminUserDto` |

**`UsersParams`**: `{ page?, limit?, role?: UserRole, suspended?: boolean | 'all' }`  
`useChangeUserRole` returns **400** if targeting own account.  
`useSuspendUser` sets `deletedAt` on the backend.

---

## 9. Sync Status — Deep Dive

### How it works end-to-end

```
SyncPulseStrip / SyncStatusTemplate
    │
    ├─ useAdminSyncStatus()  ←── GET /api/v1/admin/sync/status
    │       refetchInterval: 60 000 ms
    │       Returns: { lastTmdbSync: ISO | null, lastAvailabilitySync: epoch | null }
    │
    └─ useTriggerSync()      ←── POST /api/v1/admin/sync/trigger
            Body: { target: 'tmdb' | 'availability' }
            Response: 202 { target, triggeredAt }
            (No immediate cache invalidation — the 60s poll picks up completion)
```

### Color Logic (freshness indicator)

| Signal | Threshold | Color |
|---|---|---|
| TMDB sync | < 6 hours old | 🟢 teal |
| TMDB sync | ≥ 6 hours old or null | 🟡 amber |
| Availability sync | < 24 hours old | 🟢 teal |
| Availability sync | ≥ 24 hours old or null | 🟡 amber |

Both `SyncPulseStrip` and `SyncStatusTemplate` implement these helpers locally (`tmdbSyncColor`, `availSyncColor`) as pure functions so they can be used without shared state.

### Timestamp display format

```
TMDB:         "2026-07-24T12:00:00Z · 3h ago"
Availability: "epoch 1721820000 · 5d ago"
```

`formatRelative(ms)` / `formatRelativeTime(ms)` converts age in ms → `Nm ago` / `Nh ago` / `Nd ago`.

### Optimistic trigger history (SyncStatusTemplate only)

The full **Sync Status page** (`SyncStatusTemplate`) keeps a local session history of triggered syncs in React state. The entry is added **optimistically on click** — before the mutation resolves — so the history row appears immediately even in offline/mock mode:

```ts
function handleTrigger(target: 'tmdb' | 'availability') {
  setHistory((prev) => [
    { localId: Date.now(), target, triggeredAt: new Date().toISOString() },
    ...prev,
  ]);
  triggerSync.mutate(target);  // real API call
}
```

---

## 10. UI Component Chain — Dashboard

```
DashboardTemplate
├── StatGrid              → useAdminStats()
│     └── StatCard × 5   (totalUsers, activeUsers, totalTitles, totalRatings, pendingReports)
│
└── NeedsAttentionTable   → useNeedsAttention()
      └── DataTable rows  (source badge, detail text, relative age, Review button)
```

---

## 11. UI Component Chain — Sync Status

```
SyncStatusTemplate
├── SyncCard ("TMDB catalogue sync")
│     ├── PulseDot (color: teal|amber)
│     ├── Timestamp display
│     └── GhostButton → handleTrigger('tmdb')
│
├── SyncCard ("Availability sync")
│     ├── PulseDot (color: teal|amber)
│     ├── Timestamp display
│     └── GhostButton → handleTrigger('availability')
│
└── Panel ("Trigger history")
      └── Table of session-local trigger entries
            (Target badge | triggeredAt ISO | "202 accepted" badge)

SyncPulseStrip (header strip on every page)
├── PulseCell ("last-tmdb-sync")
├── PulseCell ("last-avail-sync")
└── "Trigger sync" button → triggerSync.mutate('tmdb') + triggerSync.mutate('availability')
```

---

## 12. Route Guard (Middleware)

**File:** [src/proxy.ts](file:///home/mohammed-aslam/Cini%20app%20admin/src/proxy.ts)

Protected segments checked after stripping locale prefix:

```
/dashboard  /platforms  /sync  /users  /comments  /reports
```

In **production**: requires `access_token` cookie — missing → redirect to `/sign-in`.  
In **development**: guard is bypassed for faster iteration.

Arcjet bot-protection runs first (if `ARCJET_KEY` is set), blocking bots except search engines, preview crawlers, and monitors.

---

## 13. Mock Data Reference

**File:** [src/features/admin/mockData.json](file:///home/mohammed-aslam/Cini%20app%20admin/src/features/admin/mockData.json)

```json
{
  "stats":      { totalUsers, activeUsers, totalTitles, totalRatings, pendingReports },
  "syncStatus": { lastTmdbSync: "ISO string", lastAvailSync: "epoch number" },
  "comments":   [ { id, text, title, authorId, hidden, createdAt } ],
  "reports":    [ { id, titleName, platform, category, reportedBy, resolvedAt, resolution, createdAt } ],
  "platforms":  [ { id, name, slug, subscriberCount, titleCount } ]
}
```

> [!NOTE]
> Mock data uses `lastAvailSync` (no `ity`) while the DTO type uses `lastAvailabilitySync`. Keep in mind when wiring up MSW handlers or test fixtures.

---

## 14. Quick Reference — All Endpoints

| Method | Path | Hook | Response DTO |
|---|---|---|---|
| GET | `/api/v1/admin/stats` | `useAdminStats` | `AdminStatsDto` |
| GET | `/api/v1/admin/sync/status` | `useAdminSyncStatus` | `SyncStatusDto` |
| POST | `/api/v1/admin/sync/trigger` | `useTriggerSync` | `SyncTriggerResponseDto` (202) |
| GET | `/api/v1/admin/comments` | `useAdminComments`, `useNeedsAttention` | `PaginatedCommentsDto` |
| PATCH | `/api/v1/admin/comments/:id/hide` | `useHideComment` | `ReportedCommentDto` |
| PATCH | `/api/v1/admin/comments/:id/unhide` | `useUnhideComment` | `ReportedCommentDto` |
| GET | `/api/v1/admin/availability-reports` | `useAvailabilityReports`, `useNeedsAttention` | `PaginatedReportsDto` |
| PATCH | `/api/v1/admin/availability-reports/:id/resolve` | `useResolveReport` | `AvailabilityReportDto` |
| GET | `/api/v1/admin/platforms` | `usePlatforms` | `AdminPlatformDto[]` |
| POST | `/api/v1/admin/platforms` | `useCreatePlatform` | `AdminPlatformDto` |
| PATCH | `/api/v1/admin/platforms/:id` | `useUpdatePlatform` | `AdminPlatformDto` |
| DELETE | `/api/v1/admin/platforms/:id` | `useDeletePlatform` | `void` (204 / 409) |
| GET | `/api/v1/admin/users` | `useAdminUsers` | `PaginatedUsersDto` |
| PATCH | `/api/v1/admin/users/:id/role` | `useChangeUserRole` | `AdminUserDto` |
| PATCH | `/api/v1/admin/users/:id/suspend` | `useSuspendUser` | `AdminUserDto` |
