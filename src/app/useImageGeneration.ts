import { useCallback, useRef, useState } from 'react';
import { useCreation } from './store';
import type { GenerationError } from './types';
import {
  MAX_GENERATIONS_PER_SESSION,
  generateImage,
  toGenerationError,
} from '../services/imageService';

export type GenerationStatus = 'idle' | 'loading' | 'done' | 'error';

export function useImageGeneration() {
  const { state, dispatch } = useCreation();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<GenerationError | null>(null);
  // 버튼을 빠르게 여러 번 눌러도 요청이 한 번만 나가도록 막는다.
  const busy = useRef(false);

  const remaining = MAX_GENERATIONS_PER_SESSION - state.generationCount;

  const generate = useCallback(
    async (options?: { extraWhimsical?: boolean }) => {
      if (busy.current) return;

      const trait = state.trait?.text;
      const character = state.character?.text;
      if (!trait || !character) return;
      if (remaining <= 0) return;

      busy.current = true;
      setError(null);
      setStatus('loading');
      dispatch({ type: 'generationStarted' });

      try {
        const result = await generateImage({
          trait,
          character,
          extraWhimsical: options?.extraWhimsical ?? false,
        });
        dispatch({ type: 'imageReady', dataUrl: result.dataUrl });
        setStatus('done');
      } catch (caught) {
        console.warn('[useImageGeneration] 이미지 생성 실패', caught);
        setError(toGenerationError(caught));
        setStatus('error');
      } finally {
        busy.current = false;
      }
    },
    [dispatch, remaining, state.trait?.text, state.character?.text],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    error,
    generate,
    reset,
    remaining,
    limitReached: remaining <= 0,
  };
}
