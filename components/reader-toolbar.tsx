'use client';

import {Globe} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {ThemeToggle} from './theme-toggle';
import {LanguageSwitcher} from './language-switcher';

export function ReaderToolbar() {
  const t = useTranslations('Controls');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ThemeToggle label={t('toggleTheme')} />
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted">
        <Globe className="h-4 w-4" />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
