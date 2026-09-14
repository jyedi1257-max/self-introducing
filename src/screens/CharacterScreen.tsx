import type { Word } from '../app/types';
import { useCreation } from '../app/store';
import { WordSelectScreen } from './WordSelectScreen';

interface Props {
  customWords: Word[];
  onAddCustomWord: (word: Word) => void;
}

export function CharacterScreen({ customWords, onAddCustomWord }: Props) {
  const { state, dispatch } = useCreation();

  return (
    <WordSelectScreen
      type="character"
      title="나를 무엇에 비유해 볼까?"
      lead="나와 닮은 것을 하나 골라 보세요."
      selected={state.character}
      customWords={customWords}
      onAddCustomWord={onAddCustomWord}
      onSelect={(word) => dispatch({ type: 'selectCharacter', word })}
      onNext={() => dispatch({ type: 'goto', step: 'preview' })}
      onBack={() => dispatch({ type: 'goto', step: 'trait' })}
      backLabel="다시 고르기"
    />
  );
}
