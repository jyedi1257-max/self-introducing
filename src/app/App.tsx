import { useCallback, useEffect, useRef, useState } from 'react';
import type { Word } from './types';
import { useCreation } from './store';
import { useImageGeneration } from './useImageGeneration';
import { initAppCheck } from '../firebase/appCheck';
import { ensureAnonymousUser } from '../firebase/auth';
import { ProgressHeader } from '../components/ProgressHeader';
import { StartScreen } from '../screens/StartScreen';
import { TraitScreen } from '../screens/TraitScreen';
import { CharacterScreen } from '../screens/CharacterScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { GeneratingScreen } from '../screens/GeneratingScreen';
import { ImageResultScreen } from '../screens/ImageResultScreen';
import { ReasonScreen } from '../screens/ReasonScreen';
import { ResultScreen } from '../screens/ResultScreen';

export function App() {
  const { state, dispatch } = useCreation();
  const { status, error, generate, reset, remaining, limitReached } = useImageGeneration();

  // 학생이 직접 추가한 단어. 화면을 오가도 남지만 Firebase 에는 그대로 두지 않는다.
  const [customWords, setCustomWords] = useState<Word[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 로그인 화면 없이 익명 로그인을 먼저 끝낸다.
    initAppCheck();
    ensureAnonymousUser().catch((caught) => {
      console.warn('[App] 익명 로그인에 실패했습니다.', caught);
    });
  }, []);

  // 새 화면으로 넘어가면 화면 맨 위로 올리고 읽기 시작점을 옮긴다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    mainRef.current?.focus({ preventScroll: true });
  }, [state.step, status]);

  // 앞 단계를 건너뛴 상태로 들어오면 되돌린다.
  useEffect(() => {
    const needsWords =
      state.step === 'preview' ||
      state.step === 'generating' ||
      state.step === 'reason' ||
      state.step === 'result';
    if (needsWords && (!state.trait || !state.character)) {
      dispatch({ type: 'goto', step: state.trait ? 'character' : 'trait' });
    }
  }, [state.step, state.trait, state.character, dispatch]);

  const addCustomWord = useCallback((word: Word) => {
    setCustomWords((previous) => [...previous, word]);
  }, []);

  const continueWithoutImage = useCallback(() => {
    reset();
    dispatch({ type: 'skipImage' });
  }, [dispatch, reset]);

  const goToReason = useCallback(() => {
    reset();
    dispatch({ type: 'goto', step: 'reason' });
  }, [dispatch, reset]);

  const backToWords = useCallback(() => {
    reset();
    dispatch({ type: 'goto', step: 'trait' });
  }, [dispatch, reset]);

  return (
    <div className="app">
      <ProgressHeader step={state.step} />
      <main className="app__main" ref={mainRef} tabIndex={-1}>
        {state.step === 'start' ? <StartScreen /> : null}

        {state.step === 'trait' ? (
          <TraitScreen customWords={customWords} onAddCustomWord={addCustomWord} />
        ) : null}

        {state.step === 'character' ? (
          <CharacterScreen customWords={customWords} onAddCustomWord={addCustomWord} />
        ) : null}

        {state.step === 'preview' ? (
          <PreviewScreen
            onGenerate={() => void generate()}
            disabled={status === 'loading'}
            limitReached={limitReached}
            onContinueWithoutImage={continueWithoutImage}
          />
        ) : null}

        {state.step === 'generating' ? (
          status === 'loading' ? (
            <GeneratingScreen />
          ) : (
            <ImageResultScreen
              error={error}
              limitReached={limitReached}
              remaining={remaining}
              onRetry={(extraWhimsical) => void generate({ extraWhimsical })}
              onContinue={goToReason}
              onBackToWords={backToWords}
              onContinueWithoutImage={continueWithoutImage}
            />
          )
        ) : null}

        {state.step === 'reason' ? <ReasonScreen /> : null}

        {state.step === 'result' ? <ResultScreen /> : null}
      </main>
    </div>
  );
}
