'use client';

import {LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2} from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import type {Episode} from '@/data/stories';
import type {Locale} from '@/i18n/config';

const speechLanguages: Record<Locale, string[]> = {
  en: ['en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi', 'en-IN', 'en-US'],
  mr: ['mr-IN', 'mr', 'hi-IN', 'hi', 'en-IN', 'en-US']
};

type NarrationSource = 'uploaded' | 'elevenlabs' | 'browser';
type PlayerVariant = 'default' | 'fullscreen';
type BrowserPlaybackState = 'idle' | 'playing' | 'paused';

type PlayerNavigation = {
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
};

type EpisodeAudioPlayerProps = {
  episode: Episode;
  locale: Locale;
  labels: {
    heading: string;
    play: string;
    pause: string;
    audioAvailable: string;
    audioFallback: string;
    audioUnavailable: string;
    audioEnhanced: string;
    audioLoading: string;
  };
  variant?: PlayerVariant;
  autoPlay?: boolean;
  onEnded?: () => void;
  onPlaybackStateChange?: (playing: boolean) => void;
  onActiveParagraphChange?: (index: number | null) => void;
  navigation?: PlayerNavigation;
};

export type EpisodeAudioPlayerHandle = {
  toggle: () => Promise<void>;
  pause: () => void;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

function getBestVoice(locale: Locale) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return null;
  }

  const preferredLanguages = speechLanguages[locale];

  for (const language of preferredLanguages) {
    const exactVoice = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase());
    if (exactVoice) {
      return exactVoice;
    }
  }

  for (const language of preferredLanguages) {
    const matchingVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(language.toLowerCase().split('-')[0]));
    if (matchingVoice) {
      return matchingVoice;
    }
  }

  return voices.find((voice) => voice.default) ?? voices[0] ?? null;
}

function getParagraphUnits(paragraph: string) {
  const normalized = paragraph.trim();
  if (!normalized) {
    return 1;
  }

  return Math.max(normalized.split(/\s+/).length, normalized.length / 12, 1);
}

function buildParagraphRanges(paragraphs: string[], duration: number) {
  if (!duration || duration <= 0 || !paragraphs.length) {
    return [] as Array<{start: number; end: number}>;
  }

  const totalUnits = paragraphs.reduce((sum, paragraph) => sum + getParagraphUnits(paragraph), 0);
  let cursor = 0;

  return paragraphs.map((paragraph, index) => {
    const slice = (getParagraphUnits(paragraph) / totalUnits) * duration;
    const start = cursor;
    const end = index === paragraphs.length - 1 ? duration : cursor + slice;
    cursor = end;
    return {start, end};
  });
}

