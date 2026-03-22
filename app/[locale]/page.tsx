import {getLocale, getTranslations} from 'next-intl/server';
import {HeroSection} from '@/components/hero-section';
import {FeaturedNarrative} from '@/components/featured-narrative';
import {StoryGrid} from '@/components/story-grid';
import {getStories} from '@/data/stories';
import type {Locale} from '@/i18n/config';

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('Home');
  const stories = getStories(locale);

  return (
    <div className="space-y-16 sm:space-y-20">
      <HeroSection />
      <FeaturedNarrative story={stories[0]} locale={locale} />
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">{t('previewLabel')}</p>
            <h2 className="font-serif text-4xl">{t('previewTitle')}</h2>
          </div>
        </div>
        <StoryGrid stories={stories.slice(0, 3)} locale={locale} />
      </section>
    </div>
  );
}
