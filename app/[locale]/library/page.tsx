import {getLocale, getTranslations} from 'next-intl/server';
import {StoryGrid} from '@/components/story-grid';
import {getStories} from '@/data/stories';
import type {Locale} from '@/i18n/config';

export default async function LibraryPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Library');
  const stories = await getStories(locale);

  return (
    <div className="space-y-10">
      <section className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-primary">{t('eyebrow')}</p>
        <h1 className="font-serif text-5xl">{t('title')}</h1>
        <p className="text-lg leading-8 text-muted">{t('description')}</p>
      </section>
      <StoryGrid stories={stories} locale={locale} />
    </div>
  );
}
