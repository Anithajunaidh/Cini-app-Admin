import type { ReactNode } from 'react';
import { Rail } from '@/components/organisms/Rail';
import { SyncPulseStrip } from '@/components/organisms/SyncPulseStrip';
import { Topbar } from '@/components/organisms/Topbar';

type AdminLayoutProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  adminName?: string;
  adminRole?: string;
  badges?: Record<string, number>;
}

/**
 * Shell template that every admin page renders inside.
 * Rail + main column (SyncPulseStrip + Topbar + content area).
 * Server Component — client boundaries pushed into Rail and SyncPulseStrip.
 */
export function AdminLayout(props: AdminLayoutProps) {
  return (
    <div
      className="grid min-h-screen max-md:grid-cols-1"
      style={{ gridTemplateColumns: '232px 1fr' }}
    >
      {/* Sidebar */}
      <Rail adminName={props.adminName} adminRole={props.adminRole} badges={props.badges} />

      {/* Main column */}
      <main className="flex min-w-0 flex-col">
        <SyncPulseStrip />
        <Topbar eyebrow={props.eyebrow} title={props.title} />
        <div className="flex-1 px-[22px] py-[14px] pb-10">{props.children}</div>
      </main>
    </div>
  );
}
