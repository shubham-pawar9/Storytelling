import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import type {Story} from '@/data/stories';

export async function FeaturedNarrative({story, locale}: {story: Story; locale: string}) {
  const t = await getTranslations('Home');

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="paper-panel grid gap-6 p-6 lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">{t('featuredLabel')}</p>
          <h2 className="font-serif text-4xl">{story.title}</h2>
          <p className="text-muted leading-8">{story.description}</p>
          <Link href={`/${locale}/stories/${story.id}/1`} className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary">
            {t('readFeatured')}
          </Link>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] border border-border">
          <Image src={story.featureImage} alt={story.title} fill className="object-cover" />
        </div>
      </article>
      <aside className="paper-panel flex flex-col justify-between gap-8 p-8">
        <p className="font-serif text-3xl leading-tight text-primary">“{story.quote}”</p>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{t('editorNote')}</p>
          <p className="mt-3 text-sm leading-7 text-muted">{t('editorDescription')}</p>
        </div>
      </aside>
    </section>
  );
}
