import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '../../lib/i18n';
import { SuppressWarnings } from '../../components/providers/SuppressWarnings';
import { LocaleAttributes } from '../../components/providers/LocaleAttributes';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locales, locale)) notFound();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleAttributes />
      <SuppressWarnings />
      {children}
    </NextIntlClientProvider>
  );
}
