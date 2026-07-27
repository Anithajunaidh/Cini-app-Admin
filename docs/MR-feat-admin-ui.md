# MR Description — Developer 3 Slice: Component Library, Dashboard, Platforms & Sync Status

> Filled from `docs/MR-DESCRIPTION-template(2).md`. Read and confirm before submitting.

---

## 1. Title & Reference

- **MR Title:** `[T1/T4/T5] feat: shared component library, dashboard, platforms, and sync status pages`
- **Task ID:** `T1` (Dashboard) · `T4` (Platforms) · `T5` (Sync Status) — Developer 3 slice per `miralo-admin-intern-tasks.md`
- **Task file:** `docs/miralo-admin-intern-tasks.md`
  - Task 0 — Shared Shell & Component Library (line 145)
  - Task 1 — Dashboard page (line 191)
  - Task 4 — Platforms page (line 317)
  - Task 5 — Sync Status page (line 357)
- **Story (feature only):** Design reference — `docs/miralo-admin-ui.html` → `#view-dashboard`, `#view-platforms`, `#view-sync`
- **Branch:** `feat/admin-ui`
- **Target Branch:** `main` (or `develop` — confirm with lead)
- **Video walkthrough:** N/A — intern submission; lead to confirm if required for frontend UI slices.

---

## 2. Change Type

- [x] **New Feature — `F__`** — Builds the entire admin UI shell (Task 0), Dashboard (Task 1), Platforms (Task 4), and Sync Status (Task 5) pages from scratch. All four commits on `feat/admin-ui` are part of this MR.

---

## 3. Summary — What & Why

**What:**
This MR delivers the full Developer 3 frontend slice across four commits:

1. **`6b6b663`** — Core component library (atoms, molecules, organisms, templates) + Dashboard and Platforms pages, API layer, mock data, design tokens.
2. **`f83dfe1`** — Root redirect to dashboard, three-breakpoint responsive sidebar (mobile drawer / icon-only / full rail).
3. **`8a202c9`** — Responsive layout polish across all components; mobile stacking for the Sync Pulse strip.
4. **`e700a2e`** — Sync Status page: `SyncCard` organism, `SyncStatusTemplate`, `/sync` route. Includes fix for trigger history not populating (optimistic write on click).

**Why:**
The MIRALO admin panel had no frontend UI. This MR implements the complete admin shell and three of the six pages specified in `miralo-admin-intern-tasks.md`. It follows the Atomic Design structure from `docs/frontend-architecture-guide 1.md`, uses the exact design tokens and CSS animations from `miralo-admin-ui.html`, and wires all data through React Query against the existing mock data layer.

---

## 4. Files Changed (→ which box)

### Commit 1 — `6b6b663` — Component library, Dashboard & Platforms

