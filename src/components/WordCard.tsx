import type { Word } from '../app/types';

interface Props {
  word: Word;
  selected: boolean;
  onSelect: (word: Word) => void;
}

/**
 * 단어 하나를 고르는 큰 버튼.
 * 선택 상태를 색만으로 나타내지 않고 체크 표시와 aria-pressed 를 함께 쓴다.
 */
export function WordCard({ word, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`word-card ${selected ? 'is-selected' : ''}`.trim()}
      aria-pressed={selected}
      onClick={() => onSelect(word)}
    >
      <span className="word-card__check" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
      {word.emoji ? (
        <span className="word-card__emoji" aria-hidden="true">
          {word.emoji}
        </span>
      ) : null}
      <span className="word-card__text">{word.text}</span>
    </button>
  );
}
