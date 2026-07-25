import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { ClerkLocalizations } from '@/utils/AppConfig';
import { getI18nPath } from '@/utils/Helpers';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
      }}
      localization={clerkLocale}
      signInUrl={getI18nPath('/sign-in', locale)}
      signUpUrl={getI18nPath('/sign-up', locale)}
      signInFallbackRedirectUrl={getI18nPath('/dashboard', locale)}
      signUpFallbackRedirectUrl={getI18nPath('/dashboard', locale)}
      afterSignOutUrl={getI18nPath('/', locale)}
    >
      {props.children}
    </ClerkProvider>
  );
}