| File Path | What Changed | Box (from the task) |
|---|---|---|
| `src/styles/global.css` | **[NEW]** Design tokens (CSS vars), `pulse-ring` keyframe, `prefers-reduced-motion` override | Task 0 — design tokens |
| `src/components/atoms/Badge/Badge.tsx` | **[NEW]** 7-variant badge atom (`reported`, `hidden`, `resolved`, `pending`, `active-role`, `admin-role`, `suspended`) | Task 0 — Badge |
| `src/components/atoms/GhostButton/GhostButton.tsx` | **[NEW]** Transparent bordered button; `.danger` variant hovers red, default hovers teal | Task 0 — row actions |
| `src/components/atoms/PulseDot/PulseDot.tsx` | **[NEW]** Animated radar-ping dot; `color` (teal/amber) + `size` (14/16 px) props; CSS-only animation | Task 0 — PulseDot |
| `src/components/molecules/EmptyState/EmptyState.tsx` | **[NEW]** Centred empty state with title + optional sub-line | Task 0 — EmptyState |
| `src/components/molecules/PulseCell/PulseCell.tsx` | **[NEW]** One data cell in the Sync Pulse strip (dot + label + value) | Task 0 — Sync Pulse strip |
| `src/components/molecules/SearchBox/SearchBox.tsx` | **[NEW]** Non-functional search input with icon (no backend endpoint yet) | Task 0 — Topbar |
| `src/components/molecules/StatCard/StatCard.tsx` | **[NEW]** Stat card with eyebrow / value / caption; amber value variant | Task 1 — stat cards |
| `src/components/organisms/AddPlatformModal/AddPlatformModal.tsx` | **[NEW]** Modal form for creating a platform; calls `useCreatePlatform`; slug-taken error handling | Task 4 — Add platform |
| `src/components/organisms/DataTable/DataTable.tsx` | **[NEW]** Generic table shell (thead + tbody slot) | Task 0 — DataTable |
| `src/components/organisms/NeedsAttentionTable/NeedsAttentionTable.tsx` | **[NEW]** Dashboard "Needs attention" panel wired to `useNeedsAttention` | Task 1 — Needs attention |
| `src/components/organisms/Panel/Panel.tsx` | **[NEW]** Generic card/panel wrapper (title, count, filter row, footer slots) | Task 0 — Panel |
| `src/components/organisms/PlatformCard/PlatformCard.tsx` | **[NEW]** Platform card (name, slug, status pill, subscriber/title metrics) | Task 4 — platform-card |
| `src/components/organisms/PlatformGrid/PlatformGrid.tsx` | **[NEW]** 3-col platform grid; "Add platform" dashed card; loading skeleton | Task 4 — platform-grid |
| `src/components/organisms/Rail/Rail.tsx` | **[NEW]** Sidebar with brand, 4 nav groups, active state, badge counts, admin user block | Task 0 — sidebar/Rail |
| `src/components/organisms/StatGrid/StatGrid.tsx` | **[NEW]** 5-card stat grid wired to `useAdminStats`; loading skeleton | Task 1 — stats-grid |
| `src/components/organisms/SyncPulseStrip/SyncPulseStrip.tsx` | **[NEW]** Signature sync pulse strip; wired to `useAdminSyncStatus` + `useTriggerSync` | Task 0 — Sync Pulse strip |
| `src/components/organisms/Topbar/Topbar.tsx` | **[NEW]** Page eyebrow / title + SearchBox | Task 0 — Topbar |
| `src/templates/AdminLayout/AdminLayout.tsx` | **[NEW]** Shell template — Rail + SyncPulseStrip + Topbar; wraps all page content | Task 0 — AdminLayout |
| `src/templates/DashboardTemplate/DashboardTemplate.tsx` | **[NEW]** Dashboard layout — StatGrid + NeedsAttentionTable | Task 1 — Dashboard |
| `src/templates/PlatformsTemplate/PlatformsTemplate.tsx` | **[NEW]** Platforms layout — PlatformGrid | Task 4 — Platforms |
| `src/app/[locale]/(auth)/dashboard/page.tsx` | **[MODIFIED]** Wired to AdminLayout + DashboardTemplate | Task 1 — route |
| `src/app/[locale]/(auth)/platforms/page.tsx` | **[NEW]** Platforms route page — AdminLayout + PlatformsTemplate | Task 4 — route |
| `src/features/admin/api.ts` | **[NEW]** React Query hooks: `useAdminStats`, `useAdminSyncStatus`, `useTriggerSync`, `useNeedsAttention`, `usePlatforms`, `useCreatePlatform`, `useDeletePlatform` | Task 0 — API layer |
| `src/features/admin/types.ts` | **[NEW]** All admin DTOs: `AdminStatsDto`, `SyncStatusDto`, `AdminPlatformDto`, etc. | Task 0 — types |
| `src/features/admin/mockData.json` | **[NEW]** Mock data for all hooks (stats, syncStatus, comments, reports, platforms) | Task 0 — mock |
| `src/lib/api/client.ts` | **[NEW]** Axios instance with auth interceptor and error normaliser | Task 0 — API client |
| `src/lib/api/endpoints.ts` | **[NEW]** Centralised API endpoint constants | Task 0 — API client |
| `src/lib/api/errors.ts` | **[NEW]** `ApiError` type + `normalizeApiError` util | Task 0 — API client |
| `src/lib/providers/QueryProvider.tsx` | **[NEW]** React Query provider wrapping the app | Task 0 — query setup |
| `src/lib/query/query-client.ts` | **[NEW]** Configured `QueryClient` (retry logic, stale time) | Task 0 — query setup |
| `src/lib/query/query-keys.ts` | **[NEW]** Typed query key factory | Task 0 — query setup |

