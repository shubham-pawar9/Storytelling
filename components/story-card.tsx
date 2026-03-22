import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import type {Story} from '@/data/stories';
import {StoryImage} from './story-image';

export async function StoryCard({story, locale}: {story: Story; locale: string}) {
  const t = await getTranslations('Library');

  return (
    <article className="group paper-panel flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-2">
      <div className="relative aspect-[4/5] overflow-hidden border-b border-border">
        <StoryImage src={story.coverImage} alt={story.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 30vw" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">{story.genre}</p>
            <h3 className="mt-2 font-serif text-2xl">{story.title}</h3>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
            {story.totalEpisodes} {t('parts')}
          </span>
        </div>
        <p className="flex-1 text-sm leading-7 text-muted">{story.description}</p>
        <Link href={`/${locale}/stories/${story.id}/1`} className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition active:translate-y-0.5 dark:text-stone-950">
          {t('readStory')}
        </Link>
      </div>
    </article>
  );
}
