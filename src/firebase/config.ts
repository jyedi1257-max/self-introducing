import { initializeApp, type FirebaseApp } from 'firebase/app';

/** 이미지 생성 모델. 모델 교체가 쉽도록 이 한 곳에서만 관리한다. */
export const IMAGE_MODEL = 'gemini-3.1-flash-image';

/**
 * 어느 Gemini 백엔드로 요청할지.
 *
 * 'vertex'  - Agent Platform Gemini API (구 Vertex AI).
 *             Cloud Billing 크레딧($300 무료 체험 등)을 쓸 수 있다.
 * 'google'  - Gemini Developer API.
 *             Cloud Billing 크레딧이 적용되지 않고 별도 선불 충전이 필요하다.
 *
 * 그래서 기본값을 'vertex' 로 둔다.
 */
export const AI_BACKEND: 'vertex' | 'google' =
  import.meta.env.VITE_AI_BACKEND === 'google' ? 'google' : 'vertex';

/** Vertex 백엔드를 쓸 때의 리전. 모델이 리전을 타면 여기만 바꾼다. */
export const AI_LOCATION = import.meta.env.VITE_AI_LOCATION || 'global';

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