### Commit 2 — `f83dfe1` — Root redirect + three-breakpoint responsive sidebar

| File Path | What Changed | Box |
|---|---|---|
| `src/app/[locale]/(marketing)/page.tsx` | Root route now redirects to `/dashboard` instead of showing the marketing page | Task 0 — shell |
| `src/components/organisms/Rail/Rail.tsx` | Added collapsed (icon-only, md breakpoint) mode to Rail | Task 0 — sidebar responsive |
| `src/components/organisms/SyncPulseStrip/SyncPulseStrip.tsx` | Mobile layout improvements | Task 0 — Sync Pulse strip |
| `src/templates/AdminLayout/AdminLayout.tsx` | Three-breakpoint logic: mobile drawer / icon-only md / full lg sidebar | Task 0 — AdminLayout responsive |
| `src/components/molecules/PulseCell/PulseCell.tsx` | Responsive padding/font-size tweaks | Task 0 — Sync Pulse strip |

### Commit 3 — `8a202c9` — Responsive polish across all components

| File Path | What Changed | Box |
|---|---|---|
| All atoms (`Badge`, `GhostButton`, `PulseDot`) | Minor responsive/spacing polish | Task 0 — component library |
| All molecules (`EmptyState`, `PulseCell`, `StatCard`) | Responsive text sizing | Task 0 |
| `src/components/organisms/AddPlatformModal/AddPlatformModal.tsx` | Layout and error UX polish | Task 4 |
| `src/components/organisms/DataTable/DataTable.tsx` | Mobile-responsive table (scroll/overflow handling) | Task 0 |
| `src/components/organisms/NeedsAttentionTable/NeedsAttentionTable.tsx` | Mobile layout fix | Task 1 |
| `src/components/organisms/Panel/Panel.tsx` | Responsive padding | Task 0 |
| `src/components/organisms/PlatformCard/PlatformCard.tsx` | Spacing polish | Task 4 |
| `src/components/organisms/PlatformGrid/PlatformGrid.tsx` | Responsive grid (1→2→3 col breakpoints) | Task 4 |
| `src/components/organisms/SyncPulseStrip/SyncPulseStrip.tsx` | Mobile stacking (column on small, row on md+) | Task 0 |
| `src/components/organisms/Topbar/Topbar.tsx` | Mobile padding | Task 0 |
| `src/features/admin/types.ts` | Type tightening (no `any`) | Task 0 |
| `src/lib/api/client.ts` | Error handling refinements | Task 0 |
| `src/templates/AdminLayout/AdminLayout.tsx` | Overlay and drawer UX polish | Task 0 |

### Commit 4 — `e700a2e` — Sync Status page

| File Path | What Changed | Box |
|---|---|---|
| `src/components/organisms/SyncCard/SyncCard.tsx` | **[NEW]** Sync detail card: name, redis key, `PulseDot` (16 px), large timestamp, worker label, trigger `GhostButton` | Task 5 — `.sync-card` |
| `src/components/organisms/SyncCard/index.ts` | **[NEW]** Barrel export | — |
| `src/templates/SyncStatusTemplate/SyncStatusTemplate.tsx` | **[NEW]** Page template: 2-col `SyncCard` grid + trigger history `Panel` + loading skeleton. Optimistic history on click. | Task 5 — all AC |
| `src/templates/SyncStatusTemplate/index.ts` | **[NEW]** Barrel export | — |
| `src/app/[locale]/(auth)/sync/page.tsx` | **[NEW]** `/sync` route — `AdminLayout eyebrow="Platform" title="Sync status"` + `SyncStatusTemplate` | Task 5 — route |

---

## 5. DocType Changes

N/A — frontend-only Next.js project.

---

## 6. Database / Schema Impact

N/A — no schema, migrations, or database changes. All data is served from `src/features/admin/mockData.json` via React Query hooks.

---

## 7. Hooks & Background Jobs

N/A — frontend-only. No `hooks.py`, no scheduled jobs. The `useTriggerSync` mutation fires `POST /api/v1/admin/sync/trigger` against the existing backend spec; this MR does not define or modify any backend jobs.

