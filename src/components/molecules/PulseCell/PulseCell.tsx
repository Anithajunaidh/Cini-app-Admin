import { PulseDot } from '@/components/atoms/PulseDot';

type PulseCellProps = {
  title: string;
  value: string;
  color: 'teal' | 'amber';
};

export function PulseCell(props: PulseCellProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 md:gap-3 md:border-r md:border-[var(--border-soft)] md:px-5 md:py-3">
      <PulseDot color={props.color} size={14} />
      <div className="flex flex-col gap-[1px]">
        <span className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.4px] text-[var(--text-muted)] md:text-[11px]">
          {props.title}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] font-medium text-[var(--text-primary)] md:text-[12.5px]">
          {props.value}
        </span>
      </div>
    </div>
  );
}
