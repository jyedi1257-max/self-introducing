import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseApp, firebaseEnabled } from './config';

/**
 * 로그인 화면 없이 익명 로그인을 실행한다.
 * UID 는 학생 식별이 아니라 "내가 추가한 단어" 와 Firestore 쓰기 권한 구분에만 쓴다.
 */
export async function ensureAnonymousUser(): Promise<string | null> {
  const app = getFirebaseApp();
  if (!firebaseEnabled || !app) return null;

  const auth = getAuth(app);

  if (auth.currentUser) return auth.currentUser.uid;

  const existing = await new Promise<string | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? user.uid : null);
    });
  });
  if (existing) return existing;

  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

export function currentUid(): string | null {
  const app = getFirebaseApp();
  if (!firebaseEnabled || !app) return null;
  return getAuth(app).currentUser?.uid ?? null;
}
