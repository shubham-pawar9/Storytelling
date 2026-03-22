'use client';

import type {ChangeEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import {languages} from '@/messages/languages';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('Controls');
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (nextLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    router.replace(segments.join('/'));
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted">
      <span className="sr-only">{t('languageSelector')}</span>
      <select
        aria-label={t('languageSelector')}
        value={locale}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => handleChange(event.target.value)}
        className="bg-transparent text-foreground outline-none"
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value} className="text-black">
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
