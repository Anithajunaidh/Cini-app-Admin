import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { EmptyState } from '@/components/molecules/EmptyState';

export default async function UsersPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="People" title="Users">
      <EmptyState
        title="Not available"
        sub="User management has been disabled."
      />
    </AdminLayout>
  );
}
