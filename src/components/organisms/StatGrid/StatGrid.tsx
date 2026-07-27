'use client';

import { StatCard } from '@/components/molecules/StatCard';
import { useAdminStats } from '@/features/admin/api';

const STAT_SKELETON_COUNT = 5;

/** Renders the 5 stat cards in the Dashboard stats grid. Fetches from GET /admin/stats. */
export function StatGrid() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-3 max-md:grid-cols-2">
        {Array.from({ length: STAT_SKELETON_COUNT }).map((_, i) => (
          <div
            /* eslint-disable-next-line react/no-array-index-key */
            key={i}
            className="flex animate-pulse flex-col gap-2 rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] px-4 pt-4 pb-[14px]"
          >
            <div className="h-[10px] w-24 rounded bg-[var(--surface-raised)]" />
            <div className="mt-2 h-8 w-16 rounded bg-[var(--surface-raised)]" />
            <div className="h-[11px] w-32 rounded bg-[var(--surface-raised)]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-3 max-md:grid-cols-2">
      <StatCard
        eyebrow="Total users"
        value={stats?.totalUsers ?? 0}
        caption="across USER / MODERATOR / ADMIN"
      />
      <StatCard
        eyebrow="Active users"
        value={stats?.activeUsers ?? 0}
        caption="session in last 30 days"
      />
      <StatCard eyebrow="Total titles" value={stats?.totalTitles ?? 0} caption="synced from TMDB" />
      <StatCard eyebrow="Total ratings" value={stats?.totalRatings ?? 0} caption="user-submitted" />
      <StatCard
        eyebrow="Pending reports"
        value={stats?.pendingReports ?? 0}
        caption="resolved_at IS NULL"
        amber
      />
    </div>
  );
}
