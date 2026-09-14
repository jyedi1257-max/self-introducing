import type { Word, WordType } from '../app/types';
import { normalizeWord } from '../utils/validateWord';
import seed from './words.seed.json';

/**
 * Firestore 연결에 실패해도 수업이 중단되지 않도록 앱에 함께 넣어 두는 기본 단어.
 * words.seed.json 은 Firestore words 컬렉션을 채우는 scripts/seedWords.mjs 도 함께 쓴다.
 */
export const DEFAULT_TRAIT_WORDS: Word[] = seed.trait.map((text, index) => ({
  id: `default-trait-${index}`,
  text,
  normalizedText: normalizeWord(text),
  type: 'trait',
  emoji: null,
  active: true,
  sortOrder: (index + 1) * 10,
}));

export const DEFAULT_CHARACTER_WORDS: Word[] = seed.character.map((entry, index) => ({
  id: `default-character-${index}`,
  text: entry.text,
  normalizedText: normalizeWord(entry.text),
  type: 'character',
  emoji: entry.emoji || null,
  active: true,
  sortOrder: (index + 1) * 10,
}));

export function defaultWordsFor(type: WordType): Word[] {
  return type === 'trait' ? DEFAULT_TRAIT_WORDS : DEFAULT_CHARACTER_WORDS;
}
