import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import {EpisodeSidebar} from '@/components/episode-sidebar';
import {ProgressBar} from '@/components/progress-bar';
import {ReaderContent} from '@/components/reader-content';
import {ReaderToolbar} from '@/components/reader-toolbar';
import {getEpisode, getEpisodes, getStory} from '@/data/stories';
import type {Locale} from '@/i18n/config';

export default async function StoryReaderPage({params}: {params: Promise<{storyId: string; episode: string}>}) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Reader');
  const {storyId, episode} = await params;
  const episodeNumber = Number(episode);
  const storyRecord = getStory(locale, storyId);
  const currentEpisodeRecord = getEpisode(locale, storyId, episodeNumber);

  if (!storyRecord || !currentEpisodeRecord) {
    notFound();
  }

  const story = storyRecord;
  const currentEpisode = currentEpisodeRecord;
  const episodes = getEpisodes(locale, storyId);
  const progress = (currentEpisode.episodeNumber / story.totalEpisodes) * 100;
  const prevEpisode = currentEpisode.episodeNumber > 1 ? currentEpisode.episodeNumber - 1 : null;
  const nextEpisode = currentEpisode.episodeNumber < story.totalEpisodes ? currentEpisode.episodeNumber + 1 : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href={`/${locale}`}>{t('home')}</Link>
            <span>/</span>
            <Link href={`/${locale}/library`}>{t('library')}</Link>
            <span>/</span>
            <span className="text-foreground">{story.title}</span>
          </nav>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">{t('readingNow')}</p>
            <h1 className="font-serif text-4xl">{story.title}</h1>
          </div>
        </div>
        <ReaderToolbar />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <EpisodeSidebar episodes={episodes} activeEpisode={currentEpisode.episodeNumber} locale={locale} storyId={storyId} />
        <div className="space-y-8">
          <ReaderContent story={story} episode={currentEpisode} />
          <div className="paper-panel space-y-6 p-6">
            <ProgressBar value={progress} label={t('readingProgress')} />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              {prevEpisode ? (
                <Link href={`/${locale}/stories/${storyId}/${prevEpisode}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary">
                  <ChevronLeft className="h-4 w-4" />
                  {t('previousEpisode')}
                </Link>
              ) : <div />}
              {nextEpisode ? (
                <Link href={`/${locale}/stories/${storyId}/${nextEpisode}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition active:translate-y-0.5 dark:text-stone-950">
                  {t('nextEpisode')}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
