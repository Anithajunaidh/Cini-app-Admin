import { setRequestLocale } from 'next-intl/server';
import { AdminLayout } from '@/templates/AdminLayout';
import { EmptyState } from '@/components/molecules/EmptyState';

export default async function CommentQueuePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AdminLayout eyebrow="Moderation" title="Comment queue">
      <EmptyState
        title="Not available"
        sub="Comment queue management has been disabled."
      />
    </AdminLayout>
  );
}
