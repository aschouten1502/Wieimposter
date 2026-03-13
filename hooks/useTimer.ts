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
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const progress = seconds / initialSeconds;

  return { seconds, isRunning, start, pause, reset, progress };
}
