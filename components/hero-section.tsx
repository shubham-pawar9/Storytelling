'use client';

import Image from 'next/image';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {useTranslations, useLocale} from 'next-intl';
import {ArrowRight} from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('Home');
  const locale = useLocale();

  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
      <motion.div initial={{opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{duration: 0.7}} className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">{t('eyebrow')}</p>
          <h1 className="max-w-xl font-serif text-5xl leading-none text-foreground sm:text-6xl lg:text-7xl">
            {t('title')}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted">{t('description')}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href={`/${locale}/stories/ramayana/1`} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white transition active:translate-y-0.5 dark:text-stone-950">
            {t('startReading')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/${locale}/library`} className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-foreground transition hover:border-primary hover:text-primary">
            {t('browseLibrary')}
          </Link>
        </div>
      </motion.div>
      <motion.div initial={{opacity: 0, scale: 0.97}} animate={{opacity: 1, scale: 1, y: [0, -6, 0]}} transition={{duration: 4.8, repeat: Infinity, repeatType: 'mirror'}} className="relative mx-auto w-full max-w-xl">
        <div className="paper-panel relative overflow-hidden p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-primary/10" />
          <Image src="/art/hero-portal.svg" alt={t('heroArtworkAlt')} width={740} height={840} className="relative h-auto w-full rounded-[1.5rem] object-cover shadow-float" priority />
        </div>
      </motion.div>
    </section>
  );
}
