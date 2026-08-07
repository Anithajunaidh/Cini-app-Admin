import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { EmptyState } from '@/components/molecules/EmptyState';

export default async function AvailabilityReportsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="Moderation" title="Availability reports">
      <EmptyState
        title="Not available"
        sub="Availability report management has been disabled."
      />
    </AdminLayout>
  );
}
