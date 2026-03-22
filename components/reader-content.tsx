'use client';

import {AnimatePresence, motion} from 'framer-motion';
import {BookOpen, ChevronLeft, ChevronRight, Expand, X} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Episode, Story} from '@/data/stories';
import type {Locale} from '@/i18n/config';
import {EpisodeAudioPlayer} from './episode-audio-player';
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

export function ReaderContent({story, episode, episodes, locale, storyId, labels}: ReaderContentProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(() => episodes.findIndex((entry) => entry.id === episode.id));
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setFullscreenIndex(episodes.findIndex((entry) => entry.id === episode.id));
  }, [episode.id, episodes]);

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

  const currentFullscreenEpisode = useMemo(() => episodes[Math.max(fullscreenIndex, 0)] ?? episode, [episode, episodes, fullscreenIndex]);

  const changeEpisode = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= episodes.length) {
      return;
    }

    setDirection(nextIndex > fullscreenIndex ? 1 : -1);
    setFullscreenIndex(nextIndex);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);

    if (currentFullscreenEpisode.id !== episode.id) {
      router.push(`/${locale}/stories/${storyId}/${currentFullscreenEpisode.episodeNumber}`);
    }
  };

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
          {episode.content.map((paragraph) => (
            <p key={paragraph} className="mb-6 max-w-3xl text-lg leading-9 text-foreground/90 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        <EpisodeAudioPlayer
          episode={episode}
          locale={locale}
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
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md"
          >
            <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary">{story.title}</p>
                  <p className="mt-1 text-sm text-muted">{labels.pageHint}</p>
                </div>
                <button
                  type="button"
                  aria-label={labels.closeFullscreen}
                  onClick={handleCloseFullscreen}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                className="reader-book relative flex-1 overflow-hidden rounded-[2rem] border border-border bg-card/95 p-3 shadow-paper sm:p-5"
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
                    changeEpisode(fullscreenIndex + 1);
                  } else {
                    changeEpisode(fullscreenIndex - 1);
                  }
                }}
                onContextMenu={(event) => {
                  const width = event.currentTarget.clientWidth;
                  const clickX = event.clientX - event.currentTarget.getBoundingClientRect().left;
                  if (clickX > width / 2) {
                    event.preventDefault();
                    changeEpisode(fullscreenIndex + 1);
                  }
                }}
              >
                <button
                  type="button"
                  aria-label={labels.previousEpisode}
                  className="absolute inset-y-0 left-0 z-10 hidden w-20 items-center justify-center text-muted transition hover:text-primary sm:flex"
                  onClick={() => changeEpisode(fullscreenIndex - 1)}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  aria-label={labels.nextEpisode}
                  className="absolute inset-y-0 right-0 z-10 hidden w-20 items-center justify-center text-muted transition hover:text-primary sm:flex"
                  onClick={() => changeEpisode(fullscreenIndex + 1)}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                <div className="flex h-full flex-col justify-center px-2 sm:px-14">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentFullscreenEpisode.id}
                      custom={direction}
                      initial={{rotateY: direction > 0 ? -80 : 80, opacity: 0, x: direction > 0 ? 90 : -90}}
                      animate={{rotateY: 0, opacity: 1, x: 0}}
                      exit={{rotateY: direction > 0 ? 80 : -80, opacity: 0, x: direction > 0 ? -90 : 90}}
                      transition={{duration: 0.45, ease: 'easeInOut'}}
                      className="reader-page mx-auto flex h-full w-full max-w-5xl origin-center flex-col overflow-hidden rounded-[1.75rem] border border-border bg-background px-5 py-6 sm:px-8 sm:py-8"
                    >
                      <div className="mb-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-border">
                          <StoryImage src={currentFullscreenEpisode.aiImage} alt={currentFullscreenEpisode.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 35vw" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.25em] text-primary">
                            <BookOpen className="h-3.5 w-3.5" />
                            {currentFullscreenEpisode.title}
                          </div>
                          <div className="mt-4 space-y-4 overflow-auto pr-2 sm:max-h-[62vh]">
                            {currentFullscreenEpisode.content.map((paragraph) => (
                              <p key={`${currentFullscreenEpisode.id}-${paragraph.slice(0, 24)}`} className="text-base leading-8 text-foreground/90 sm:text-lg">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm text-muted">
                        <span>{labels.previousEpisode}</span>
                        <span>
                          {fullscreenIndex + 1} / {episodes.length}
                        </span>
                        <span>{labels.nextEpisode}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="absolute inset-y-0 left-0 w-1/2"
                  onClick={() => changeEpisode(fullscreenIndex - 1)}
                />
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 w-1/2"
                  onClick={() => changeEpisode(fullscreenIndex + 1)}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
