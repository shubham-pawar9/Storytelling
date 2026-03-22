'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {ChevronLeft, ChevronRight, Expand, LoaderCircle, X} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {Episode, Story} from '@/data/stories';
import type {Locale} from '@/i18n/config';
import {EpisodeAudioPlayer, type EpisodeAudioPlayerHandle} from './episode-audio-player';
import {StoryImage} from './story-image';

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

function getHighlightClass(isActive: boolean) {
  return isActive
    ? 'bg-yellow-300/80 text-foreground shadow-[0_0_0_0.25rem_rgba(253,224,71,0.28)] dark:bg-yellow-300/70'
    : 'bg-transparent';
}

export function ReaderContent({story, episode, episodes, locale, storyId, labels}: ReaderContentProps) {
  const router = useRouter();
  const fullscreenAudioRef = useRef<EpisodeAudioPlayerHandle | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(() => episodes.findIndex((entry) => entry.id === episode.id));
  const [direction, setDirection] = useState(1);
  const [isFullscreenAudioEnabled, setIsFullscreenAudioEnabled] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [activeReadingParagraph, setActiveReadingParagraph] = useState<number | null>(null);
  const [activeFullscreenParagraph, setActiveFullscreenParagraph] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const stopAutoplayCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    setAutoplayCountdown(null);
  }, []);

  useEffect(() => {
    setSpreadIndex(episodes.findIndex((entry) => entry.id === episode.id));
    setActiveReadingParagraph(null);
  }, [episode.id, episodes]);

  useEffect(() => {
    setActiveFullscreenParagraph(null);
  }, [spreadIndex]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      stopAutoplayCountdown();
    };
  }, [stopAutoplayCountdown]);

  const currentSpread = useMemo(
    () => ({
      left: episodes[Math.max(spreadIndex, 0)] ?? episode,
      right: episodes[spreadIndex + 1] ?? null
    }),
    [episode, episodes, spreadIndex]
  );

  const canGoPrevious = spreadIndex > 0;
  const canGoNext = spreadIndex < episodes.length - 1;
  const previousEpisodeNumber = episode.episodeNumber > 1 ? episode.episodeNumber - 1 : 1;
  const nextEpisodeNumber = episode.episodeNumber < episodes.length ? episode.episodeNumber + 1 : episode.episodeNumber;

  const changeSpread = useCallback((nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= episodes.length) {
      return;
    }

    fullscreenAudioRef.current?.pause();
    setActiveFullscreenParagraph(null);
    stopAutoplayCountdown();
    setDirection(nextIndex > spreadIndex ? 1 : -1);
    setSpreadIndex(nextIndex);
  }, [episodes.length, spreadIndex, stopAutoplayCountdown]);

  const handlePreviousEpisode = useCallback(() => {
    router.push(`/${locale}/stories/${storyId}/${previousEpisodeNumber}`);
  }, [locale, previousEpisodeNumber, router, storyId]);

  const handleNextEpisode = useCallback(() => {
    router.push(`/${locale}/stories/${storyId}/${nextEpisodeNumber}`);
  }, [locale, nextEpisodeNumber, router, storyId]);

  const handleCloseFullscreen = useCallback(() => {
    fullscreenAudioRef.current?.pause();
    stopAutoplayCountdown();
    setIsFullscreenAudioEnabled(false);
    setIsFullscreen(false);
    setActiveFullscreenParagraph(null);

    if (currentSpread.left.id !== episode.id) {
      router.push(`/${locale}/stories/${storyId}/${currentSpread.left.episodeNumber}`);
    }
  }, [currentSpread.left, episode.id, locale, router, stopAutoplayCountdown, storyId]);

  const handleFullscreenPlaybackStateChange = useCallback((playing: boolean) => {
    setIsFullscreenAudioEnabled(playing);

    if (!playing) {
      stopAutoplayCountdown();
    }
  }, [stopAutoplayCountdown]);

  const handleFullscreenEpisodeEnd = useCallback(() => {
    if (!isFullscreenAudioEnabled || !canGoNext) {
      return;
    }

    stopAutoplayCountdown();
    setAutoplayCountdown(10);

    countdownTimerRef.current = window.setInterval(() => {
      setAutoplayCountdown((currentValue) => {
        if (currentValue === null) {
          return null;
        }

        if (currentValue <= 1) {
          if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }

          changeSpread(spreadIndex + 1);
          return null;
        }

        return currentValue - 1;
      });
    }, 1000);
  }, [canGoNext, changeSpread, isFullscreenAudioEnabled, spreadIndex, stopAutoplayCountdown]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseFullscreen();
      }

      if (event.key === 'ArrowRight') {
        changeSpread(spreadIndex + 1);
      }

      if (event.key === 'ArrowLeft') {
        changeSpread(spreadIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeSpread, handleCloseFullscreen, isFullscreen, spreadIndex]);

  return (
    <>
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
            aria-label={labels.fullscreen}
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary hover:text-primary"
          >
            <Expand className="h-4 w-4" />
            {labels.fullscreen}
          </button>
        </header>
        <div className="paper-panel drop-cap px-6 py-8 sm:px-8 lg:px-10">
          {episode.content.map((paragraph, index) => (
            <p
              key={paragraph}
              className={`mb-6 max-w-3xl rounded-2xl px-3 py-2 text-lg leading-9 transition-colors last:mb-0 ${getHighlightClass(activeReadingParagraph === index)}`}
            >
              {paragraph}
            </p>
          ))}
        </div>
        <EpisodeAudioPlayer
          episode={episode}
          locale={locale}
          onActiveParagraphChange={setActiveReadingParagraph}
          navigation={{
            previousLabel: labels.previousEpisode,
            nextLabel: labels.nextEpisode,
            onPrevious: handlePreviousEpisode,
            onNext: handleNextEpisode,
            disableNext: episode.episodeNumber >= episodes.length
          }}
          labels={{
            heading: labels.audioHeading,
            play: labels.playAudio,
            pause: labels.pauseAudio,
            audioAvailable: labels.audioAvailable,
            audioFallback: labels.audioFallback,
            audioUnavailable: labels.audioUnavailable,
            audioEnhanced: labels.audioEnhanced,
            audioLoading: labels.audioLoading
          }}
        />
      </article>

      <AnimatePresence>
        {isFullscreen ? (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 z-[90] bg-background"
          >
            <button
              type="button"
              aria-label={labels.closeFullscreen}
              onClick={handleCloseFullscreen}
              className="absolute right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/85 text-foreground shadow-paper backdrop-blur sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" />
            </button>

            <EpisodeAudioPlayer
              ref={fullscreenAudioRef}
              episode={currentSpread.left}
              locale={locale}
              variant="fullscreen"
              autoPlay={isFullscreen && isFullscreenAudioEnabled && autoplayCountdown === null}
              onEnded={handleFullscreenEpisodeEnd}
              onPlaybackStateChange={handleFullscreenPlaybackStateChange}
              onActiveParagraphChange={setActiveFullscreenParagraph}
              navigation={{
                previousLabel: labels.previousEpisode,
                nextLabel: labels.nextEpisode,
                onPrevious: () => changeSpread(0),
                onNext: () => changeSpread(spreadIndex + 1),
                disableNext: !canGoNext
              }}
              labels={{
                heading: labels.audioHeading,
                play: labels.playAudio,
                pause: labels.pauseAudio,
                audioAvailable: labels.audioAvailable,
                audioFallback: labels.audioFallback,
                audioUnavailable: labels.audioUnavailable,
                audioEnhanced: labels.audioEnhanced,
                audioLoading: labels.audioLoading
              }}
            />

            {autoplayCountdown !== null ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-28 z-30 flex justify-center px-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-background/90 px-5 py-3 text-sm font-medium text-foreground shadow-paper backdrop-blur">
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                  <span>{`${labels.nextEpisode} • ${autoplayCountdown}s`}</span>
                </div>
              </div>
            ) : null}

            <div
              className="reader-book relative h-screen w-screen overflow-hidden bg-background"
              onTouchStart={(event) => {
                touchStartX.current = event.changedTouches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const touchEndX = event.changedTouches[0]?.clientX ?? null;
                if (touchStartX.current === null || touchEndX === null) {
                  return;
                }

                const delta = touchEndX - touchStartX.current;
                if (Math.abs(delta) < 40) {
                  return;
                }

                if (delta < 0) {
                  changeSpread(spreadIndex + 1);
                } else {
                  changeSpread(spreadIndex - 1);
                }
              }}
            >
              <button
                type="button"
                aria-label={labels.previousEpisode}
                className="absolute inset-y-0 left-0 z-20 hidden w-20 items-center justify-center bg-gradient-to-r from-background/70 to-transparent text-muted transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                onClick={() => changeSpread(spreadIndex - 1)}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                aria-label={labels.nextEpisode}
                className="absolute inset-y-0 right-0 z-20 hidden w-20 items-center justify-center bg-gradient-to-l from-background/70 to-transparent text-muted transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                onClick={() => changeSpread(spreadIndex + 1)}
                disabled={!canGoNext}
              >
                <ChevronRight className="h-8 w-8" />
              </button>

              <div className="flex h-full w-full items-stretch justify-center p-0 sm:px-20 sm:py-4 lg:px-24 lg:py-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSpread.left.id}
                    custom={direction}
                    initial={{rotateY: direction > 0 ? -18 : 18, opacity: 0.2, x: direction > 0 ? 80 : -80}}
                    animate={{rotateY: 0, opacity: 1, x: 0}}
                    exit={{rotateY: direction > 0 ? 16 : -16, opacity: 0.08, x: direction > 0 ? -80 : 80}}
                    transition={{duration: 0.5, ease: 'easeInOut'}}
                    className="reader-spread flex h-full w-full origin-center overflow-hidden border-y border-border bg-card sm:rounded-[2rem] sm:border"
                  >
                    {[currentSpread.left, currentSpread.right].map((spreadEpisode, pageIndex) => (
                      <section
                        key={spreadEpisode ? `${currentSpread.left.id}-${spreadEpisode.id}-${pageIndex}` : `${currentSpread.left.id}-blank-${pageIndex}`}
                        className="reader-sheet flex min-w-0 flex-1 flex-col overflow-hidden px-5 py-8 sm:px-8 lg:px-12"
                      >
                        {spreadEpisode ? (
                          <>
                            <div className="mb-6 flex items-start justify-between gap-4 border-b border-border/70 pb-4">
                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.35em] text-primary">{story.title}</p>
                                <h2 className="mt-3 font-serif text-2xl leading-tight sm:text-3xl">{spreadEpisode.title}</h2>
                              </div>
                              <span className="shrink-0 text-sm uppercase tracking-[0.3em] text-muted">
                                {spreadEpisode.episodeNumber}
                              </span>
                            </div>
                            <div className="book-scroll flex-1 overflow-auto pr-2">
                              <div className="space-y-5">
                                {spreadEpisode.content.map((paragraph, index) => (
                                  <p
                                    key={`${spreadEpisode.id}-${paragraph.slice(0, 24)}`}
                                    className={`rounded-2xl px-3 py-2 text-base leading-8 transition-colors sm:text-lg lg:leading-9 ${getHighlightClass(spreadEpisode.id === currentSpread.left.id && activeFullscreenParagraph === index)}`}
                                  >
                                    {paragraph}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-center text-sm uppercase tracking-[0.3em] text-muted">
                            {story.title}
                          </div>
                        )}
                      </section>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