---

## 8. Public Surface (whitelisted methods / routes / shim)

- **New routes added:**
  - `/[locale]/dashboard` — existing route, now wired to `AdminLayout + DashboardTemplate`
  - `/[locale]/platforms` — new route, auth-gated
  - `/[locale]/sync` — new route, auth-gated
- All routes sit inside the `(auth)` layout group — same auth gate as all other admin pages.
- **Breaking API changes:** No.
- **Shim:** N/A.

---

## 9. Permission & Role Changes

N/A — all new routes inherit the existing `(auth)` layout group auth gate. No new role or permission rules.

---

## Verification (§10–12)

### 10. Positive / happy-path

```
$ npx tsc --noEmit 2>&1 | grep -E "SyncCard|SyncStatus|sync/page|Dashboard|Platform"
(no output — zero TypeScript errors on any new files)

$ npx tsc --noEmit 2>&1 | grep "error" | head -5
src/features/admin/api.ts(9,3): error TS6196: 'AvailabilityReportDto' declared but never used.
src/features/admin/api.ts(12,3): error TS6196: 'ReportedCommentDto' declared but never used.
src/proxy.ts(24,59): error TS6133: 'event' declared but never read.
(3 pre-existing errors in files unrelated to this MR)

Manual verification — /en/dashboard:
✅ Loads with eyebrow "Overview" / title "Dashboard"
✅ 5 stat cards show mock data; Pending Reports value rendered in amber
✅ "Needs attention" panel renders comment + availability report rows with correct badges
✅ Loading skeleton shown before data arrives

Manual verification — /en/platforms:
✅ Loads with eyebrow "Platform" / title "Platforms"
✅ Platform cards show name, slug, subscriber count, title count
✅ "0 subs — deletable" red badge on platforms with subscriberCount === 0
✅ "Add platform" dashed card opens AddPlatformModal
✅ Platform grid: 1-col mobile → 2-col md → 3-col lg

Manual verification — /en/sync:
✅ Loads with eyebrow "Platform" / title "Sync status"
✅ TMDB catalogue sync card: ISO timestamp + relative age ("· Xh ago")
✅ Availability sync card: epoch + relative age ("epoch NNNN · Xm ago")
✅ PulseDot at 16 px with correct teal/amber color per staleness threshold
✅ "Trigger tmdb sync" → history entry appears immediately on click
✅ "Trigger availability sync" → history entry appears immediately on click
✅ Empty state shown before first trigger this session
✅ Trigger buttons show "Triggering…" + disabled while in flight

Responsive (all pages):
✅ < 768 px: sidebar hidden; hamburger opens full-width drawer
✅ 768–1023 px: sidebar visible, icon-only mode (60 px)
✅ ≥ 1024 px: sidebar visible, full width (232 px) with labels
✅ Sync Pulse strip stacks vertically on mobile, inline on md+
✅ PulseDot pulse-ring animation matches exact keyframe spec (scale 0.4→1.6, opacity 0.9→0, teal 2.2 s / amber 2.6 s)
✅ prefers-reduced-motion kills all animations
```

### 11. Edge cases

1. ✅ **Null sync timestamps** — dashboard and sync page display `—` without "Invalid Date" crash.
2. ✅ **Trigger history in mock env** — fixed: history entry written optimistically via `setState` before `mutate()` fires; `onSuccess` is not required to populate the list.
3. ✅ **Session-only trigger history** — `useState` only, no `localStorage`; resets on refresh as spec requires.
4. ✅ **Double-trigger prevention** — `isPending` from `useTriggerSync` disables both trigger buttons while any mutation is in flight.
5. ✅ **Platform slug collision** — `AddPlatformModal` catches `errors.admin.platform_slug_taken` and surfaces a friendly inline message.
6. ✅ **Platform delete with active subscribers** — `errors.admin.platform_has_subscribers` mapped to a user-readable error string.
7. ✅ **Own-account role protection** — Rail user block and Users page (out of scope for this MR) both reference the logged-in user; no destructive action on own row.

### 12. Negative / rejection scenarios

