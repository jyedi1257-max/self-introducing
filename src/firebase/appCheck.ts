import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import { getFirebaseApp, firebaseEnabled } from './config';

let initialized = false;

/**
 * 어떤 reCAPTCHA 로 App Check 를 할지 고른다.
 *
 * v3 키가 있으면 그쪽을 먼저 쓴다. Enterprise 는 Cloud 쪽 API 와 권한 설정이
 * 더 필요해서 학교 환경에서 막히는 경우가 있었다.
 */
function pickProvider(): ReCaptchaV3Provider | ReCaptchaEnterpriseProvider | undefined {
  const v3Key = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;
  if (v3Key) return new ReCaptchaV3Provider(v3Key);

  const enterpriseKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (enterpriseKey) return new ReCaptchaEnterpriseProvider(enterpriseKey);

  return undefined;
}

/**
 * App Check 초기화. Firestore / AI Logic 요청보다 먼저 호출해야 한다.
 *
 * 개발: Firebase App Check 디버그 토큰 (운영 사이트 키에 localhost 를 넣지 않는다)
 */
export function initAppCheck(): void {
  if (initialized || !firebaseEnabled) return;

  const app = getFirebaseApp();
  if (!app) return;

  const provider = pickProvider();
  if (!provider) return;

  if (import.meta.env.DEV) {
    // 디버그 토큰을 .env.local 에 넣어 두면 그대로 쓰고,
    // 없으면 true 로 두어 콘솔에 출력된 토큰을 Firebase Console 에 등록하게 한다.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN =
      import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }

  try {
    initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
    initialized = true;
  } catch (error) {
    // App Check 실패가 수업 시작을 막지 않도록 로그만 남긴다.
    console.warn('[appCheck] 초기화에 실패했습니다.', error);
  }
}
