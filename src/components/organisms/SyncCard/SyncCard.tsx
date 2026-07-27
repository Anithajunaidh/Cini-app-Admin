'use client';

import { GhostButton } from '@/components/atoms/GhostButton';
import { PulseDot } from '@/components/atoms/PulseDot';

type SyncCardProps = {
  /** Display label, e.g. "TMDB catalogue sync" */
  name: string;
  /** Redis key name shown as metadata */
  redisKey: string;
  /** Human-readable timestamp string to show large */
  timestamp: string;
  /** Sub-line: worker name + format note */
  workerLabel: string;
  /** Pulse dot color driven by sync freshness */
  color: 'teal' | 'amber';
  /** CTA button label */
  triggerLabel: string;
  /** Whether a trigger mutation is in-flight */
  isPending: boolean;
  /** Called when the trigger button is clicked */
  onTrigger: () => void;
};

/**
 * Full-detail sync status card for the Sync Status page.
 * Shows the pulsing dot, last-sync timestamp, worker metadata,
 * and a trigger button. Mirrors the `.sync-card` design in the HTML spec.
 */
export function SyncCard(props: SyncCardProps) {
  return (
    <div className="flex flex-col rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] p-[18px]">
      {/* Top row: name + pulse dot */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold">
            {props.name}
          </div>
          <div className="mt-[2px] font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-faint)]">
            redis key: {props.redisKey}
          </div>
        </div>
        <PulseDot color={props.color} size={16} />
      </div>

      {/* Large timestamp */}
      <div className="mt-[14px] font-[family-name:var(--font-mono)] text-[20px] leading-tight font-semibold break-all sm:text-[22px]">
        {props.timestamp}
      </div>
      <div className="mt-[2px] text-[11.5px] text-[var(--text-muted)]">{props.workerLabel}</div>

      {/* Trigger button */}
      <GhostButton
        className="mt-[14px] w-full justify-center py-[9px] text-[12px]"
        disabled={props.isPending}
        onClick={props.onTrigger}
      >
        {props.isPending ? 'Triggering…' : props.triggerLabel}
      </GhostButton>
    </div>
  );
}