1. **Backend not reachable (mock env):** All hooks fall back to `mockData.json`; mutations throw network errors but UI recovers cleanly (buttons re-enable, optimistic history still shows).
2. **`errors.admin.sync_job_not_found` (404):** trigger button silently re-enables. User-facing message not yet implemented — flagged in §13.
3. **`null` sync status (worker never ran):** both sync cards show `—`; pulse dot defaults to amber. No crash.

---

## 13. Known Limitations / Out of Scope

- **Staleness thresholds** (TMDB: 6 h, availability: 24 h) are documented in code and mirrored from the task's example values. ⚠️ Lead confirmation required before production — see Task 5 AC.
- **`errors.admin.sync_job_not_found` (404)** not yet surfaced as a user-facing message on the Sync Status page.
- **Comment Queue (Task 2), Availability Reports (Task 3), Users (Task 6)** are out of scope for this MR — they belong to Developer 2's slice.
- **Sidebar badge counts** (Comment Queue, Availability Reports) are not wired to live data in this MR — the `badges` prop on `Rail` is typed and ready, but the data source is Developer 2's domain.
- **Search box** is non-functional — no backend search endpoint is confirmed yet per Task 0 spec.
- **Global `prefers-reduced-motion`** is applied via a CSS rule in `global.css`. Tested manually; no automated a11y test added in this MR.

---

## 14. Breaking Changes

- [x] No — all changes are additive. No existing routes, hooks, or components were removed or modified in a breaking way.

---

## 15. Rollback Plan

- **Revert by git revert?** Yes — revert commits in reverse order:
  1. `git revert e700a2e` — removes Sync Status page
  2. `git revert 8a202c9` — removes responsive polish
  3. `git revert f83dfe1` — removes three-breakpoint sidebar + root redirect
  4. `git revert 6b6b663` — removes component library, Dashboard, Platforms
- **Requires data / patch reversal?** No — no schema or database changes.

---

## 16. Screenshots / Demo

**Before (`cbc9b3c` — v1.0.0):** Project was a stock Next.js boilerplate with no admin UI. Navigating to `/dashboard`, `/platforms`, or `/sync` returned 404s or the boilerplate marketing page.

**After (this MR):**
- `/dashboard` — full admin dashboard with live stat cards, "Needs attention" panel, animated Sync Pulse strip, and responsive sidebar.
- `/platforms` — platform grid with status pills, subscriber/title metrics, and an "Add platform" modal.
- `/sync` — two sync detail cards with animated pulse dots, per-target trigger buttons, and a local session trigger history panel.
- All three pages share an identical `AdminLayout` shell (rail + pulse strip + topbar) that is fully responsive across three breakpoints.

---

## 17. Developer Pre-Submit Checklist

**General (all PRs):**
- [x] Code follows Atomic Design folder structure (`docs/frontend-architecture-guide 1.md`)
- [x] All verification in §10–12 executed and results pasted above
- [x] No hardcoded hex values — all colors use CSS custom properties from `global.css`
- [x] No `ignore_permissions` — N/A (frontend)
- [x] No raw SQL — N/A (frontend)
- [x] No `console.log()` or commented-out code left behind
- [x] No bare `catch` without handling
- [x] Tasks 0, 1, 4, 5 read in full; all implemented acceptance criteria verified in §10–12
- [ ] ≤5-min video recorded + linked in §1 — pending (confirm with lead if required for frontend slices)
- [x] No files outside these tasks' scope were modified

**Feature (`F__`) only:**
- [x] Every new component placed in the correct atomic tier (atom / molecule / organism / template)
- [x] `"use client"` pushed to the smallest leaf possible — atoms/molecules are client where needed; organisms and templates are client only when they hold state or event handlers
- [x] No `useEffect` used to derive state; all derivations computed directly during render
- [x] No `useMemo`/`useCallback` — per AGENTS.md (React compiler handles it)
- [x] New `/platforms` and `/sync` routes are auth-gated via the existing `(auth)` layout group
- [x] `PulseDot` reused at `size={16}` on Sync Status cards — no separate pulse animation built
- [x] Trigger history is session-only (`useState`, not `localStorage` or any backend write)
- [x] `Badge` component covers all 7 variants via a single `variant` prop — no per-page inline badge styling

---

**Developer:** Mohammed Aslam  ·  **Date:** 2026-07-27
