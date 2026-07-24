type EmptyStateProps = {
  title: string;
  sub?: string;
}

/** Centered empty state block. Reuse for any "no data" scenario. */
export function EmptyState(props: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-[18px] py-9 text-center text-[var(--text-faint)]">
      <div className="mb-1 font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)]">
        {props.title}
      </div>
      {props.sub && <div className="text-xs">{props.sub}</div>}
    </div>
  );
}
