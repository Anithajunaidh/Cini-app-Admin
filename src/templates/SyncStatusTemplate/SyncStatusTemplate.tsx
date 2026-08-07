'use client';

import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Panel } from '@/components/organisms/Panel';
import { SyncCard } from '@/components/organisms/SyncCard';
import { useAdminSyncStatus, useTriggerSync } from '@/features/admin/api';
import { TMDB_SYNC_HEALTH_THRESHOLD_MS, AVAIL_SYNC_HEALTH_THRESHOLD_MS } from '@/constants/app';

// Helpers — use shared thresholds from constants so SyncPulseStrip stays in sync

function tmdbSyncColor(isoString: string | null): 'teal' | 'amber' {
  if (!isoString) {
    return 'amber';
  }
  const ageMs = Date.now() - new Date(isoString).getTime();
  return ageMs < TMDB_SYNC_HEALTH_THRESHOLD_MS ? 'teal' : 'amber';
}

function availSyncColor(epochSeconds: number | null): 'teal' | 'amber' {
  if (epochSeconds == null) {
    return 'amber';
  }
  const ageMs = Date.now() - epochSeconds * 1000;
  return ageMs < AVAIL_SYNC_HEALTH_THRESHOLD_MS ? 'teal' : 'amber';
}

function formatRelative(ms: number): string {
  const min = Math.floor(ms / 60_000);
  if (min < 60) {
    return `${min}m ago`;
  }
  const hr = Math.floor(min / 60);
  if (hr < 24) {
    return `${hr}h ago`;
  }
  return `${Math.floor(hr / 24)}d ago`;
}

// Local type for session trigger history

type TriggerHistoryEntry = {
  localId: number;
  target: 'tmdb' | 'availability';
  triggeredAt: string;
};

const statusVariant = {
  tmdb: 'resolved',
  availability: 'pending',
} as const;

/** Sync Status page layout -- two detail cards + session trigger history. */
export function SyncStatusTemplate() {
  const { data: syncStatus, isLoading, isError } = useAdminSyncStatus();
  const triggerSync = useTriggerSync();
  const [history, setHistory] = useState<TriggerHistoryEntry[]>([]);

  const now = Date.now();

  const tmdbTimestamp = syncStatus?.lastTmdbSync
    ? `${syncStatus.lastTmdbSync} · ${formatRelative(now - new Date(syncStatus.lastTmdbSync).getTime())}`
    : 'never synced';

  const availTimestamp =
    syncStatus?.lastAvailabilitySync != null
      ? `${new Date(syncStatus.lastAvailabilitySync * 1000).toISOString()} · ${formatRelative(now - syncStatus.lastAvailabilitySync * 1000)}`
      : 'never synced';

  function handleTrigger(target: 'tmdb' | 'availability') {
    // Add to session history OPTIMISTICALLY on click.
    // The mutation fires a real API call when the backend is available, but
    // the history entry must appear immediately — it should not depend on
    // onSuccess, which never fires in the mock/offline environment.
    setHistory((prev) => [
      { localId: Date.now(), target, triggeredAt: new Date().toISOString() },
      ...prev,
    ]);
    triggerSync.mutate(target);
  }

  const tmdbColor = isLoading ? 'amber' : tmdbSyncColor(syncStatus?.lastTmdbSync ?? null);
  const availColor = isLoading ? 'amber' : availSyncColor(syncStatus?.lastAvailabilitySync ?? null);

  // Error state — API unreachable or returned 404 (sync job not found)
  if (isError) {
    return (
      <EmptyState
        title="Sync data unavailable"
        sub="Could not load sync status. The sync job may not have run yet or the API is unreachable."
      />
    );
  }

  // Skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex animate-pulse flex-col gap-3 rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] p-[18px]"
            >
              <div className="flex justify-between">
                <div className="flex flex-col gap-2">
                  <div className="h-[15px] w-40 rounded bg-[var(--surface-raised)]" />
                  <div className="h-[11px] w-28 rounded bg-[var(--surface-raised)]" />
                </div>
                <div className="h-4 w-4 rounded-full bg-[var(--surface-raised)]" />
              </div>
              <div className="mt-2 h-7 w-56 rounded bg-[var(--surface-raised)]" />
              <div className="h-[11px] w-44 rounded bg-[var(--surface-raised)]" />
              <div className="mt-2 h-9 w-full rounded bg-[var(--surface-raised)]" />
            </div>
          ))}
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border-soft)] px-[18px] py-[14px]">
            <div className="h-[15px] w-32 rounded bg-[var(--surface-raised)]" />
          </div>
          <EmptyState
            title="No manual triggers yet this session"
            sub="Fires from this panel call SchedulerRegistry and return 202 immediately — worker completion updates the redis keys above."
          />
        </div>
      </div>
    );
  }

  // Loaded
  return (
    <div className="flex flex-col gap-5">
      {/* Two sync detail cards */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        <SyncCard
          name="TMDB catalogue sync"
          redisKey="last-tmdb-sync"
          timestamp={syncStatus?.lastTmdbSync ? tmdbTimestamp : '—'}
          workerLabel="Writer: TmdbWorker · ISO 8601 string"
          color={tmdbColor}
          triggerLabel="Trigger tmdb sync"
          isPending={triggerSync.isPending}
          onTrigger={() => {
            handleTrigger('tmdb');
          }}
        />
        <SyncCard
          name="Availability sync"
          redisKey="last-avail-sync"
          timestamp={syncStatus?.lastAvailabilitySync != null ? availTimestamp : '—'}
          workerLabel="Writer: AvailabilityWorker · unix epoch seconds"
          color={availColor}
          triggerLabel="Trigger availability sync"
          isPending={triggerSync.isPending}
          onTrigger={() => {
            handleTrigger('availability');
          }}
        />
      </div>

      {/* Trigger history panel */}
      <Panel title="Trigger history" count="local session only">
        {history.length === 0 ? (
          <EmptyState
            title="No manual triggers yet this session"
            sub="Fires from this panel call SchedulerRegistry and return 202 immediately — worker completion updates the redis keys above."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Target', 'Triggered at', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[var(--border-soft)] px-[18px] py-[10px] text-left font-[family-name:var(--font-mono)] text-[10.5px] font-medium tracking-[0.5px] text-[var(--text-faint)] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr
                  key={entry.localId}
                  className="border-b border-[var(--border-soft)] last:border-b-0 hover:bg-[var(--surface-hover)]"
                >
                  <td className="px-[18px] py-3">
                    <Badge variant={statusVariant[entry.target]}>
                      {entry.target === 'tmdb' ? 'tmdb' : 'availability'}
                    </Badge>
                  </td>
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[12px] text-[var(--text-muted)]">
                    {entry.triggeredAt}
                  </td>
                  <td className="px-[18px] py-3">
                    <Badge variant="resolved">202 accepted</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
