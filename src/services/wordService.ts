import type { Word, WordType } from '../app/types';
import { defaultWordsFor } from '../data/defaultWords';
import { fetchWords, submitWordSuggestion } from '../firebase/firestore';
import { currentUid } from '../firebase/auth';
import { normalizeWord } from '../utils/validateWord';

export interface LoadWordsResult {
  words: Word[];
  /** Firestore 대신 앱에 들어 있는 기본 단어를 쓴 경우 true */
  usedFallback: boolean;
}

/**
 * Firestore 를 기다리는 시간.
 * Firestore SDK 는 연결이 막히면 스스로 포기할 때까지 10초 넘게 재시도한다.
 * 수업 중에 빈 로딩 화면을 오래 보여주지 않도록 여기서 먼저 끊고 기본 단어로 넘어간다.
 */
const FETCH_TIMEOUT_MS = 3500;

class WordFetchTimeout extends Error {}

/**
 * 단어 목록을 가져온다.
 * Firestore 가 느리거나 실패하거나 비어 있으면 기본 단어로 대체해 수업이 끊기지 않게 한다.
 */
export async function loadWords(type: WordType): Promise<LoadWordsResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const words = await Promise.race([
      fetchWords(type),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new WordFetchTimeout('word-fetch-timeout')), FETCH_TIMEOUT_MS);
      }),
    ]);
    if (words.length > 0) return { words, usedFallback: false };
  } catch (error) {
    if (error instanceof WordFetchTimeout) {
      console.warn('[wordService] Firestore 응답이 느려서 기본 단어로 진행합니다.');
    } else {
      console.warn('[wordService] Firestore 단어를 불러오지 못했습니다.', error);
    }
  } finally {
    clearTimeout(timer);
  }

  return { words: defaultWordsFor(type), usedFallback: true };
}

/**
 * 학생이 추가한 단어를 교사 검토 목록에 올린다.
 * 실패해도 학생 화면에서는 그대로 쓸 수 있어야 하므로 오류를 던지지 않는다.
 */
export async function suggestWord(text: string, type: WordType): Promise<void> {
  const uid = currentUid();
  if (!uid) return;

  try {
    await submitWordSuggestion(text, type, uid);
  } catch (error) {
    console.warn('[wordService] 단어 제안을 저장하지 못했습니다.', error);
  }
}

/** 이미 목록에 같은 단어가 있는지 확인한다. */
export function findExistingWord(words: Word[], text: string): Word | undefined {
  const normalized = normalizeWord(text);
  return words.find((word) => word.normalizedText === normalized);
}
