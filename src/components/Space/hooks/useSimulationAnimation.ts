/**
 * useSimulationAnimation 훅
 *
 * 순차적 아이템 표시 애니메이션 관리
 * - play, pause, reset 함수 제공
 * - 각 아이템을 순차적으로 표시
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface SimulationAnimationOptions {
  totalItems: number;
  delayMs?: number;  // 기본 500ms
  autoPlay?: boolean;
  onComplete?: () => void;
  onItemShow?: (index: number) => void;
}

export interface SimulationAnimationState {
  visibleCount: number;
  isPlaying: boolean;
  isComplete: boolean;
}

export interface SimulationAnimationControls {
  play: () => void;
  pause: () => void;
  reset: () => void;
  showNext: () => void;
}

export function useSimulationAnimation(
  options: SimulationAnimationOptions
): SimulationAnimationState & SimulationAnimationControls {
  const {
    totalItems,
    delayMs = 500,
    autoPlay = false,
    onComplete,
    onItemShow,
  } = options;

  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isComplete = visibleCount >= totalItems;

  // 다음 아이템 표시
  const showNext = useCallback(() => {
    if (visibleCount < totalItems) {
      const nextIndex = visibleCount;
      setVisibleCount((prev) => prev + 1);
      onItemShow?.(nextIndex);
    }
  }, [visibleCount, totalItems, onItemShow]);

  // 타이머로 순차 표시
  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next < totalItems) {
          // 다음 아이템 예약
          scheduleNext();
        } else if (next === totalItems) {
          // 완료
          setIsPlaying(false);
          onComplete?.();
        }
        onItemShow?.(prev);
        return next;
      });
    }, delayMs);
  }, [totalItems, delayMs, onComplete, onItemShow]);

  // 재생
  const play = useCallback(() => {
    if (visibleCount >= totalItems) {
      // 이미 완료된 경우 처음부터 재시작
      setVisibleCount(0);
    }
    setIsPlaying(true);
    scheduleNext();
  }, [visibleCount, totalItems, scheduleNext]);

  // 일시 정지
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 리셋
  const reset = useCallback(() => {
    setIsPlaying(false);
    setVisibleCount(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 완료 시 콜백
  useEffect(() => {
    if (isComplete && !isPlaying) {
      // 이미 onComplete가 scheduleNext에서 호출됨
    }
  }, [isComplete, isPlaying]);

  // autoPlay 처리
  useEffect(() => {
    if (autoPlay && totalItems > 0 && visibleCount === 0) {
      play();
    }
  }, [autoPlay, totalItems]);

  // 클린업
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    visibleCount,
    isPlaying,
    isComplete,
    play,
    pause,
    reset,
    showNext,
  };
}
