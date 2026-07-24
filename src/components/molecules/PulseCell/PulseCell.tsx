import { PulseDot } from '@/components/atoms/PulseDot';

type PulseCellProps = {
  title: string;
  value: string;
  color: 'teal' | 'amber';
}

/** One data cell in the Sync Pulse strip (dot + label + value). Server Component. */
export function PulseCell(props: PulseCellProps) {
  return (
    <div className="flex items-center gap-3 border-r border-[var(--border-soft)] px-5 py-3">
      <PulseDot color={props.color} size={14} />
      <div className="flex flex-col gap-[1px]">
        <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.4px] text-[var(--text-muted)]">
          {props.title}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[12.5px] font-medium text-[var(--text-primary)]">
          {props.value}
        </span>
      </div>
    </div>
  );
}
