import React from 'react';
import { Rail } from '@/components/organisms/Rail';
import { SyncPulseStrip } from '@/components/molecules/SyncPulseStrip';
import { Topbar } from '@/components/molecules/Topbar';

interface AdminLayoutProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ eyebrow, title, children }: AdminLayoutProps) {
  return (
    <div className="shell" suppressHydrationWarning>
      <Rail />

      <div className="main">
        <SyncPulseStrip />
        <Topbar eyebrow={eyebrow} title={title} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
