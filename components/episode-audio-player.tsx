'use client';

import {Pause, Play, SkipBack, SkipForward, Volume2} from 'lucide-react';
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

type VoiceProfile = {
  rate: number;
  pitch: number;
  preferredNames?: string[];
};

type SpeechLocaleConfig = {
  languages: string[];
  profiles: VoiceProfile[];
};

const speechConfig: Record<Locale, SpeechLocaleConfig> = {
  en: {
    languages: ['en-US', 'en-GB', 'en'],
    profiles: [
      {rate: 1, pitch: 1.15, preferredNames: ['Google', 'Samantha', 'Microsoft', 'Natural']},
      {rate: 0.96, pitch: 1.05, preferredNames: ['Google', 'Aria', 'Jenny', 'Female']},
      {rate: 1.04, pitch: 1.22, preferredNames: ['Google', 'Neural', 'Guy', 'Male']}
    ]
  },
  hi: {
    languages: ['hi-IN', 'hi', 'en-IN', 'en-US'],
    profiles: [
      {rate: 0.92, pitch: 1.08, preferredNames: ['Google', 'Swara', 'Female', 'Microsoft']},
      {rate: 0.96, pitch: 1, preferredNames: ['Google', 'Madhur', 'Male', 'Natural']},
      {rate: 0.9, pitch: 1.14, preferredNames: ['Google', 'India', 'Hindi']}
    ]
  },
  mr: {
    languages: ['mr-IN', 'mr', 'hi-IN', 'hi', 'en-IN', 'en-US'],
    profiles: [
      {rate: 0.9, pitch: 1.1, preferredNames: ['Google', 'India', 'Female', 'Microsoft']},
      {rate: 0.94, pitch: 1.02, preferredNames: ['Google', 'Natural', 'Male']},
      {rate: 0.88, pitch: 1.16, preferredNames: ['Google', 'Hindi', 'Marathi']}
    ]
  }
};

type NarrationSource = 'uploaded' | 'browser';
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

function getVoiceCandidates(locale: Locale, preferredNames: string[]) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [] as SpeechSynthesisVoice[];
  }

  const voices = window.speechSynthesis.getVoices();
  const {languages} = speechConfig[locale];
  const normalizedLanguages = languages.map((language) => language.toLowerCase());
  const normalizedPreferredNames = preferredNames.map((name) => name.toLowerCase());

  const matchingVoices = voices.filter((voice) => {
    const voiceLanguage = voice.lang.toLowerCase();
    return normalizedLanguages.some((language) => {
      const languageRoot = language.split('-')[0];
      return voiceLanguage === language || voiceLanguage.startsWith(`${languageRoot}-`) || voiceLanguage === languageRoot;
    });
  });

  return matchingVoices.sort((left, right) => {
    const leftName = left.name.toLowerCase();
    const rightName = right.name.toLowerCase();
    const leftScore = normalizedPreferredNames.reduce((score, token, index) => score + (leftName.includes(token) ? normalizedPreferredNames.length - index : 0), 0);
    const rightScore = normalizedPreferredNames.reduce((score, token, index) => score + (rightName.includes(token) ? normalizedPreferredNames.length - index : 0), 0);

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    if (left.default !== right.default) {
      return left.default ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
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
  const browserPlaybackStateRef = useRef<BrowserPlaybackState>('idle');
  const voiceCycleRef = useRef(0);
  const profileCycleRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
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
      handleVoicesChanged();
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    }

    const audioElement = audioRef.current;

    return () => {
      audioElement?.pause();

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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && browserPlaybackStateRef.current !== 'idle') {
      window.speechSynthesis.cancel();
      browserPlaybackStateRef.current = 'idle';
      updateActiveParagraph(null);
    }

    setIsPlaying(false);
  }, [updateActiveParagraph]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setNarrationSource(episode.audioUrl ? 'uploaded' : null);
    browserPlaybackStateRef.current = 'idle';
    updateActiveParagraph(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
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

    window.speechSynthesis.cancel();

    const {profiles, languages} = speechConfig[locale];
    const profile = profiles[profileCycleRef.current % profiles.length];
    profileCycleRef.current += 1;

    const voiceCandidates = getVoiceCandidates(locale, profile.preferredNames ?? []);
    const selectedVoice = voiceCandidates[voiceCycleRef.current % Math.max(voiceCandidates.length, 1)] ?? null;
    if (voiceCandidates.length > 0) {
      voiceCycleRef.current += 1;
    }

    const utterances = episode.content
      .map((paragraph, index) => ({paragraph: paragraph.trim(), index}))
      .filter(({paragraph}) => Boolean(paragraph))
      .map(({paragraph, index}, utteranceIndex, utteranceList) => {
        const utterance = new SpeechSynthesisUtterance(paragraph);
        utterance.lang = selectedVoice?.lang ?? languages[0];
        utterance.rate = profile.rate;
        utterance.pitch = profile.pitch;
        utterance.volume = 1;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          browserPlaybackStateRef.current = 'playing';
          setNarrationSource('browser');
          setDuration(utteranceList.length);
          setCurrentTime(utteranceIndex);
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
          setCurrentTime(utteranceIndex + 1);
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

  const startPlayback = useCallback(async () => {
    if ((hasUploadedAudio || narrationSource === 'uploaded') && audioRef.current) {
      const activeSource = episode.audioUrl;
      if (activeSource) {
        await playAudioElement(activeSource, 'uploaded');
      }
      return;
    }

    startSpeechNarration();
  }, [episode.audioUrl, hasUploadedAudio, narrationSource, playAudioElement, startSpeechNarration]);

  const handleToggle = useCallback(async () => {
    if (isPlaying) {
      pausePlayback();
      return;
    }

    await startPlayback();
  }, [isPlaying, pausePlayback, startPlayback]);

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

  const isUnavailable = !hasUploadedAudio && (!speechSupported || !textNarration.trim());
  const statusText = hasUploadedAudio || narrationSource === 'uploaded'
    ? labels.audioAvailable
    : speechSupported
      ? labels.audioFallback
      : labels.audioUnavailable;

  const showProgress = hasUploadedAudio && variant === 'default';

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
                disabled={isUnavailable}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition disabled:cursor-not-allowed disabled:opacity-50 dark:text-stone-950"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
              disabled={isUnavailable}
              className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-paper transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-950"
            >
              {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
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
