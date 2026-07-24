type StatCardProps = {
  eyebrow: string;
  value: string | number;
  caption: string;
  amber?: boolean;
}

/** Single stat card in the Dashboard stats grid. */
export function StatCard(props: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] px-4 pt-4 pb-[14px]">
      <div className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.6px] text-[var(--text-faint)] uppercase">
        {props.eyebrow}
      </div>
      <div
        className={[
          'font-[family-name:var(--font-display)] text-[28px] font-semibold mt-2',
          props.amber ? 'text-[var(--accent-amber)]' : 'text-[var(--text-primary)]',
        ].join(' ')}
      >
        {typeof props.value === 'number' ? props.value.toLocaleString() : props.value}
      </div>
      <div className="text-[11.5px] text-[var(--text-muted)]">{props.caption}</div>
    </div>
  );
}
