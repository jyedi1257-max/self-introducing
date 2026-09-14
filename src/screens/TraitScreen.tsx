import type { Word } from '../app/types';
import { useCreation } from '../app/store';
import { WordSelectScreen } from './WordSelectScreen';

interface Props {
  customWords: Word[];
  onAddCustomWord: (word: Word) => void;
}

export function TraitScreen({ customWords, onAddCustomWord }: Props) {
  const { state, dispatch } = useCreation();

  return (
    <WordSelectScreen
      type="trait"
      title="나는 어떤 사람일까?"
      lead="나와 잘 어울리는 말을 하나 골라 보세요."
      selected={state.trait}
      customWords={customWords}
      onAddCustomWord={onAddCustomWord}
      onSelect={(word) => dispatch({ type: 'selectTrait', word })}
      onNext={() => dispatch({ type: 'goto', step: 'character' })}
      onBack={() => dispatch({ type: 'goto', step: 'start' })}
      backLabel="처음으로"
    />
  );
}
