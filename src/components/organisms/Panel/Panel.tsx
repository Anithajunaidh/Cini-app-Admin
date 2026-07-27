import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  count?: string;
  filterRow?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

/** Generic card/panel wrapper used for tables and list sections. Server Component. */
export function Panel(props: PanelProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-[18px] py-[14px]">
        <div className="flex items-baseline gap-[9px]">
          <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold">
            {props.title}
          </span>
          {props.count && (
            <span className="font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--text-faint)]">
              {props.count}
            </span>
          )}
        </div>
        {props.filterRow && <div className="flex gap-2">{props.filterRow}</div>}
      </div>

      {props.children}

      {props.footer && (
        <div className="flex items-center justify-between border-t border-[var(--border-soft)] px-[18px] py-[11px]">
          {props.footer}
        </div>
      )}
    </div>
  );
}
