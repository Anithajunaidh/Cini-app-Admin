'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Rail } from '@/components/organisms/Rail';
import { SyncPulseStrip } from '@/components/organisms/SyncPulseStrip';
import { Topbar } from '@/components/organisms/Topbar';
import { getAvailabilityReportCounts, getCommentQueueCounts } from '@/data/admin-moderation';

type AdminLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  adminName?: string;
  adminRole?: string;
};

export function AdminLayout(props: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setIsCollapsed(width >= 768 && width < 1024);
      if (width >= 768) {
        setIsMobileMenuOpen(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const badges = {
    comments: getCommentQueueCounts().reported,
    reports: getAvailabilityReportCounts().unresolved,
  };

  return (
    <div className="flex min-h-screen">
      {isMobileMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[#0f1720]/80 backdrop-blur-sm md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
          }}
        />
      ) : null}

      <div
        className={[
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200',
          'md:relative md:translate-x-0',
          isCollapsed ? 'md:w-[60px]' : 'md:w-[232px]',
          isMobileMenuOpen ? 'translate-x-0 w-[232px]' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <Rail
          adminName={props.adminName}
          adminRole={props.adminRole}
          badges={badges}
          collapsed={isCollapsed}
          onNavClick={() => {
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-[10px] border-b border-[var(--border-soft)] bg-[var(--surface)] px-[14px] py-[10px] md:hidden">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(true);
            }}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Open navigation menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-[8px]">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-[var(--accent-teal)] to-[#2E7D74] font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[#06231F]">
              M
            </div>
            <div className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[0.2px]">
              MIRALO
            </div>
          </div>
        </div>

        <SyncPulseStrip />
        <Topbar eyebrow={props.eyebrow} title={props.title} />
        <div className="flex-1 overflow-x-hidden px-[14px] py-[14px] pb-10 md:px-[22px]">
          {props.children}
        </div>
      </main>
    </div>
  );
}
