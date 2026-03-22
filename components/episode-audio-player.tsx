'use client';

import {LoaderCircle, Pause, Play, Volume2} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Episode} from '@/data/stories';
import type {Locale} from '@/i18n/config';

const speechLanguages: Record<Locale, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN'
};

type NarrationSource = 'uploaded' | 'elevenlabs' | 'browser';

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

export function EpisodeAudioPlayer({episode, locale, labels}: EpisodeAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generatedAudioUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elevenLabsUnavailable, setElevenLabsUnavailable] = useState(false);
  const [narrationSource, setNarrationSource] = useState<NarrationSource | null>(episode.audioUrl ? 'uploaded' : null);
  const textNarration = useMemo(() => episode.content.join(' '), [episode.content]);
  const hasUploadedAudio = Boolean(episode.audioUrl);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    const audioElement = audioRef.current;

    return () => {
      audioElement?.pause();

      if (generatedAudioUrlRef.current) {
        URL.revokeObjectURL(generatedAudioUrlRef.current);
        generatedAudioUrlRef.current = null;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setElevenLabsUnavailable(false);
    setNarrationSource(episode.audioUrl ? 'uploaded' : null);

    audioRef.current?.pause();
    if (audioRef.current) {
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
  }, [episode.audioUrl, episode.id]);

  const startSpeechNarration = () => {
    if (!speechSupported || !textNarration.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textNarration);
    utterance.lang = speechLanguages[locale];
    utterance.onstart = () => {
      setNarrationSource('browser');
      setIsPlaying(true);
    };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const playAudioElement = async (src: string, source: NarrationSource) => {
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
  };

  const loadGeneratedAudio = async () => {
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
  };

  const handleToggle = async () => {
    if (isLoading) {
      return;
    }

    if ((hasUploadedAudio || narrationSource === 'elevenlabs') && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      const activeSource = hasUploadedAudio ? episode.audioUrl : generatedAudioUrlRef.current;
      if (activeSource) {
        await playAudioElement(activeSource, hasUploadedAudio ? 'uploaded' : 'elevenlabs');
      }
      return;
    }

    if (isPlaying && speechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!hasUploadedAudio) {
      const generatedAudioStarted = await loadGeneratedAudio();
      if (generatedAudioStarted) {
        return;
      }
    }

    startSpeechNarration();
  };

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

  const showProgress = hasUploadedAudio || narrationSource === 'elevenlabs';

  return (
    <section className="paper-panel space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">{labels.heading}</p>
          <p className="mt-2 text-sm text-muted">{statusText}</p>
        </div>
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
      </div>

      <audio
        ref={audioRef}
        src={hasUploadedAudio ? episode.audioUrl : undefined}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

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
  );
}
