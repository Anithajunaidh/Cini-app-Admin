import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { PlatformsTemplate } from '@/templates/PlatformsTemplate';

export const metadata: Metadata = {
  title: 'Platforms — MIRALO Admin',
  description: 'Manage tracked streaming platforms.',
};

export default async function PlatformsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="Platform" title="Platforms">
      <PlatformsTemplate />
    </AdminLayout>
  );
}
