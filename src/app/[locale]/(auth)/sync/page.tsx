import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { SyncStatusTemplate } from '@/templates/SyncStatusTemplate';

export const metadata: Metadata = {
  title: 'Sync status — MIRALO Admin',
  description: 'Monitor and trigger TMDB catalogue and availability syncs.',
};

export default async function SyncStatusPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="Platform" title="Sync status">
      <SyncStatusTemplate />
    </AdminLayout>
  );
}
