'use client';

import Link from 'next/link';
import {Menu, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {cn} from './utils';
import type {Episode} from '@/data/stories';

export function EpisodeSidebar({episodes, activeEpisode, locale, storyId}: {episodes: Episode[]; activeEpisode: number; locale: string; storyId: string}) {
  const t = useTranslations('Reader');
  const [open, setOpen] = useState(false);

  const list = (
    <div className="paper-panel h-full overflow-hidden">
      <div className="border-b border-border px-4 py-4">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">{t('episodeGuide')}</p>
      </div>
      <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4 lg:max-h-[calc(100vh-14rem)]">
        {episodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/${locale}/stories/${storyId}/${episode.episodeNumber}`}
            onClick={() => setOpen(false)}
            className={cn(
              'block rounded-2xl border px-4 py-3 text-sm transition',
              episode.episodeNumber === activeEpisode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background/50 text-muted hover:border-primary/40 hover:text-foreground'
            )}
          >
            <span className="block text-xs uppercase tracking-[0.25em]">{t('part', {number: episode.episodeNumber})}</span>
            <span className="mt-1 block font-medium text-foreground">{episode.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="sticky bottom-4 z-30 inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg lg:hidden dark:text-stone-950"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
        {t('episodes')}
      </button>
      <div className="hidden lg:block">{list}</div>
      <div className={cn('fixed inset-0 z-50 bg-black/50 p-4 lg:hidden', open ? 'block' : 'hidden')}>
        <div className="mx-auto flex h-full max-w-sm flex-col gap-4">
          <button
            type="button"
            aria-label={t('closeEpisodes')}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-card"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-h-0 flex-1">{list}</div>
        </div>
      </div>
    </>
  );
}
