'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type GhostButtonProps = {
  danger?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Transparent bordered button. `danger` variant turns red on hover;
 * plain variant turns teal. Used for row actions in data tables.
 */
export function GhostButton(props: GhostButtonProps) {
  const { danger = false, children, className, ...rest } = props;

  return (
    <button
      type="button"
      className={[
        'font-[family-name:var(--font-mono)] text-[11px] tracking-[0.3px]',
        'px-[10px] py-[5px] rounded-[6px]',
        'border border-[var(--border)] bg-transparent text-[var(--text-muted)]',
        'transition-[border-color,color] duration-150',
        danger
          ? 'hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]'
          : 'hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
