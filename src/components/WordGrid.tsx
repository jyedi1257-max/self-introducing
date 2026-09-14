import type { Word } from '../app/types';
import { WordCard } from './WordCard';

interface Props {
  words: Word[];
  selectedId?: string;
  onSelect: (word: Word) => void;
  label: string;
}

export function WordGrid({ words, selectedId, onSelect, label }: Props) {
  return (
    <ul className="word-grid" aria-label={label}>
      {words.map((word) => (
        <li key={word.id}>
          <WordCard word={word} selected={word.id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
