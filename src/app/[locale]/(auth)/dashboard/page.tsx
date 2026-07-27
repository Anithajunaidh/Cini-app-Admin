import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { DashboardTemplate } from '@/templates/DashboardTemplate';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="Overview" title="Dashboard">
      <DashboardTemplate />
    </AdminLayout>
  );
}
