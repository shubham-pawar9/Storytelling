import {notFound} from 'next/navigation';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import type {ReactNode} from 'react';
import {locales} from '@/i18n/config';
import {ThemeProvider} from '@/components/theme-provider';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {LoaderProvider} from '@/components/loader-context';

export default async function LocaleLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <LoaderProvider>
          <div className="min-h-screen">
            <Header />
            <main className="editorial-shell py-10 sm:py-14">{children}</main>
            <Footer />
          </div>
        </LoaderProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
