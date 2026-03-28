'use client';

import {ChevronLeft, ChevronRight, Expand, X} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {Episode, Story} from '@/data/stories';
import type {Locale} from '@/i18n/config';
import {StoryImage} from './story-image';
import {cn} from './utils';

type ReaderContentProps = {
  story: Story;
  episode: Episode;
  episodes: Episode[];
  locale: Locale;
  storyId: string;
  labels: {
    fullscreen: string;
    closeFullscreen: string;
    audioHeading: string;
    playAudio: string;
    pauseAudio: string;
    audioAvailable: string;
    audioFallback: string;
    audioUnavailable: string;
    audioEnhanced: string;
    audioLoading: string;
    pageHint: string;
    nextEpisode: string;
    previousEpisode: string;
  };
};

const CONTROLS_AUTOHIDE_MS = 2800;

function paginateEpisodeContent(content: string[], viewportHeight: number) {
  const normalizedHeight = Math.max(viewportHeight, 640);
  const charsPerPage = Math.max(900, Math.floor((normalizedHeight / 860) * 1700));
  const sentenceChunks = content
    .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/u))
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (!sentenceChunks.length) {
    return [''];
  }

  const pages: string[] = [];
  let currentPage = '';

  for (const chunk of sentenceChunks) {
    if (!currentPage) {
      currentPage = chunk;
      continue;
    }

    if (currentPage.length + chunk.length + 1 > charsPerPage) {
      pages.push(currentPage);
      currentPage = chunk;
      continue;
    }

    currentPage = `${currentPage} ${chunk}`;
  }

  if (currentPage) {
    pages.push(currentPage);
  }

  return pages;
}

