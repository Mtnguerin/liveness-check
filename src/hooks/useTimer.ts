import { useCallback, useEffect, useState } from "react";

export function useTimer(isStarted: boolean) {
  const [timer, setTimer] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setTimer(0);
  };

  const pauseTimer = useCallback(() => {
    if (!timeoutId) {
      return;
    }
    clearInterval(timeoutId);
    setTimeoutId(null);
  }, [timeoutId]);

  const startTimer = useCallback(() => {
    if (timeoutId) {
      return timeoutId;
    }
    const interval = setInterval(() => {
      setTimer((prev: number) => prev + 1);
    }, 1000);
    setTimeoutId(interval);
  }, [timeoutId]);

  useEffect(() => {
    return () => {
        pauseTimer();
    };
  }, [pauseTimer, startTimer, isStarted]);

  return { timer, resetTimer, pauseTimer, startTimer };
}