export const EpisodeAudioPlayer = forwardRef<EpisodeAudioPlayerHandle, EpisodeAudioPlayerProps>(function EpisodeAudioPlayer(
  {
    episode,
    locale,
    labels,
    variant = 'default',
    autoPlay = false,
    onEnded,
    onPlaybackStateChange,
    onActiveParagraphChange,
    navigation
  },
  ref
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generatedAudioUrlRef = useRef<string | null>(null);
  const browserPlaybackStateRef = useRef<BrowserPlaybackState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elevenLabsUnavailable, setElevenLabsUnavailable] = useState(false);
  const [narrationSource, setNarrationSource] = useState<NarrationSource | null>(episode.audioUrl ? 'uploaded' : null);
  const textNarration = useMemo(() => episode.content.join(' '), [episode.content]);
  const hasUploadedAudio = Boolean(episode.audioUrl);
  const paragraphRanges = useMemo(() => buildParagraphRanges(episode.content, duration), [duration, episode.content]);

  const updateActiveParagraph = useCallback((index: number | null) => {
    onActiveParagraphChange?.(index);
  }, [onActiveParagraphChange]);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);

    const handleVoicesChanged = () => {
      setSpeechSupported(true);
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    }

    const audioElement = audioRef.current;

    return () => {
      audioElement?.pause();

      if (generatedAudioUrlRef.current) {
        URL.revokeObjectURL(generatedAudioUrlRef.current);
        generatedAudioUrlRef.current = null;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

  useEffect(() => {
    onPlaybackStateChange?.(isPlaying);
  }, [isPlaying, onPlaybackStateChange]);

  const pausePlayback = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (browserPlaybackStateRef.current === 'playing') {
        window.speechSynthesis.pause();
        browserPlaybackStateRef.current = 'paused';
      }
    }

    setIsPlaying(false);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setElevenLabsUnavailable(false);
    setNarrationSource(episode.audioUrl ? 'uploaded' : null);
    browserPlaybackStateRef.current = 'idle';
    updateActiveParagraph(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    if (generatedAudioUrlRef.current) {
      URL.revokeObjectURL(generatedAudioUrlRef.current);
      generatedAudioUrlRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [episode.audioUrl, episode.id, updateActiveParagraph]);

  useEffect(() => {
    if (!paragraphRanges.length || narrationSource === 'browser') {
      return;
    }

    if (!isPlaying && currentTime === 0) {
      updateActiveParagraph(null);
      return;
    }

    const nextIndex = paragraphRanges.findIndex(({start, end}, index) => {
      const isLast = index === paragraphRanges.length - 1;
      return currentTime >= start && (isLast ? currentTime <= end : currentTime < end);
    });

    updateActiveParagraph(nextIndex >= 0 ? nextIndex : null);
  }, [currentTime, isPlaying, narrationSource, paragraphRanges, updateActiveParagraph]);

  const startSpeechNarration = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !episode.content.length) {
      return false;
    }

    if (browserPlaybackStateRef.current === 'paused' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      browserPlaybackStateRef.current = 'playing';
      setNarrationSource('browser');
      setIsPlaying(true);
      return true;
    }

    window.speechSynthesis.cancel();

    const voice = getBestVoice(locale);
    const utterances = episode.content
      .map((paragraph, index) => ({paragraph: paragraph.trim(), index}))
      .filter(({paragraph}) => Boolean(paragraph))
      .map(({paragraph, index}, utteranceIndex, utteranceList) => {
        const utterance = new SpeechSynthesisUtterance(paragraph);
        utterance.lang = voice?.lang ?? speechLanguages[locale][0];
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onstart = () => {
          browserPlaybackStateRef.current = 'playing';
          setNarrationSource('browser');
          setIsPlaying(true);
          updateActiveParagraph(index);
        };
        utterance.onpause = () => {
          browserPlaybackStateRef.current = 'paused';
          setIsPlaying(false);
        };
        utterance.onresume = () => {
          browserPlaybackStateRef.current = 'playing';
          setIsPlaying(true);
          updateActiveParagraph(index);
        };
        utterance.onend = () => {
          const isLastParagraph = utteranceIndex === utteranceList.length - 1;
          if (isLastParagraph) {
            browserPlaybackStateRef.current = 'idle';
            setIsPlaying(false);
            updateActiveParagraph(null);
            onEnded?.();
          }
        };
        utterance.onerror = () => {
          browserPlaybackStateRef.current = 'idle';
          setIsPlaying(false);
          updateActiveParagraph(null);
        };
        return utterance;
      });

    if (!utterances.length) {
      return false;
    }

    utterances.forEach((utterance) => window.speechSynthesis.speak(utterance));
    return true;
  }, [episode.content, locale, onEnded, updateActiveParagraph]);

  const playAudioElement = useCallback(async (src: string, source: NarrationSource) => {
    if (!audioRef.current) {
      return false;
    }

    if (audioRef.current.src !== src) {
      audioRef.current.src = src;
      audioRef.current.load();
    }

    try {
      await audioRef.current.play();
      setNarrationSource(source);
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }, []);

  const loadGeneratedAudio = useCallback(async () => {
    if (!textNarration.trim()) {
      return false;
    }

    setIsLoading(true);
    setElevenLabsUnavailable(false);

    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locale,
          text: textNarration
        })
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('audio')) {
        setElevenLabsUnavailable(true);
        return false;
      }

      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);

      if (generatedAudioUrlRef.current) {
        URL.revokeObjectURL(generatedAudioUrlRef.current);
      }

      generatedAudioUrlRef.current = objectUrl;
      return await playAudioElement(objectUrl, 'elevenlabs');
    } catch {
      setElevenLabsUnavailable(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [locale, playAudioElement, textNarration]);

  const startPlayback = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (browserPlaybackStateRef.current === 'paused' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      browserPlaybackStateRef.current = 'playing';
      setNarrationSource('browser');
      setIsPlaying(true);
      return;
    }

    if ((hasUploadedAudio || narrationSource === 'elevenlabs') && audioRef.current) {
      const activeSource = hasUploadedAudio ? episode.audioUrl : generatedAudioUrlRef.current;
      if (activeSource) {
        await playAudioElement(activeSource, hasUploadedAudio ? 'uploaded' : 'elevenlabs');
      }
      return;
    }

    if (!hasUploadedAudio) {
      const generatedAudioStarted = await loadGeneratedAudio();
      if (generatedAudioStarted) {
        return;
      }
    }

    startSpeechNarration();
  }, [episode.audioUrl, hasUploadedAudio, isLoading, loadGeneratedAudio, narrationSource, playAudioElement, startSpeechNarration]);

  const handleToggle = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (isPlaying) {
      pausePlayback();
      return;
    }

    await startPlayback();
  }, [isLoading, isPlaying, pausePlayback, startPlayback]);

  useImperativeHandle(ref, () => ({
    toggle: handleToggle,
    pause: pausePlayback
  }), [handleToggle, pausePlayback]);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    void startPlayback();
  }, [autoPlay, episode.id, startPlayback]);

  const isUnavailable = !hasUploadedAudio && !speechSupported && !textNarration.trim();
  const statusText = isLoading
    ? labels.audioLoading
    : hasUploadedAudio || narrationSource === 'uploaded'
      ? labels.audioAvailable
      : narrationSource === 'elevenlabs'
        ? labels.audioEnhanced
        : narrationSource === 'browser' || elevenLabsUnavailable
          ? speechSupported
            ? labels.audioFallback
            : labels.audioUnavailable
          : textNarration.trim()
            ? labels.audioEnhanced
            : labels.audioUnavailable;

  const showProgress = (hasUploadedAudio || narrationSource === 'elevenlabs') && variant === 'default';

  return (
    <>
      {variant === 'default' ? (
        <section className="paper-panel space-y-5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary">{labels.heading}</p>
              <p className="mt-2 text-sm text-muted">{statusText}</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {navigation ? (
                <button
                  type="button"
                  aria-label={navigation.previousLabel}
                  onClick={navigation.onPrevious}
                  disabled={navigation.disablePrevious}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void handleToggle();
                }}
                disabled={isUnavailable || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:text-stone-950"
              >
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? labels.pause : labels.play}
              </button>
              {navigation ? (
                <button
                  type="button"
                  aria-label={navigation.nextLabel}
                  onClick={navigation.onNext}
                  disabled={navigation.disableNext}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {showProgress ? (
            <div className="space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-background/80">
                <div className="h-full rounded-full bg-primary transition-all" style={{width: `${duration ? (currentTime / duration) * 100 : 0}%`}} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted">
                <span>{formatTime(currentTime)}</span>
                <span className="inline-flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-background/88 px-4 py-3 shadow-paper backdrop-blur">
            {navigation ? (
              <button
                type="button"
                aria-label={navigation.previousLabel}
                onClick={navigation.onPrevious}
                disabled={navigation.disablePrevious}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SkipBack className="h-5 w-5" />
              </button>
            ) : null}
            <button
              type="button"
              aria-label={isPlaying ? labels.pause : labels.play}
              onClick={() => {
                void handleToggle();
              }}
              disabled={isUnavailable || isLoading}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-paper transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-950"
            >
              {isLoading ? <LoaderCircle className="h-7 w-7 animate-spin" /> : isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
            </button>
            {navigation ? (
              <button
                type="button"
                aria-label={navigation.nextLabel}
                onClick={navigation.onNext}
                disabled={navigation.disableNext}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          <span className="sr-only">{statusText}</span>
        </div>
      )}

      <audio
        ref={audioRef}
        src={hasUploadedAudio ? episode.audioUrl : undefined}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => {
          setCurrentTime(duration);
          setIsPlaying(false);
          updateActiveParagraph(null);
          onEnded?.();
        }}
        className="hidden"
      />
    </>
  );
});
