import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialSeconds: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useTimer({ initialSeconds, onExpire, autoStart = false }: UseTimerOptions) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  onExpireRef.current = onExpire;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    hasExpiredRef.current = false;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const start = useCallback(() => {
    hasExpiredRef.current = false;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    hasExpiredRef.current = false;
    setSeconds(initialSeconds);
  }, [initialSeconds, clearTimer]);

  // Reset and immediately start (for advancing to next player)
  const restart = useCallback(() => {
    clearTimer();
    hasExpiredRef.current = false;
    setSeconds(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds, clearTimer]);

  const safeInitial = initialSeconds > 0 ? initialSeconds : 1;
  const progress = seconds / safeInitial;

  return { seconds, isRunning, start, pause, reset, restart, progress };
}
