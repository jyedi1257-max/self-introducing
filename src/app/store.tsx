import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { CreationState, SelectedWord, Step } from './types';

type Action =
  | { type: 'goto'; step: Step }
  | { type: 'setNickname'; nickname: string }
  | { type: 'selectTrait'; word: SelectedWord }
  | { type: 'selectCharacter'; word: SelectedWord }
  | { type: 'generationStarted' }
  | { type: 'imageReady'; dataUrl: string }
  | { type: 'skipImage' }
  | { type: 'setTraitReason'; reason: string }
  | { type: 'setCharacterReason'; reason: string }
  | { type: 'restart' };

const initialState: CreationState = {
  step: 'start',
  generationCount: 0,
  skippedImage: false,
};

function reducer(state: CreationState, action: Action): CreationState {
  switch (action.type) {
    case 'goto':
      return { ...state, step: action.step };

    case 'setNickname':
      return { ...state, nickname: action.nickname || undefined };

    case 'selectTrait':
      return { ...state, trait: action.word };

    case 'selectCharacter':
      return { ...state, character: action.word };

    case 'generationStarted':
      return {
        ...state,
        step: 'generating',
        generationCount: state.generationCount + 1,
        skippedImage: false,
      };

    case 'imageReady':
      return { ...state, generatedImage: action.dataUrl };

    case 'skipImage':
      return { ...state, generatedImage: undefined, skippedImage: true, step: 'reason' };

    case 'setTraitReason':
      return { ...state, traitReason: action.reason };

    case 'setCharacterReason':
      return { ...state, characterReason: action.reason };

    case 'restart':
      // 이름은 같은 학생이 이어서 쓰므로 남기고, 선택 결과만 비운다.
      return {
        ...initialState,
        nickname: state.nickname,
        // 생성 횟수는 세션 단위 비용 방어선이므로 초기화하지 않는다.
        generationCount: state.generationCount,
        step: 'trait',
      };

    default:
      return state;
  }
}

interface Store {
  state: CreationState;
  dispatch: React.Dispatch<Action>;
}

const CreationContext = createContext<Store | null>(null);

export function CreationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CreationContext.Provider value={value}>{children}</CreationContext.Provider>;
}

export function useCreation(): Store {
  const store = useContext(CreationContext);
  if (!store) throw new Error('CreationProvider 안에서만 사용할 수 있습니다.');
  return store;
}

/** "호기심 많은 고양이" 처럼 두 단어를 이어 붙인 이름 */
export function combinedName(state: CreationState): string {
  return [state.trait?.text, state.character?.text].filter(Boolean).join(' ');
}
