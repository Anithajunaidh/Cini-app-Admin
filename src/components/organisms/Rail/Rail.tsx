'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/libs/I18nNavigation';

type NavItem = {
  label: string;
  href: string;
  view: string;
  badge?: number;
  icon: React.ReactNode;
}

type NavGroup = {
  eyebrow: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    eyebrow: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        view: 'dashboard',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
        ),
      },
    ],
  },
  {
    eyebrow: 'Moderation',
    items: [
      {
        label: 'Comment queue',
        href: '/comments',
        view: 'comments',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 12a8 8 0 1 1-3.5-6.6" />
            <path d="M21 5v5h-5" />
          </svg>
        ),
      },
      {
        label: 'Availability reports',
        href: '/reports',
        view: 'reports',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        ),
      },
    ],
  },
  {
    eyebrow: 'Platform',
    items: [
      {
        label: 'Platforms',
        href: '/platforms',
        view: 'platforms',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 18v3" />
          </svg>
        ),
      },
      {
        label: 'Sync status',
        href: '/sync',
        view: 'sync',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        ),
      },
    ],
  },
  {
    eyebrow: 'People',
    items: [
      {
        label: 'Users',
        href: '/users',
        view: 'users',
        icon: (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
];

type RailProps = {
  /** Logged-in admin display name */
  adminName?: string;
  /** Logged-in admin role string */
  adminRole?: string;
  /** Badge counts for nav items (keyed by view name) */
  badges?: Record<string, number>;
  /** Callback fired when a nav link is clicked */
  onNavClick?: () => void;
  /** When true, renders icon-only mode (no labels, narrower width). Used at md breakpoint. */
  collapsed?: boolean;
}

/** Fixed sidebar rail with brand, nav groups, and admin user block. */
export function Rail(props: RailProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    // Match /en/dashboard, /en/platforms, etc.
    return pathname.includes(href);
  }

  const adminInitials = (props.adminName ?? 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (props.collapsed) {
    return (
      <aside className="sticky top-0 flex h-screen flex-col items-center gap-[6px] overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--surface)] px-[10px] py-[22px]">
        {/* Brand — icon only */}
        <div className="mb-4 flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-[var(--accent-teal)] to-[#2E7D74] font-[family-name:var(--font-mono)] text-[15px] font-semibold text-[#06231F]">
          M
        </div>

        {/* Nav — icon only with title tooltip */}
        <nav className="flex w-full flex-col items-center gap-[2px]" aria-label="Main navigation">
          {navGroups.map((group) =>
            group.items.map((item) => {
              const active = isActive(item.href);
              const badge = props.badges?.[item.view];
              return (
                <Link
                  key={item.view}
                  href={item.href as any}
                  onClick={() => props.onNavClick?.()}
                  title={item.label}
                  className={[
                    'relative flex items-center justify-center w-[44px] h-[44px] rounded-[10px]',
                    'border transition-[background,color] duration-150',
                    active
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)] border-[#4FD1C540]'
                      : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="shrink-0 opacity-90 [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
                  {badge !== undefined && (
                    <span className="absolute -top-[3px] -right-[3px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[var(--accent-amber)] font-[family-name:var(--font-mono)] text-[8px] font-semibold text-[#06231F]">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </Link>
              );
            }),
          )}
        </nav>

        {/* Admin initials — bottom */}
        <div className="mt-auto border-t border-[var(--border-soft)] pt-[14px]">
          <div
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] font-[family-name:var(--font-mono)] text-[12px] text-[var(--text-muted)]"
            title={props.adminName ?? 'Admin'}
          >
            {adminInitials}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[26px] overflow-y-auto border-r border-[var(--border-soft)] bg-[var(--surface)] px-[14px] py-[22px]">
      {/* Brand */}
      <div className="flex items-center gap-[10px] px-2">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-[var(--accent-teal)] to-[#2E7D74] font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#06231F]">
          M
        </div>
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[0.2px]">
            MIRALO
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.6px] text-[var(--text-faint)] uppercase">
            Backoffice
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[2px]" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.eyebrow}>
            <div className="px-[10px] pt-[14px] pb-[6px] font-[family-name:var(--font-mono)] text-[10px] tracking-[1.2px] text-[var(--text-faint)] uppercase">
              {group.eyebrow}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const badge = props.badges?.[item.view];
              return (
                <Link
                  key={item.view}
                  href={item.href as any}
                  onClick={() => props.onNavClick?.()}
                  className={[
                    'flex items-center gap-[10px] px-[10px] py-[9px] rounded-[8px]',
                    'text-[13px] font-medium border transition-[background,color] duration-150',
                    active
                      ? 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)] border-[#4FD1C540]'
                      : 'text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="shrink-0 opacity-90">{item.icon}</span>
                  <span className="min-w-0 truncate">{item.label}</span>
                  {badge !== undefined && (
                    <span className="ml-auto shrink-0 rounded-full bg-[var(--accent-amber-dim)] px-[6px] py-[1px] font-[family-name:var(--font-mono)] text-[10px] font-semibold text-[var(--accent-amber)]">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Admin user block */}
      <div className="mt-auto border-t border-[var(--border-soft)] px-2 pt-[14px]">
        <div className="flex items-center gap-[9px]">
          <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)]">
            {adminInitials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold">{props.adminName ?? 'Admin'}</div>
            <div className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.4px] text-[var(--accent-amber)]">
              {props.adminRole ?? 'Role.Admin'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
