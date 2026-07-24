import type { ReactNode } from 'react';

type DataTableProps = {
  columns: string[];
  children: ReactNode;
}

/** Generic table shell — columns define headers; children are tbody rows. Server Component. */
export function DataTable(props: DataTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          {props.columns.map((col) => (
            <th
              key={col}
              className="border-b border-[var(--border-soft)] px-[18px] py-[10px] text-left font-[family-name:var(--font-mono)] text-[10.5px] font-medium tracking-[0.5px] text-[var(--text-faint)] uppercase"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{props.children}</tbody>
    </table>
  );
}
