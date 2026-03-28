'use client';

import {cn} from './utils';

type LoaderOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoaderOverlay({visible, message}: LoaderOverlayProps) {
  return (
    <div
      aria-live="polite"
      aria-busy={visible}
      className={cn(
        'pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-black/40 transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-background/90 px-6 py-5 shadow-2xl backdrop-blur">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" aria-hidden />
        {message ? <p className="text-sm font-medium text-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
