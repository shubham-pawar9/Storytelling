'use client';

import {Menu, Sparkles} from 'lucide-react';
import {useTranslations, useLocale} from 'next-intl';
import {useState} from 'react';
import {ThemeToggle} from './theme-toggle';
import {LanguageSwitcher} from './language-switcher';
import {cn} from './utils';
import {LoaderLink} from './loader-link';

export function Header() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const links = [
    {href: `/${locale}`, label: t('home')},
    {href: `/${locale}/library`, label: t('library')},
    {href: `/${locale}/stories/ramayana/1`, label: t('reader')}
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="editorial-shell flex items-center justify-between gap-4 py-4">
        <LoaderLink href={`/${locale}`} className="flex items-center gap-3 text-primary" loaderMessage="Loading...">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold tracking-wide">AI Storytelling</p>
            <p className="text-xs uppercase tracking-[0.25em] text-muted">{t('brandTagline')}</p>
          </div>
        </LoaderLink>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <LoaderLink key={link.href} href={link.href} className="text-sm text-muted transition hover:text-primary" loaderMessage="Loading...">
              {link.label}
            </LoaderLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <ThemeToggle label={t('toggleTheme')} />
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card md:hidden"
          aria-label={t('openMenu')}
          onClick={() => setOpen((value: boolean) => !value)}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <div className={cn('border-t border-border bg-card/95 md:hidden', open ? 'block' : 'hidden')}>
        <div className="editorial-shell flex flex-col gap-4 py-4">
          {links.map((link) => (
            <LoaderLink key={link.href} href={link.href} className="text-sm text-muted" onClick={() => setOpen(false)} loaderMessage="Loading...">
              {link.label}
            </LoaderLink>
          ))}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle label={t('toggleTheme')} />
          </div>
        </div>
      </div>
    </header>
  );
}
