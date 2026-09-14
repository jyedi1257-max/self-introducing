import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp, firebaseEnabled } from './config';
import type { Word, WordType } from '../app/types';
import { normalizeWord } from '../utils/validateWord';

function db(): Firestore | undefined {
  const app = getFirebaseApp();
  if (!firebaseEnabled || !app) return undefined;
  return getFirestore(app);
}

/** words 컬렉션에서 활성화된 단어를 종류별로 읽어온다. */
export async function fetchWords(type: WordType): Promise<Word[]> {
  const store = db();
  if (!store) throw new Error('firestore-unavailable');

  const q = query(
    collection(store, 'words'),
    where('type', '==', type),
    where('active', '==', true),
    orderBy('sortOrder'),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const text = String(data.text ?? '');
    return {
      id: docSnap.id,
      text,
      normalizedText: String(data.normalizedText ?? normalizeWord(text)),
      type,
      emoji: (data.emoji as string | null) ?? null,
      active: data.active !== false,
      sortOrder: Number(data.sortOrder ?? 0),
    } satisfies Word;
  });
}

/**
 * 학생이 추가한 단어를 교사 검토용으로 저장한다.
 * 저장 실패가 수업 흐름을 막지 않도록 호출한 쪽에서 오류를 삼킨다.
 */
export async function submitWordSuggestion(
  text: string,
  type: WordType,
  ownerUid: string,
): Promise<void> {
  const store = db();
  if (!store) throw new Error('firestore-unavailable');

  await addDoc(collection(store, 'wordSuggestions'), {
    text,
    normalizedText: normalizeWord(text),
    type,
    ownerUid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
