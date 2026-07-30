'use client';

import { PulseCell } from '@/components/molecules/PulseCell';
import { useAdminSyncStatus, useTriggerSync } from '@/features/admin/api';

/**
 * Determines sync dot color:
 * - TMDB: teal if last sync < 6h ago, amber otherwise
 * - Availability: teal if last sync < 24h ago, amber otherwise
 */
function tmdbSyncColor(isoString: string | null): 'teal' | 'amber' {
  if (!isoString) {
    return 'amber';
  }
  const ageMs = Date.now() - new Date(isoString).getTime();
  return ageMs < 6 * 60 * 60 * 1000 ? 'teal' : 'amber';
}

function availSyncColor(epochSeconds: number | null): 'teal' | 'amber' {
  if (epochSeconds == null) {
    return 'amber';
  }
  const ageMs = Date.now() - epochSeconds * 1000;
  return ageMs < 24 * 60 * 60 * 1000 ? 'teal' : 'amber';
}

function formatRelativeTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

/** The signature Sync Pulse strip at the top of every page. */
export function SyncPulseStrip() {
  const { data: syncStatus } = useAdminSyncStatus();
  const triggerSync = useTriggerSync();

  const tmdbValue = syncStatus?.lastTmdbSync
    ? `${syncStatus.lastTmdbSync} · ${formatRelativeTime(Date.now() - new Date(syncStatus.lastTmdbSync).getTime())}`
    : '—';

  const availValue =
    syncStatus?.lastAvailabilitySync != null
      ? `epoch ${syncStatus.lastAvailabilitySync} · ${formatRelativeTime(Date.now() - syncStatus.lastAvailabilitySync * 1000)}`
      : '—';

  function handleTriggerSync() {
    // Trigger both syncs immediately (targets both since the strip button is generic)
    triggerSync.mutate('tmdb');
    triggerSync.mutate('availability');
  }

  return (
    <div className="flex flex-col border-b border-[var(--border-soft)] bg-[var(--surface)] px-[14px] md:flex-row md:items-stretch md:overflow-x-auto md:px-[22px] md:[&::-webkit-scrollbar]:hidden">
      {/* Sync cells — stacked on mobile, inline on md+ */}
      <div className="flex flex-col divide-y divide-[var(--border-soft)] md:flex-row md:divide-y-0">
        <PulseCell
          title="last-tmdb-sync"
          value={tmdbValue}
          color={tmdbSyncColor(syncStatus?.lastTmdbSync ?? null)}
        />
        <PulseCell
          title="last-avail-sync"
          value={availValue}
          color={availSyncColor(syncStatus?.lastAvailabilitySync ?? null)}
        />
      </div>

      {/* Trigger sync button — below cells on mobile, inline-end on md+ */}
      <div className="flex items-center border-t border-[var(--border-soft)] py-2 md:ml-auto md:border-t-0 md:py-3 md:pl-4">
        <button
          type="button"
          onClick={handleTriggerSync}
          disabled={triggerSync.isPending}
          className="flex items-center gap-[6px] rounded-[7px] border border-[var(--border)] bg-transparent px-3 py-[6px] font-[family-name:var(--font-mono)] text-[11.5px] tracking-[0.3px] text-[var(--text-muted)] transition-[border-color,color] duration-150 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Trigger sync"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          {triggerSync.isPending ? 'Triggering…' : 'Trigger sync'}
        </button>
      </div>
    </div>
  );
}
