'use client';

import {Globe, Volume2, VolumeX} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {ThemeToggle} from './theme-toggle';
import {LanguageSwitcher} from './language-switcher';

export function ReaderToolbar() {
  const t = useTranslations('Controls');
  const [audioOn, setAudioOn] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ThemeToggle label={t('toggleTheme')} />
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted">
        <Globe className="h-4 w-4" />
        <LanguageSwitcher />
      </div>
      <button
        type="button"
        aria-pressed={audioOn}
        aria-label={t('toggleAudio')}
        onClick={() => setAudioOn((value: boolean) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:border-primary"
      >
        {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {audioOn ? t('audioOn') : t('audioOff')}
      </button>
    </div>
  );
}
