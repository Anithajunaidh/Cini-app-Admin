# MIRALO Backoffice — Intern Task Breakdown (v2)

**Project:** MIRALO Admin Dashboard (cinia-app)
**Audience:** Fresher / intern frontend developers
**Backend reference:** Task A4 — Admin & Backoffice (NestJS API, spec'd separately)
**Design reference:** `miralo-admin-ui.html` — a working static HTML/CSS reference build. **This file is the source of truth for every color, font, spacing value, class name, and animation below.** When in doubt, open it and check, don't guess.
**Assumed stack:** React + TypeScript, a data-fetching library (React Query/SWR/axios). CSS can be plain CSS Modules, styled-components, or Tailwind config mapped to the tokens below — pick whichever your team already uses, but the **values** must match the reference file exactly.

---

## What changed in v2

The previous version of this doc was written from screenshots alone and had to guess at some details. We now have the actual reference HTML/CSS file, which changes a few things:

1. **Real design tokens** (exact colors, fonts, radii) — see below, no more guessing.
2. **Real component structure and class names** — every shared piece (sidebar, top status strip, panels, tables, badges, buttons, pagination) already exists as working HTML/CSS. Build to match it, don't reinvent it.
3. **The "moving dot" is confirmed and fully spec'd** — it's a CSS animation called `pulse-ring`, not a guess. Exact keyframes are below.
4. **The work is now split across 3 developers**, not done solo in sequence.

---

## Design tokens (copy these exactly)

```css
--bg-deep:        #0F1720;   /* page background */
--surface:        #172230;   /* card/panel/sidebar background */
--surface-raised: #1F2D3D;   /* avatar circle background */
--surface-hover:  #24344680; /* row/nav hover background */
--border:         #263444;   /* default border */
--border-soft:    #1D2A38;   /* subtle divider border */
--text-primary:   #E8EDF2;   /* main text */
--text-muted:     #8CA0B3;   /* secondary text */
--text-faint:     #526376;   /* captions, labels, placeholders */
--accent-amber:      #F0A84B;
--accent-amber-dim:  #F0A84B26;  /* amber at 15% opacity, used as badge background */
--accent-teal:       #4FD1C5;
--accent-teal-dim:   #4FD1C526;
--accent-red:        #E5646A;
--accent-red-dim:    #E5646A22;
--radius: 10px;  /* card/panel corner radius */
```

**Fonts** (Google Fonts — `Space Grotesk`, `Inter`, `IBM Plex Mono`):
- `--font-display: 'Space Grotesk'` — page titles, panel titles, stat numbers, platform/sync card names. Weight 600.
- `--font-body: 'Inter'` — everything else (default body text).
- `--font-mono: 'IBM Plex Mono'` — every label, caption, badge, table header, id, timestamp, and button. This app uses mono type constantly for anything "systemy" — don't default to Inter for these.

**Color meaning is consistent everywhere** — memorize this, it drives every badge/dot/status in the app:
- teal = healthy / active / resolved
- amber = pending / needs attention / stale / reported
- red = suspended / hidden / deletable / danger

**Accessibility:** the stylesheet already includes a `prefers-reduced-motion` override that kills all animations/transitions for users who request it. Keep this in the real build — don't strip it out.

---

## Common components inventory

These are the pieces used on **more than one page**. Build each exactly once as a shared component; every developer imports these rather than rebuilding them. This is pulled directly from the reference file's actual class structure.

| Component | Reference class(es) | Used on | Notes |
|---|---|---|---|
| **Sidebar / Rail** | `.rail`, `.rail-brand`, `.rail-nav`, `.rail-eyebrow`, `.nav-item` (+`.active`), `.nav-badge`, `.rail-foot`, `.rail-admin`, `.rail-avatar` | Every page (shell) | Fixed 232px width, sticky, full viewport height. Grouped nav with 4 uppercase group labels (Overview / Moderation / Platform / People). Active item gets teal-tinted background + teal text + teal border. |
| **Sync Pulse strip** | `.pulse-strip`, `.pulse-cell`, `.pulse-dot-wrap`, `.pulse-dot` (+`.teal`/`.amber`), `.pulse-ring` (+`.amber`), `.pulse-label`, `.pulse-title`, `.pulse-value`, `.pulse-cta`, `.btn-sync` | Every page (shell) | **This is the animated "moving dot" component.** See dedicated section below — it's the visual signature of the whole app, get it pixel- and timing-accurate. |
| **Topbar** | `.topbar`, `.page-eyebrow`, `.page-title`, `.search-box` | Every page (shell) | `page-eyebrow`/`page-title` text changes per page (e.g. "Overview" / "Dashboard", "Moderation" / "Comment queue"). Search box is static/non-functional for now (no backend endpoint yet). |
| **Panel** | `.panel`, `.panel-head`, `.panel-heading`, `.panel-title`, `.panel-count`, `.panel-foot` | Dashboard (Needs attention), Comment Queue, Availability Reports, Users, Sync Status (Trigger history) | The generic card wrapper for anything table- or list-shaped. `.panel-count` is the small gray live count next to the title (e.g. "14 reported"). |
| **Filter tabs** | `.filter-row`, `.chip` (+`.active`) | Comment Queue, Availability Reports, Users | Pill-shaped toggle buttons in a row; exactly one is active at a time. Reference JS shows the toggle logic — simple "remove active from siblings, add to clicked" pattern. |
| **Data table** | `table`/`thead`/`tbody`, `.cell-primary`, `.cell-sub`, `.cell-mono` | Dashboard (Needs attention), Comment Queue, Availability Reports, Users | `.cell-primary` = bold main text in a cell, `.cell-sub` = small dim text underneath (used for ids, resolution notes), `.cell-mono` = monospace styling for ids/dates/counts. |
| **Badge** | `.badge` + one of `.reported` `.hidden` `.resolved` `.pending` `.active-role` `.admin-role` `.suspended` | Everywhere | 7 color variants total — see the exact mapping below. Build this as one component with a `variant` prop, not 7 separate components. |
| **Row actions / ghost button** | `.row-actions`, `.btn-ghost` (+`.danger`) | Everywhere with table rows | Small bordered button, transparent background. `.danger` modifier turns the hover state red (used for "Hide", "Suspend"). Plain `.btn-ghost` hovers teal (used for "Resolve", "View", "Role", "Unhide", "Reinstate"). Disabled state uses inline `opacity:.4; cursor:not-allowed;` plus a `title` tooltip attribute (see Users page, own-row Role button: `title="Cannot change own role"`). |
| **Pagination** | `.pager` (inside `.panel-foot`) | Comment Queue, Availability Reports, Users | Text + two small icon buttons (‹ ›), disabled/dim at the ends. |
| **Empty state** | `.empty-state`, `.empty-state-title`, `.empty-state-sub` | Sync Status (Trigger history) | Reuse this for any other page's "no data" case too (empty comment queue, empty reports, etc.) rather than inventing a new empty state per page. |

### Badge color mapping (exact)

| Class | Background | Text color | Used for |
|---|---|---|---|
| `.reported` | amber-dim | amber | reported comments; CONTENT/REGION category tags on reports |
| `.pending` | amber-dim | amber | "avail. report" source tag on Dashboard |
| `.hidden` | red-dim | red | hidden comment tag |
| `.suspended` | red-dim | red | suspended user status; "0 subs — deletable" platform tag; "user" source tag on Dashboard |
| `.resolved` | teal-dim | teal | resolved report; active user status |
| `.active-role` | muted gray (8CA0B3 at 13% opacity) | muted gray | USER role badge; platform "active" pill |
| `.admin-role` | teal-dim | teal | MODERATOR/ADMIN role badges |

### The Sync Pulse animation (exact spec)

This is the "moving dot" — confirmed from the reference file, not a guess:

```css
.pulse-dot-wrap{ position:relative; width:14px; height:14px; }
.pulse-dot{ width:8px; height:8px; border-radius:50%; position:absolute; top:3px; left:3px; }
.pulse-ring{
  position:absolute; inset:0; border-radius:50%;
  border:1px solid var(--accent-teal);
  animation: pulse-ring 2.2s ease-out infinite;
}
.pulse-ring.amber{ border-color:var(--accent-amber); animation-duration:2.6s; }

@keyframes pulse-ring{
  0%   { transform:scale(0.4); opacity:.9; }
  80%  { transform:scale(1.6); opacity:0; }
  100% { opacity:0; }
}
```

In plain English: a small solid dot sits still in the center, and a ring outline around it continuously scales up from 40% to 160% size while fading out, then resets — like a radar ping / heartbeat pulse, on an infinite loop. Teal version loops every 2.2s, amber version every 2.6s (slightly slower — a small intentional detail, keep it). This exact component is used in **two places**: the top Sync Pulse strip (small, 14px) and the Sync Status page's detail cards (slightly larger, 16px) — same component, different size, so make size a prop.

### Shell behavior note

The reference file is a single static page that shows/hides `.view` sections via JS (`showView()`) rather than real page navigation, and updates the topbar's `page-eyebrow`/`page-title` text on each switch. In the real React app this maps to actual routing (one route per page) — the important part to carry over is that **every page shares the exact same rail + pulse strip + topbar**, and only the topbar's title/eyebrow text and the `.content` area change.

---

## Developer split

3 developers, split so each owns a coherent, mostly-independent slice. **Developer 1 must finish the shared shell/components first** — the other two are blocked on it for real integration, though they can start building their pages against static/mock data in parallel and swap in the real shared components once ready.

| Developer | Owns | Depends on |
|---|---|---|
| **Developer 1** | Shared Shell & Component Library (Task 0) → then Dashboard (Task 1) | none |
| **Developer 2** | Comment Queue (Task 2) + Availability Reports (Task 3) | Task 0 |
| **Developer 3** | Platforms (Task 4) + Sync Status (Task 5) + Users (Task 6) | Task 0 |

Why this split: Task 0 is the heaviest single piece of work (it's the whole design system), so pairing it with the lightest page (Dashboard) balances Developer 1's total load against the other two. Comment Queue and Availability Reports are near-identical in shape (filter tabs + table + one action button), so they go to the same person for speed and consistency. Platforms, Sync Status, and Users are more varied but each individually smaller, and none of them block each other.

**Suggested sequencing:**
1. Day 1: Developer 1 builds Task 0. Developer 2 and 3 review the reference file and this doc, and can scaffold their pages with fake/static data against the reference HTML directly (no need to wait idle).
2. Once Task 0's components are ready (even before every acceptance box is checked — a rough-but-usable first pass is fine), Developer 2 and 3 swap their static scaffolds over to the real shared components.
3. Developer 1 moves on to Dashboard once Task 0 is stable.
4. End of sprint: a short review pass where all 3 developers check every page against its acceptance criteria together, since inconsistencies between pages are the most common bug at this stage (e.g. one dev's badge colors drifting from the shared component).

---

## How to use this document

Each task has the same 6 sections: **Goal**, **What it looks like**, **API you'll call**, **Steps**, **Acceptance criteria** (a checklist — not done until every box is checked), **Watch out for** (common fresher mistakes).

If anything is unclear, ask your lead before guessing — especially anything marked ⚠️.

---

# Developer 1 — Foundation & Dashboard

## Task 0 — Shared Shell & Component Library

**Size:** M | **Depends on:** none | **Blocks:** Developer 2 and Developer 3

### Goal
Build every shared piece listed in the "Common components inventory" above: the sidebar, the Sync Pulse strip (with the real pulse animation), the topbar, and the reusable Panel / Badge / DataTable / FilterTabs / Pagination / EmptyState components. Everyone else builds on top of this.

### What it looks like
See the **Common components inventory** and **Sync Pulse animation** sections above — this task is literally "build those, exactly as specced, as real reusable components."

### API you'll call
- `GET /api/v1/admin/sync/status` → powers the Sync Pulse strip's two cells. Dot color depends on staleness — ⚠️ confirm the exact "stale" threshold with your lead (reference shows tmdb as teal/healthy at 3h old and availability as amber/stale at 41m old, so it is not simply "the more recent one is always teal" — clarify the real rule before hardcoding a number).
- The pulse strip's single "Trigger sync" button (`.btn-sync`) has no defined behavior in the reference file (it's static markup only). ⚠️ Confirm with your lead: does it open a target picker and call `POST /admin/sync/trigger` directly, or does it just navigate to the Sync Status page where the real per-target trigger buttons live? The simpler option (navigate to Sync Status) is recommended unless your lead says otherwise.
- Global search box: no backend endpoint exists yet. Build it as a non-functional input for now.

### Steps
1. Set up the design tokens (CSS variables/theme file) exactly as listed above — do this first, everything else depends on it.
2. Build the sidebar (`Rail`) component: brand block, 4 nav groups, active-state styling, badge counts (wired later), bottom user block.
3. Build the `PulseDot` component (the animated indicator) in isolation first — get the animation timing and easing exactly right before using it anywhere, since it's reused in two places at two sizes.
4. Build the Sync Pulse strip using `PulseDot` + the two data cells + the trigger button.
5. Build the Topbar (eyebrow/title props + search box).
6. Build `Panel`, `Badge` (with all 7 variants), `DataTable`, `FilterTabs`, `Pagination`, `EmptyState` as standalone components — test each with fake data before wiring anything real.
7. Wire `GET /admin/sync/status` into the Sync Pulse strip.
8. Assemble everything into a single `AdminLayout` component that wraps page content.
9. Publish/share this early (even before 100% polished) so Developer 2 and 3 can start integrating.

### Acceptance criteria
- [ ] All design tokens match the reference file's exact values (colors, fonts, radius) — spot-check a few with a color picker against the reference HTML rendered in a browser.
- [ ] Sidebar renders all 6 nav items in the correct 4 groups; active item shows teal background + teal text + teal border, matching the reference.
- [ ] Comment queue and Availability reports nav items show a live numeric badge from real data (not hardcoded).
- [ ] Bottom-of-sidebar user block shows the logged-in user's real name/role from auth context.
- [ ] `PulseDot` animation matches the exact keyframe spec above (scale 0.4→1.6, opacity 0.9→0, teal=2.2s / amber=2.6s, ease-out, infinite) and respects `prefers-reduced-motion`.
- [ ] `PulseDot` works correctly at both sizes used in the app (14px in the strip, 16px on Sync Status cards) via a prop, not two separate components.
- [ ] Sync Pulse strip shows live data from `GET /admin/sync/status`, correctly formatted.
- [ ] `Badge` component supports all 7 variants from the color mapping table via a single `variant` prop.
- [ ] `Panel`, `DataTable`, `FilterTabs`, `Pagination`, `EmptyState` are built as standalone, reusable, typed components — not copy-pasted per page later.
- [ ] `AdminLayout` wraps page content and renders rail + pulse strip + topbar consistently.
- [ ] Reduced-motion users see zero animation anywhere pulse/transition classes are used.

### Watch out for
- Don't hardcode sidebar badge counts — they must come from the same data the actual Comment Queue / Availability Reports pages use.
- The pulse animation is the single most visible "polish" detail in this whole app — don't approximate it with a generic CSS pulse you already know; match the actual keyframe values above.
- Keep every color as a token/variable, never a one-off hex value, so a later design tweak doesn't mean hunting through every component.

---

## Task 1 — Dashboard (Overview) Page

**Size:** M | **Depends on:** Task 0

### Goal
The landing page after login. Shows 5 stat cards and a "Needs attention" panel combining recent items from moderation and user management.

### What it looks like
- Topbar: eyebrow "Overview", title "Dashboard".
- `.stats-grid` of 5 `.stat-card`s: Total users (18,204 — "across USER / MODERATOR / ADMIN"), Active users (6,417 — "session in last 30 days"), Total titles (9,882 — "synced from TMDB"), Total ratings (44,590 — "user-submitted"), Pending reports (7, shown in **amber** via `.stat-value.amber` — "resolved_at IS NULL"). Each card: small mono uppercase eyebrow label, big display-font number, small muted caption.
- A `Panel` titled "Needs attention" with a live count (e.g. "3 items"), containing a `DataTable` with columns Source / Detail / Age / (action). SOURCE is a `Badge`: `comment` (`.reported` amber), `avail. report` (`.pending` amber), `user` (`.suspended` red). DETAIL is `.cell-primary` text. AGE is `.cell-mono`. Action column has a "Review" `.btn-ghost`.

### API you'll call
- `GET /api/v1/admin/stats` → `{ totalUsers, activeUsers, totalTitles, totalRatings, pendingReports }` → maps directly to the 5 stat cards. Note: only the Pending Reports card uses the amber value color — the other 4 use the default text color.
- ⚠️ "Needs attention" has **no single dedicated endpoint**. Build it by combining the top 1–2 most recent items from `GET /admin/comments?status=reported&limit=1..2` and `GET /admin/availability-reports?resolved=false&limit=1..2`. Recently-requested role changes (the "user" row) aren't covered by any current endpoint — confirm with your lead whether to stub this row or omit it until the backend adds support.
- Clicking "Review" on **any** row (regardless of SOURCE) navigates to the **Comment Queue page** — confirmed behavior, not conditional per source.

### Steps
1. Build the `.stats-grid` using `StatCard`, wired to `GET /admin/stats`. Remember: only Pending Reports gets the amber value styling.
2. Build the "Needs attention" `Panel` + `DataTable` shell.
3. Fetch reported comments + unresolved reports, take the most recent 1–2 of each, merge and sort by age.
4. Apply the correct `Badge` variant per SOURCE type.
5. Wire every "Review" button to navigate to Comment Queue (fixed destination).

### Acceptance criteria
- [ ] All 5 stat cards show live numbers from `GET /admin/stats`.
- [ ] Only the Pending Reports card's value renders in amber; the other 4 use standard text color.
- [ ] Captions match the reference text exactly (don't invent new wording).
- [ ] "Needs attention" panel's count in the header matches the real number of rendered rows.
- [ ] SOURCE badges use the correct variant per type (`comment`→reported/amber, `avail. report`→pending/amber, `user`→suspended/red).
- [ ] AGE shows human-friendly relative time ("2h", "6h", "1d").
- [ ] Every "Review" button navigates to Comment Queue, with no per-row conditional routing.
- [ ] Loading and empty states are handled (skeleton while `GET /admin/stats` loads; friendly empty state — reuse `EmptyState` from Task 0 — if nothing needs attention).

### Watch out for
- Don't flash "0" before the real numbers load — use a skeleton/placeholder state instead.
- The "Needs attention" list is a client-side merge of two API calls sorted by recency — you do need light sorting logic, the API won't hand you this pre-merged.

---

# Developer 2 — Moderation

## Task 2 — Comment Queue Page

**Size:** S/M | **Depends on:** Task 0

### Goal
Let admins review reported comments and hide/unhide them.

### What it looks like
- Topbar: eyebrow "Moderation", title "Comment queue".
- `Panel` titled "Comment queue", live count caption (e.g. "14 reported").
- `FilterTabs`: Reported (default active) / Hidden / All.
- `DataTable` columns: Comment (`.cell-primary` quoted text + `.cell-sub` showing `id: c_xxxxx`, and for hidden comments a `.hidden` badge appended after the id), Author (`.cell-mono` user id), Title, Reported (`.cell-mono` relative age), action (`.btn-ghost.danger` "Hide" for visible comments, plain `.btn-ghost` "Unhide" for hidden ones).
- `Pagination` footer: "Page X of Y".

### API you'll call
- `GET /api/v1/admin/comments?page=1&limit=20&status=reported|hidden|all` (default `status=reported`) → `PaginatedCommentsDto`.
- `PATCH /api/v1/admin/comments/:id/hide` → `{ id, hidden: true }`
- `PATCH /api/v1/admin/comments/:id/unhide` → `{ id, hidden: false }`

### Steps
1. Build the page shell (Panel + FilterTabs wired to `status` query param).
2. Render `DataTable` with comment text, id, hidden badge when applicable, author, title, age.
3. Wire "Hide"/"Unhide" (`.btn-ghost.danger` vs `.btn-ghost`) to their PATCH calls; update the row without requiring a manual refresh.
4. Wire `Pagination` to `page`/`limit`.

### Acceptance criteria
- [ ] Default view on load is `status=reported`.
- [ ] Switching `FilterTabs` refetches and shows the correctly filtered set.
- [ ] Panel count reflects the real total for the current filter.
- [ ] "Hide" (danger-styled) shown only for non-hidden comments; "Unhide" (plain) only for hidden ones.
- [ ] After Hide/Unhide, UI updates without a manual page refresh.
- [ ] Hidden comments show the `.hidden` badge next to their id.
- [ ] Pagination behaves correctly (disabled at ends, correct "Page X of Y" text).
- [ ] Empty state (no reported comments) uses the shared `EmptyState` component.
- [ ] Error state on a failed PATCH shows a message, not a silent failure.

### Watch out for
- The comment text already includes quotation marks in the design — don't double up if the API also returns quotes.
- Keep the sidebar's "Comment queue" badge count in sync with this page's `status=reported` total (Developer 1 built the badge, but the data source is this page's domain — flag any mismatch early).

---

## Task 3 — Availability Reports Page

**Size:** S/M | **Depends on:** Task 0

### Goal
Let admins review user-submitted availability reports and resolve them.

### What it looks like
- Topbar: eyebrow "Moderation", title "Availability reports".
- `Panel` titled "Availability reports", live count (e.g. "7 unresolved").
- `FilterTabs`: Unresolved (default) / Resolved / All.
- `DataTable` columns: Title (`.cell-primary`, plus for resolved rows a `.cell-sub` showing `resolution: "..."`), Platform (`.cell-mono`, shows `—` when null), Category (`Badge` — `.reported` for `CONTENT`/`REGION` unresolved, `.resolved` teal for resolved rows), Reported by (`.cell-mono`), Age (`.cell-mono`), action (`.btn-ghost` "Resolve" for unresolved, "View" for resolved).
- `Pagination` footer: "Page X of Y · limit 20".

### API you'll call
- `GET /api/v1/admin/availability-reports?page=1&limit=20&resolved=false|true|all` (default `resolved=false`) → `PaginatedReportsDto`.
- `PATCH /api/v1/admin/availability-reports/:id/resolve` with `{ resolution?: string }` → `ReportDto`.

### Steps
1. Build page shell + FilterTabs.
2. Build the table, including the resolution sub-line for resolved rows and the platform dash fallback.
3. "Resolve" opens a small form/modal for an optional resolution note, then PATCHes.
4. "View" (resolved rows) can expand/show the full resolution text.
5. Wire pagination.

### Acceptance criteria
- [ ] Default view is `resolved=false`.
- [ ] Category badge color reflects resolved state (teal once resolved) — don't hardcode only "CONTENT"/"REGION", handle any category value with a neutral fallback color.
- [ ] Resolving lets the admin optionally type a note; submits via PATCH with `resolution` (empty is valid).
- [ ] After resolving, the row updates or moves out of the Unresolved view immediately.
- [ ] Resolved rows show their resolution text under the title, styled as `.cell-sub`.
- [ ] Platform column shows `—` when null.
- [ ] Pagination text matches exactly: "Page X of Y · limit 20".

### Watch out for
- `resolution` is optional — don't require it in your form.
- Category values are open-ended; write the badge mapping so an unseen category value doesn't break styling.

---

# Developer 3 — Platform & People

## Task 4 — Platforms Page

**Size:** S/M | **Depends on:** Task 0

### Goal
Manage tracked streaming platforms — view, add, and remove.

### What it looks like
- Topbar: eyebrow "Platform", title "Platforms".
- `.platform-grid` (3-column) of `.platform-card`s: name (`.platform-name`, display font), slug (`.platform-slug`, mono, dim), a status pill top-right (`.active-role` "active", or `.suspended` "0 subs — deletable" when `subscriberCount === 0`), and `.platform-metrics` — two stacked stat pairs (Subscribers, Titles) using `.pm-value`/`.pm-label`.
- Last grid cell: dashed `.add-platform-card` with a "+" icon and "Add platform" label; opens a create form on click.

### API you'll call
- `GET /api/v1/admin/platforms` → `AdminPlatformDto[]` (includes `subscriberCount`).
- `POST /api/v1/admin/platforms` with `CreatePlatformDto` → `201`.
- `PATCH /api/v1/admin/platforms/:id` with `UpdatePlatformDto` → `200`.
- `DELETE /api/v1/admin/platforms/:id` → `204`, or `409` if active subscribers exist.

### Steps
1. Build the responsive `.platform-grid` + `PlatformCard` component.
2. Wire `GET /admin/platforms`.
3. Swap the status pill to the red "deletable" tag when `subscriberCount === 0` (⚠️ confirm this exact condition with your lead — it may not simply be "0 subscribers", there could be a separate `active` flag).
4. Build "+ Add platform" → form → `POST /admin/platforms` → new card appears without a full reload.
5. Add edit/delete actions (not fully visible in the design but implied by the DTOs) — check with your lead exactly where these should live (hover state, or a "..." menu).
6. Handle `409` (has subscribers) and `409` (slug taken) with friendly inline messages, not raw error keys.

### Acceptance criteria
- [ ] Grid renders all platforms with correct name, slug, subscriber count, title count.
- [ ] "0 subs — deletable" tag (red) appears only under the confirmed condition; otherwise the normal "active" pill (muted gray) shows.
- [ ] "+ Add platform" form validates required fields and creates via POST without a full page reload.
- [ ] Deleting with active subscribers shows `errors.admin.platform_has_subscribers` as friendly text.
- [ ] Slug collision on create shows `errors.admin.platform_slug_taken` as friendly text.
- [ ] Deleting a 0-subscriber platform removes its card.

### Watch out for
- Don't assume "deletable" is purely about an `active` flag — the design implies subscriber count drives it; verify before building the condition.
- Translate backend error keys into human text — never show the raw key to an admin.

---

## Task 5 — Sync Status Page

**Size:** S | **Depends on:** Task 0

### Goal
Show sync job health and let admins manually trigger a re-sync.

### What it looks like
- Topbar: eyebrow "Platform", title "Sync status".
- `.sync-grid` (2-column) of `.sync-card`s ("TMDB catalogue sync", "Availability sync"), each with: name + `.sync-key` caption (`redis key: last-tmdb-sync` / `last-avail-sync`), the shared `PulseDot` (16px, teal or amber) top-right, `.sync-timestamp` (big mono value — ISO string for tmdb, epoch seconds for availability), `.sync-worker` caption ("Writer: TmdbWorker · ISO 8601 string" / "Writer: AvailabilityWorker · unix epoch seconds"), and a full-width `.sync-trigger` button ("Trigger tmdb sync" / "Trigger availability sync").
- Below both cards, a `Panel` titled "Trigger history" with count caption "local session only", containing either a list of this-session triggers or the shared `EmptyState` ("No manual triggers yet this session" / "Fires from this panel call SchedulerRegistry and return 202 immediately — worker completion updates the redis keys above.").

### API you'll call
- `GET /api/v1/admin/sync/status` → `SyncStatusDto` (`null` if a worker never ran).
- `POST /api/v1/admin/sync/trigger` with `{ target: 'tmdb' | 'availability' }` → `202 { target, triggeredAt }`.

### Steps
1. Build the two `.sync-card`s using the shared `PulseDot` (16px) + timestamp formatting.
2. Wire `GET /admin/sync/status`; format ISO string vs epoch seconds correctly per card.
3. Compute dot color from staleness — ⚠️ same threshold question as Task 0, confirm with your lead (don't assume "more recent = always teal": the reference shows a 3h-old value as teal/healthy and a 41m-old value as amber/stale simultaneously, so it's not pure recency).
4. Wire each "Trigger [x] sync" button to `POST /admin/sync/trigger` with the correct `target`.
5. On success (`202`), append to a local (React state, not persisted) trigger-history list.
6. Show the shared `EmptyState` until the first trigger this session.

### Acceptance criteria
- [ ] Both cards show live data, correctly formatted per their stated format.
- [ ] Handles `null` gracefully (never crashes or shows "Invalid Date").
- [ ] Dot color logic is documented in code and confirmed with your lead, not hardcoded on a guess.
- [ ] The healthy/teal dot uses the exact `pulse-ring` animation from Task 0's `PulseDot` at 16px — no separate implementation.
- [ ] Correct `target` sent per button.
- [ ] Trigger history is session-only (resets on page refresh) — do not persist it.
- [ ] Empty state text matches exactly.
- [ ] Trigger button shows a loading/disabled state while in flight (prevents double-firing).
- [ ] Handles `404 errors.admin.sync_job_not_found` with a friendly message.

### Watch out for
- Don't persist trigger history anywhere (localStorage, backend) — "local session only" is deliberate.
- `202` means "accepted", not "finished" — don't show a success/complete state immediately; the timestamp cards update on their own next time `GET /admin/sync/status` refetches.
- Reuse Developer 1's `PulseDot` component here — don't build a second pulse animation.

---

## Task 6 — Users Page

**Size:** M | **Depends on:** Task 0

### Goal
Browse users, change roles, suspend/reinstate accounts.

### What it looks like
- Topbar: eyebrow "People", title "Users".
- `Panel` titled "Users", live count (e.g. "18,204 total").
- `FilterTabs`: All roles (default) / Suspended.
- `DataTable` columns: User (`.cell-primary` name + `.cell-sub` "id: u_xxxx · email"), Role (`Badge`: `.active-role` for USER, `.admin-role` teal for MODERATOR/ADMIN), Status (`Badge`: `.resolved` teal "active" / `.suspended` red "suspended"), Joined (`.cell-mono` date), action column — "Role" (`.btn-ghost`) plus "Suspend" (`.btn-ghost.danger`) for active users or "Reinstate" (`.btn-ghost`) for suspended ones.
- The logged-in admin's own row shows "(you)" appended to the name, and its "Role" button is disabled with inline `opacity:.4; cursor:not-allowed;` plus a `title="Cannot change own role"` tooltip attribute — no Suspend/Reinstate button at all on your own row.
- `Pagination` footer: "Page X of Y · limit 20".

### API you'll call
- `GET /api/v1/admin/users?page=1&limit=20&role=USER|MODERATOR|ADMIN&suspended=false|true|all` → `PaginatedUsersDto`.
- `PATCH /api/v1/admin/users/:id/role` with `{ role }` → `200`, or `400` if targeting your own account.
- `PATCH /api/v1/admin/users/:id/suspend` → `200` (sets `deletedAt`).
- ⚠️ No explicit "Reinstate" endpoint is listed in the backend spec, even though the design shows a Reinstate button. Confirm with your lead whether the suspend endpoint toggles both directions, or a separate call/param is needed, before wiring this button.

### Steps
1. Build page shell + FilterTabs wired to `suspended` query param.
2. Build the table with user info, role badge, status badge, joined date.
3. Add "(you)" label and the disabled/tooltip state when the row's user id matches the logged-in admin's id — no destructive buttons rendered at all on that row.
4. Build the "Role" action (dropdown of the 3 roles) calling the role PATCH.
5. Build "Suspend"/"Reinstate" (confirm the Reinstate call with your lead first).
6. Wire pagination.
7. Defensively handle the `400 errors.admin.cannot_change_own_role` even though the UI already disables the control.

### Acceptance criteria
- [ ] Table shows real paginated data with correct role/status badges.
- [ ] "All roles"/"Suspended" tabs correctly filter and refetch.
- [ ] Own row shows "(you)", disabled greyed-out "Role" button with the exact tooltip text, and no Suspend/Reinstate button.
- [ ] Role change updates the badge immediately after a successful PATCH.
- [ ] Suspending updates the status badge and swaps the button to "Reinstate".
- [ ] Own-role-change attempts are blocked client-side, and the `400` is handled gracefully if it somehow reaches the API.
- [ ] Pagination text matches: "Page X of Y · limit 20", count in header matches the real total.
- [ ] Top bar search box (Developer 1's component) is left non-functional here unless a users-search endpoint is confirmed — don't wire it speculatively.

### Watch out for
- Don't rely only on hiding the button for the "own account" rule — always handle the possible `400` too, in case of stale UI state.
- Confirm the Reinstate flow before building it; guessing wrong means redoing the PATCH wiring later.

---

## Final integration checklist (all 3 developers, end of sprint)

- [ ] Every page uses the exact same `AdminLayout` (rail + pulse strip + topbar) — no page has a one-off header or sidebar variant.
- [ ] Every badge across all pages pulls from the single shared `Badge` component with the 7 documented variants — no page has its own inline badge styling.
- [ ] The `PulseDot` animation looks and times identically in the top strip and on the Sync Status cards.
- [ ] Every list page (Comment Queue, Availability Reports, Users) uses the same `FilterTabs` and `Pagination` components and matches the "Page X of Y[ · limit 20]" text conventions exactly.
- [ ] All 5 open ⚠️ questions (needs-attention data source, shell trigger-sync button behavior, sync staleness threshold, platform "deletable" condition, users Reinstate endpoint) have been resolved with the lead and the docs/code updated to match the real answer, not left as guesses.
