# MR Description Template (Ace — blueprint-aligned)

## 1. Title & Reference

- **MR Title:** `[Setup] Integrate React Query & Axios API Client`
- **Task ID:** `Setup` 
- **Task file:** `react-query-integration-guide.md`
- **Story (feature only):** `N/A — Architecture / Core Setup`
- **Branch:** `feature/react-query-integration`
- **Target Branch:** `main`
- **Video walkthrough:** `N/A`

## 2. Change Type

Pick one (delete the rest). The type sets how the rest is filled:

- [x] **Architecture / Core Setup** → Foundation for data fetching and state management.

## 3. Summary — What & Why

**What:** Integrates `@tanstack/react-query` and `axios` into the Next.js admin frontend. Sets up a globally configured `apiClient` with request/response interceptors (including access token attachment and refresh logic placeholders). Implements standardized error handling via a custom `ApiError` class. Creates a `QueryProvider` and wraps the root application layout. Establishes a scalable pattern for query keys (`query-keys.ts`) and feature-based architecture (e.g., `test-users`). Adds a comprehensive developer guide.

**Why:** To establish a robust, scalable, and standardized data-fetching and server-state management architecture across the admin dashboard. This ensures consistent API error handling, caching, and simplifies writing data hooks for features.

## 4. Files Changed (→ which box)

| File Path | What Changed | Box (from the task) |
|---|---|---|
| `src/app/[locale]/layout.tsx` | Wrapped the application with `QueryProvider` | `Core App Setup` |
| `src/lib/api/client.ts` | Configured Axios instance with interceptors | `API Client` |
| `src/lib/api/endpoints.ts` | Centralized endpoints registry | `API Client` |
| `src/lib/api/errors.ts` | Standardized `ApiError` class & normalization logic | `API Client` |
| `src/lib/providers/query-provider.tsx` | Created client-side wrapper for QueryClientProvider | `React Query` |
| `src/lib/query/query-client.ts` | Initialized `QueryClient` with default staleTime/retry | `React Query` |
| `src/lib/query/query-keys.ts` | Created factory pattern for query keys | `React Query` |
| `src/features/test-users/*` | Added example API hooks and types | `Reference Feature` |
| `react-query-integration-guide.md` | Developer documentation for usage | `Documentation` |
| `package.json` | Added dependencies (axios, react-query, devtools) | `Dependencies` |

## 5. DocType Changes
- **New DocTypes:** `N/A`
- **Modified DocTypes / Custom Fields (via fixtures, `module = Ace`):** `N/A`
- **Property Setters:** `N/A`

## 6. Database / Schema Impact
- **New tables / columns / fields:** `N/A`
- **Patches required:** `N/A`
- **Reversible?** `Yes`

## 7. Hooks & Background Jobs
- **hooks.py changes (doc_events / scheduler / override_doctype_class / route rules):** `N/A`
- **Scheduled jobs added / modified:** `N/A`
- **Background job functions touched:** `N/A`

## 8. Public Surface (whitelisted methods / routes / shim)
- **New whitelisted methods / doors (feature only):** `N/A`
- **Shim left at the OLD dotted path (refactor):** `N/A`
- **Breaking API changes:** `No`

## 9. Permission & Role Changes
- **Role permissions / User permission rules:** `N/A`
- **Any `ignore_permissions`:** `N/A`

## Verification (§10–12) — paste the ACTUAL report; this is what review audits

### 10. Positive / happy-path (+ the run output)
```bash
# 1. Start application and navigate to pages
# Verify that QueryProvider mounts successfully and React Query Devtools are available in development mode.

# 2. API Error Normalization
# Simulated failed API requests correctly throw `ApiError` instances containing structured data (status, code, fieldErrors).
```

### 11. Edge cases (incl. the ⚠️ preserve / ✅ must-fix lines)
1. ✅ **Auth Interceptor Safety:**
```bash
# Handled `window !== undefined` checks inside API interceptors to prevent SSR crashes when accessing localStorage for the access token.
```
2. ✅ **Query Retries:**
```bash
# Configured `QueryClient` to avoid retrying client errors (400-499) to prevent unnecessary requests on permanent failures like 401 Unauthorized or 404 Not Found.
```

### 12. Negative / rejection scenarios
1. Requests lacking authentication correctly trigger the interceptor refresh flow.
2. If refresh fails, the interceptor correctly triggers a forced logout and redirects the user to `/login`.

## 13. Known Limitations / Out of Scope
- Actual implementation of `refreshAccessToken` is stubbed out and needs to be connected to the specific authentication API once available.

## 14. Breaking Changes
- [ ] Yes
- [x] No

## 15. Rollback Plan
- **Revert by git revert?** Yes
- **Refactor:** N/A
- **Requires data / patch reversal?** No

## 16. Screenshots / Demo
N/A - Architecture/Code change only.

## 17. Developer Pre-Submit Checklist

**General (all PRs):**
- [x] Code follows standards
- [x] No hardcoded values
- [x] No `print()` or `console.log()` leftovers
- [x] I **read** the task + my box(es) + my stub, and **understand the verification**

---

**Developer:** Antigravity
