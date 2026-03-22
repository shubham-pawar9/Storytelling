import {getTranslations} from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="mt-20 border-t border-border py-10 text-sm text-muted">
      <div className="editorial-shell flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{t('tagline')}</p>
        <p>{t('copyright')}</p>
      </div>
    </footer>
  );
}
