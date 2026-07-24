import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: 'Dashboard — MIRALO Admin',
  description: 'Admin backoffice overview.',
};

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <>{props.children}</>;
}
