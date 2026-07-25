'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getAvailabilityReportCounts,
  getCommentQueueCounts,
} from '@/data/admin-moderation';

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

interface NavGroupConfig {
  eyebrow: string;
  items: NavItemConfig[];
}

const navGroups: NavGroupConfig[] = [
  {
    eyebrow: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        href: '/dashboard/comments',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 12a8 8 0 1 1-3.5-6.6" />
            <path d="M21 5v5h-5" />
          </svg>
        ),
      },
      {
        label: 'Availability reports',
        href: '/dashboard/reports',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        href: '/dashboard/platforms',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 18v3" />
          </svg>
        ),
      },
      {
        label: 'Sync status',
        href: '/dashboard/sync',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        href: '/dashboard/users',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

export function Rail() {
  const pathname = usePathname();
  const commentQueueCounts = getCommentQueueCounts();
  const availabilityReportCounts = getAvailabilityReportCounts();

  const normalizedPath = pathname.replace(/^\/[a-z]{2}(?=\/)/, '');

  const groupsWithCounts = navGroups.map(function(group) {
    if (group.eyebrow === 'Moderation') {
      return {
        ...group,
        items: group.items.map(function(item) {
          if (item.label === 'Comment queue') {
            return {
              ...item,
              badgeCount: commentQueueCounts.reported,
            };
          }

          if (item.label === 'Availability reports') {
            return {
              ...item,
              badgeCount: availabilityReportCounts.unresolved,
            };
          }

          return item;
        }),
      };
    }

    return group;
  });

  return (
    <aside className="rail">
      <div className="rail-brand">
        <div className="rail-mark">M</div>
        <div>
          <div className="rail-brand-text">MIRALO</div>
          <div className="rail-brand-sub">Backoffice</div>
        </div>
      </div>

      <nav className="rail-nav">
        {groupsWithCounts.map(function(group) {
          return (
            <React.Fragment key={group.eyebrow}>
              <div className="rail-eyebrow">{group.eyebrow}</div>
              {group.items.map(function(item) {
                const isActive =
                  normalizedPath === item.href ||
                  (item.href !== '/dashboard' && normalizedPath.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${isActive ? ' active' : ''}`}
                  >
                    {item.icon}
                    {item.label}
                    {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                      <span className="nav-badge">{item.badgeCount}</span>
                    ) : null}
                  </Link>
                );
              })}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="rail-foot">
        <div className="rail-admin">
          <div className="rail-avatar">RA</div>
          <div>
            <div className="rail-admin-name">Rony A.</div>
            <div className="rail-admin-role">Role.Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
