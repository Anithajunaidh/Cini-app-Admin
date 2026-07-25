import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Index(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  redirect('/dashboard');
}
