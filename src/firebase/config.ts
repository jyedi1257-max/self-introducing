import { initializeApp, type FirebaseApp } from 'firebase/app';

/** 이미지 생성 모델. 모델 교체가 쉽도록 이 한 곳에서만 관리한다. */
export const IMAGE_MODEL = 'gemini-3.1-flash-image';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * .env 설정이 없으면 Firebase 없이 동작한다.
 * (Phase 1 의 dummy data 모드 = 기본 단어 + mock 이미지)
 */
export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp | undefined {
  if (!firebaseEnabled) return undefined;
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}
