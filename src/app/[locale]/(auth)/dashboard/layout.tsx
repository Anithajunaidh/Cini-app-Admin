import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard',
    description: 'Manage your account from the dashboard.',
  };
}

import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AdminProtectedRoute>{props.children}</AdminProtectedRoute>;
}
