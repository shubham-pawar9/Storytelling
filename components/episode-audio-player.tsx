'use client';

import {Pause, Play, Volume2} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Episode} from '@/data/stories';
import type {Locale} from '@/i18n/config';

const speechLanguages: Record<Locale, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN'
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
    unavailable: string;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textNarration = useMemo(() => episode.content.join(' '), [episode.content]);
  const hasAudio = Boolean(episode.audioUrl);

  useEffect(() => {
    setSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    const audioElement = audioRef.current;

    return () => {
      audioElement?.pause();

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
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
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleToggle = async () => {
    if (hasAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    if (isPlaying && speechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    startSpeechNarration();
  };

  const isUnavailable = !hasAudio && !speechSupported;

  return (
    <section className="paper-panel space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">{labels.heading}</p>
          <p className="mt-2 text-sm text-muted">{hasAudio ? labels.audioAvailable : speechSupported ? labels.audioFallback : labels.unavailable}</p>
        </div>
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
      </div>

      {hasAudio ? (
        <>
          <audio
            ref={audioRef}
            src={episode.audioUrl}
            preload="metadata"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
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
        </>
      ) : null}
    </section>
  );
}
