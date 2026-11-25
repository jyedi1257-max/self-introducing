# 무료 이미지 생성 전환 (배포 전 검토 필요)

기존 Firebase Spark, 익명 인증, Firestore, Hosting을 유지한다.
Firebase AI Logic 호출을 Cloudflare Workers AI FLUX.1 Schnell로 바꾼다.
Worker의 AI 바인딩을 사용하므로 학생 브라우저에 API 키가 없다.
서버가 Firebase ID 토큰을 검증하고, 사전 승인된 기본 단어만 영어 프롬프트로 변환한다.
학생 추가 단어는 기존대로 기록할 수 있지만 이미지 생성은 승인 목록에 추가되기 전까지 차단된다.
자기소개는 그림 없이 이어갈 수 있다. 생성 이미지/이름/이유는 저장하지 않는다.
사용량 카운터는 UID 해시와 UTC 날짜만 사용한다. 시도 기준 하루 전체 80회, UID당 6회.
학생이 새 익명 UID를 발급받을 수 있으므로 사용자 한도는 학생별 보장이 아니며 전체 상한이 중요하다.
Cloudflare 계정은 반드시 Workers Free로 유지한다. 다른 Worker의 AI 사용량도 공유된다.
생성 결과에 대한 독립적인 이미지 안전 분류기는 아직 구현하지 않았다. 교사 샘플 검수 및 별도 출력 안전 검증 전 학생 대상 공개 배포 금지.

## 배포 순서 (교사 또는 로컬 Codex)
1. Cloudflare Dashboard에서 무료 계정을 준비하고 Workers & Pages 활성화.
2. 기존 Firebase 프로젝트는 Spark를 유지한다.
3. 이 브랜치를 체크아웃하고 worker 디렉터리에서 npm install, npm test 실행.
4. npx wrangler login 후 npm run deploy. 출력된 HTTPS workers.dev URL을 확인.
5. 루트의 기존 .env.local을 유지하고 VITE_IMAGE_WORKER_URL에 실제 Worker 주소 + /generate 설정.
6. 루트에서 npm ci (lockfile이 없으면 npm install), npm run build 실행.
7. 기존 Firebase 계정으로 npx firebase login, npx firebase hosting:channel:deploy free-image-preview --project self-introducing 실행. preview origin을 worker/wrangler.toml ALLOWED_ORIGINS에 정확히 추가한 후 Worker 재배포.
8. 프리뷰에서 로그인, 원래 단어 조합, 추가 단어 차단, 오류 시 그림 없이 진행, 모바일 UI, 동시 요청 및 실제 한도, 결과 안전성 검증.
9. 교사 승인 후에만 npx firebase deploy --only hosting --project self-introducing 실행. 기존 운영 주소 유지.
10. 문제가 있으면 Firebase Hosting 콘솔에서 이전 버전으로 롤백. 이전 버전의 Gemini 생성은 Spark에서 동작하지 않을 수 있음.

## 검증 항목
- 정상 Firebase ID 토큰 / 잘못된 프로젝트·만료 토큰 / 토큰 없음
- 승인된 단어만 허용, 프롬프트 삽입 거부
- 동시 요청에서 전체 80회 및 UID 6회 상한 유지
- 실패도 한도 차감, 429/503에서 앱의 기존 오류·건너뛰기 UI
- 실제 모델 응답이 JPEG인지 및 다양한 단어 조합 품질
- 영어 번역의 의미 적합성, 학생 대상 출력 안전성, 개인정보·학교 정책 검토

공식 문서:
https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/
https://developers.cloudflare.com/workers-ai/platform/pricing/
https://firebase.google.com/docs/auth/admin/verify-id-tokens
