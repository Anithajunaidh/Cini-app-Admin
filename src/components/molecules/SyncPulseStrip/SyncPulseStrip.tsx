import { PulseDot } from '@/components/atoms/PulseDot';

export function SyncPulseStrip() {
  return (
    <div className="pulse-strip">
      <div className="pulse-cell">
        <PulseDot variant="teal" size={14} />
        <div className="pulse-label">
          <span className="pulse-title">last-tmdb-sync</span>
          <span className="pulse-value">2026-07-17T05:12:04Z · 3h ago</span>
        </div>
      </div>
      <div className="pulse-cell">
        <PulseDot variant="amber" size={14} />
        <div className="pulse-label">
          <span className="pulse-title">last-avail-sync</span>
          <span className="pulse-value">epoch 1752726420 · 41m ago</span>
        </div>
      </div>
      <div className="pulse-cta">
        <button
          suppressHydrationWarning
          className="btn-sync"
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('Sync triggered (client-side only)');
          }}
          type="button"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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
