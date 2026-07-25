'use client';

import { PulseCell } from '@/components/molecules/PulseCell';

export function SyncPulseStrip() {
  return (
    <div className="flex flex-col border-b border-[var(--border-soft)] bg-[var(--surface)] px-[14px] md:flex-row md:items-stretch md:overflow-x-auto md:px-[22px] md:[&::-webkit-scrollbar]:hidden">
      <div className="flex flex-col divide-y divide-[var(--border-soft)] md:flex-row md:divide-y-0">
        <PulseCell title="last-tmdb-sync" value="2026-07-17T05:12:04Z · 3h ago" color="teal" />
        <PulseCell title="last-avail-sync" value="epoch 1752726420 · 41m ago" color="amber" />
      </div>

      <div className="flex items-center border-t border-[var(--border-soft)] py-2 md:ml-auto md:border-t-0 md:py-3 md:pl-4">
        <button
          type="button"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Sync triggered (client-side only)');
          }}
          className="flex items-center gap-[6px] rounded-[7px] border border-[var(--border)] bg-transparent px-3 py-[6px] font-[family-name:var(--font-mono)] text-[11.5px] tracking-[0.3px] text-[var(--text-muted)] transition-[border-color,color] duration-150 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
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
          Trigger sync
        </button>
      </div>
    </div>
  );
}
