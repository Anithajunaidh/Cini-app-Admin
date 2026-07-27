import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'reported'
  | 'hidden'
  | 'resolved'
  | 'pending'
  | 'active-role'
  | 'admin-role'
  | 'suspended';

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
};

const variantStyles: Record<BadgeVariant, string> = {
  reported: 'bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]',
  hidden: 'bg-[var(--accent-red-dim)] text-[var(--accent-red)]',
  resolved: 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]',
  pending: 'bg-[var(--accent-amber-dim)] text-[var(--accent-amber)]',
  'active-role': 'bg-[#8CA0B322] text-[var(--text-muted)]',
  'admin-role': 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]',
  suspended: 'bg-[var(--accent-red-dim)] text-[var(--accent-red)]',
};

/** Renders a status/category badge with one of 7 color variants. */
export function Badge(props: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-[5px]',
        'font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.3px]',
        'px-[9px] py-[3px] rounded-full',
        variantStyles[props.variant],
      ].join(' ')}
    >
      {props.children}
    </span>
  );
}
