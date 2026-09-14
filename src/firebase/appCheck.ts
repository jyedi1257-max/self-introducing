import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getFirebaseApp, firebaseEnabled } from './config';

let initialized = false;

/**
 * App Check 초기화. Firestore / AI Logic 요청보다 먼저 호출해야 한다.
 *
 * 운영: reCAPTCHA Enterprise
 * 개발: Firebase App Check 디버그 토큰 (production 사이트 키에 localhost 를 넣지 않는다)
 */
export function initAppCheck(): void {
  if (initialized || !firebaseEnabled) return;

  const app = getFirebaseApp();
  const siteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!app || !siteKey) return;

  if (import.meta.env.DEV) {
    // 디버그 토큰을 .env.local 에 넣어 두면 그대로 쓰고,
    // 없으면 true 로 두어 콘솔에 출력된 토큰을 Firebase Console 에 등록하게 한다.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    initialized = true;
  } catch (error) {
    // App Check 실패가 수업 시작을 막지 않도록 로그만 남긴다.
    console.warn('[appCheck] 초기화에 실패했습니다.', error);
  }
}
