'use client';

import {usePathname, useSearchParams} from 'next/navigation';
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {LoaderOverlay} from './loader-overlay';

type LoaderOptions = {
  message?: string;
  minDurationMs?: number;
};

type LoaderContextValue = {
  isLoading: boolean;
  showLoader: (options?: LoaderOptions) => void;
  hideLoader: () => void;
};

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined);
const DEFAULT_MIN_DURATION = 380;
const FADE_OUT_MS = 200;

export function LoaderProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const shownAtRef = useRef<number>(0);
  const minDurationRef = useRef<number>(DEFAULT_MIN_DURATION);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  const hideLoader = useCallback(() => {
    if (!isMounted) {
      return;
    }

    const elapsedMs = Date.now() - shownAtRef.current;
    const waitMs = Math.max(minDurationRef.current - elapsedMs, 0);

    clearTimers();
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      unmountTimerRef.current = setTimeout(() => {
        setIsMounted(false);
        setMessage(undefined);
      }, FADE_OUT_MS);
    }, waitMs);
  }, [clearTimers, isMounted]);

  const showLoader = useCallback(
    (options?: LoaderOptions) => {
      clearTimers();
      minDurationRef.current = Math.max(options?.minDurationMs ?? DEFAULT_MIN_DURATION, 300);
      shownAtRef.current = Date.now();
      setMessage(options?.message);
      setIsMounted(true);

      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    },
    [clearTimers]
  );

  useEffect(() => {
    hideLoader();
  }, [hideLoader, pathname, searchParams]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const contextValue = useMemo(
    () => ({
      isLoading: isMounted,
      showLoader,
      hideLoader
    }),
    [hideLoader, isMounted, showLoader]
  );

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      {isMounted ? <LoaderOverlay visible={isVisible} message={message} /> : null}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error('useLoader must be used within LoaderProvider');
  }

  return context;
}