export function ReaderContent({story, episode, episodes, locale, storyId, labels}: ReaderContentProps) {
  const router = useRouter();
  const readingContainerRef = useRef<HTMLElement | null>(null);
  const pageScrollRef = useRef<HTMLDivElement | null>(null);
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [currentPage, setCurrentPage] = useState(1);

  const previousEpisodeNumber = useMemo(
    () => (episode.episodeNumber > 1 ? episode.episodeNumber - 1 : episode.episodeNumber),
    [episode.episodeNumber]
  );
  const nextEpisodeNumber = useMemo(
    () => (episode.episodeNumber < episodes.length ? episode.episodeNumber + 1 : episode.episodeNumber),
    [episode.episodeNumber, episodes.length]
  );
  const isFirstEpisode = episode.episodeNumber === 1;
  const isLastEpisode = episode.episodeNumber === episodes.length;

  const paginatedPages = useMemo(() => paginateEpisodeContent(episode.content, viewportHeight), [episode.content, viewportHeight]);
  const totalPages = paginatedPages.length;

  const clearControlsTimer = useCallback(() => {
    if (!controlsHideTimer.current) {
      return;
    }

    clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = null;
  }, []);

  const armControlsAutoHide = useCallback(() => {
    clearControlsTimer();

    if (!isFullscreen) {
      return;
    }

    controlsHideTimer.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, CONTROLS_AUTOHIDE_MS);
  }, [clearControlsTimer, isFullscreen]);

  const revealControls = useCallback(() => {
    if (!isFullscreen) {
      return;
    }

    setIsControlsVisible(true);
    armControlsAutoHide();
  }, [armControlsAutoHide, isFullscreen]);

  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      return;
    }

    try {
      await document.exitFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined' || !readingContainerRef.current) {
      return;
    }

    if (document.fullscreenElement === readingContainerRef.current) {
      return;
    }

    try {
      await readingContainerRef.current.requestFullscreen({navigationUI: 'hide'});
      setIsFullscreen(true);
      setIsControlsVisible(true);
      armControlsAutoHide();
    } catch {
      // Browser can reject fullscreen for platform or permission reasons.
    }
  }, [armControlsAutoHide]);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
      return;
    }

    await enterFullscreen();
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  const goToPreviousEpisode = useCallback(() => {
    if (isFirstEpisode) {
      return;
    }

    router.push(`/${locale}/stories/${storyId}/${previousEpisodeNumber}`);
  }, [isFirstEpisode, locale, previousEpisodeNumber, router, storyId]);

  const goToNextEpisode = useCallback(() => {
    if (isLastEpisode) {
      return;
    }

    router.push(`/${locale}/stories/${storyId}/${nextEpisodeNumber}`);
  }, [isLastEpisode, locale, nextEpisodeNumber, router, storyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [episode.id, isFullscreen]);

  useEffect(() => {
    const syncViewportHeight = () => {
      setViewportHeight(window.innerHeight || 900);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);

    return () => {
      window.removeEventListener('resize', syncViewportHeight);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = document.fullscreenElement === readingContainerRef.current;
      setIsFullscreen(fullscreenActive);
      setIsControlsVisible(fullscreenActive);

      if (fullscreenActive) {
        armControlsAutoHide();
      } else {
        clearControlsTimer();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [armControlsAutoHide, clearControlsTimer]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        void exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [exitFullscreen, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => () => clearControlsTimer(), [clearControlsTimer]);

  useEffect(() => {
    if (!isFullscreen || !pageScrollRef.current) {
      return;
    }

    const scrollElement = pageScrollRef.current;

    const handleScroll = () => {
      const page = Math.round(scrollElement.scrollTop / Math.max(scrollElement.clientHeight, 1)) + 1;
      const clampedPage = Math.min(Math.max(page, 1), totalPages);
      setCurrentPage(clampedPage);
      revealControls();
    };

    scrollElement.addEventListener('scroll', handleScroll, {passive: true});

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [isFullscreen, revealControls, totalPages]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const onMouseMove = () => {
      revealControls();
    };

    window.addEventListener('mousemove', onMouseMove, {passive: true});

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isFullscreen, revealControls]);

  return (
    <article className="space-y-8">
      <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] border border-border shadow-paper">
        <StoryImage src={episode.aiImage} alt={episode.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">{story.genre}</p>
          <h1 className="font-serif text-4xl sm:text-5xl">{story.title}</h1>
          <h2 className="text-xl text-muted">{episode.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            void toggleFullscreen();
          }}
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary"
        >
          {isFullscreen ? <X className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          {isFullscreen ? labels.closeFullscreen : labels.fullscreen}
        </button>
      </header>

      <section
        ref={readingContainerRef}
        className={cn(
          'relative isolate flex min-h-0 flex-col overflow-hidden border border-border bg-card transition-all duration-300',
          isFullscreen
            ? 'h-screen w-screen max-w-none rounded-none border-0 bg-background text-foreground'
            : 'paper-panel max-h-[75vh] rounded-[2rem]'
        )}
        onPointerDown={revealControls}
        onTouchStart={revealControls}
      >
        {isFullscreen ? (
          <>
            <div
              className={cn(
                'absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur transition-opacity duration-300 sm:px-6',
                isControlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
                paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
                paddingRight: 'max(env(safe-area-inset-right), 1rem)'
              }}
            >
              <p className="truncate text-xs uppercase tracking-[0.2em] text-muted sm:text-sm">
                {story.title} · {episode.title}
              </p>
              <button
                type="button"
                aria-label={labels.closeFullscreen}
                onClick={() => {
                  void exitFullscreen();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground"
              >
                <X className="h-4 w-4" />
                {labels.closeFullscreen}
              </button>
            </div>

            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-background/90 via-background/50 to-transparent transition-opacity duration-300',
                isControlsVisible ? 'opacity-100' : 'opacity-0'
              )}
            />

            <div
              className={cn(
                'absolute inset-x-0 bottom-0 z-40 px-4 pb-3 transition-opacity duration-300 sm:px-6',
                isControlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
              style={{
                paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 0.75rem), 0.75rem)',
                paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
                paddingRight: 'max(env(safe-area-inset-right), 1rem)'
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-label={labels.previousEpisode}
                  disabled={isFirstEpisode}
                  onClick={goToPreviousEpisode}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground backdrop-blur transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {labels.previousEpisode}
                </button>
                <button
                  type="button"
                  aria-label={labels.nextEpisode}
                  disabled={isLastEpisode}
                  onClick={goToNextEpisode}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground backdrop-blur transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {labels.nextEpisode}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 bottom-16 z-40 flex justify-center px-4 transition-opacity duration-300',
                isControlsVisible ? 'opacity-85' : 'opacity-0'
              )}
              style={{
                bottom: 'max(calc(env(safe-area-inset-bottom) + 4rem), 4rem)'
              }}
              aria-live="polite"
            >
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs tracking-[0.2em] text-foreground/90 backdrop-blur">
                Page {currentPage} / {totalPages}
              </span>
            </div>
          </>
        ) : null}

        <div
          ref={pageScrollRef}
          className={cn(
            'drop-cap overflow-y-auto overscroll-contain px-6 py-8 sm:px-8 lg:px-10',
            isFullscreen
              ? 'h-screen w-screen snap-y snap-mandatory scroll-smooth bg-background px-0 py-0'
              : 'scroll-smooth'
          )}
          style={
            isFullscreen
              ? {
                  scrollPaddingTop: 'max(calc(env(safe-area-inset-top) + 5rem), 5.5rem)',
                  scrollPaddingBottom: 'max(calc(env(safe-area-inset-bottom) + 6.5rem), 6.5rem)'
                }
              : undefined
          }
          onWheel={revealControls}
        >
          {isFullscreen ? (
            paginatedPages.map((page, index) => (
              <div
                key={`${episode.id}-page-${index}`}
                className="mx-auto flex min-h-screen w-full max-w-3xl snap-start items-center px-6 sm:px-10"
                style={{
                  paddingTop: 'max(calc(env(safe-area-inset-top) + 5rem), 5.5rem)',
                  paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 7rem), 7.5rem)'
                }}
              >
                <p className="w-full text-lg leading-9 text-foreground">{page}</p>
              </div>
            ))
          ) : (
            <div className="mx-auto max-w-3xl">
              {episode.content.map((paragraph, index) => (
                <p key={`${episode.id}-${index}`} className="mb-6 text-lg leading-9 text-foreground last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="hidden justify-end lg:flex">
        <button
          type="button"
          onClick={goToNextEpisode}
          disabled={isLastEpisode}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.nextEpisode}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
