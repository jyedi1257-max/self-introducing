# 두 단어로 나를 표현하기

학생이 자신을 나타내는 두 단어(성격/상태 + 캐릭터)를 고르고, 두 단어를 합친 AI 이미지를
만들어 자기소개로 이어가는 수업용 웹앱입니다.

> 이 앱의 주인공은 이미지가 아니라 **학생이 고른 두 단어와 그 이유**입니다.
> AI 는 학생 대신 답을 정하는 도구가 아니라, 내가 고른 말을 눈으로 볼 수 있게 만들어 주는 도구로 씁니다.

## 수업 흐름

```
시작 → 성격/상태 단어 → 캐릭터 단어 → 두 단어 확인 → 그림 만들기
     → 마음에 드는지 고르기 → 고른 이유 쓰기 → 자기소개 카드
```

한 화면에서 한 가지만 하도록 만들었습니다.

## 개인정보

- 실제 이름·학번·학교·사진·음성은 받지 않습니다.
- 이름(별명)은 **선택 사항**이고, Firebase 에 저장하지 않고 브라우저 화면에서만 씁니다.
- 자기소개 문장과 생성한 이미지도 저장하지 않습니다. 남기고 싶으면 학생이 직접 내려받습니다.
- Firestore 에 남는 것은 학생이 새로 제안한 **단어**와 익명 UID 뿐입니다.

## 기술

React + TypeScript + Vite SPA. Next.js 는 쓰지 않습니다(서버 렌더링이나 복잡한 라우팅이 필요 없습니다).
화면 전환은 라우터 대신 `Step` 상태 머신으로 처리하고, 상태는 React Context + reducer 로만 관리합니다.

| Firebase | 쓰임 |
| --- | --- |
| Hosting | 웹앱 배포 |
| Authentication | 익명 로그인 (로그인 화면 없음) |
| Firestore | `words`, `wordSuggestions`, `admins` |
| AI Logic | Gemini 이미지 생성 |
| App Check | reCAPTCHA Enterprise |

이미지 모델은 `src/firebase/config.ts` 의 `IMAGE_MODEL` 한 곳에서만 관리합니다.

## 실행

```bash
npm install
npm run dev
```

`.env` 가 없으면 **Firebase 없이** 동작합니다. 기본 단어 목록과 자리표시 이미지로
전체 흐름을 그대로 확인할 수 있어서, 설정 전에 수업 흐름부터 점검할 수 있습니다.

### Firebase 연결

```bash
cp .env.example .env.local
# Firebase Console > 프로젝트 설정 > 내 앱 에서 값 복사
```

Firebase Console 에서 함께 켜 주세요.

1. Authentication → 로그인 방법 → **익명** 사용 설정
2. Firestore Database 만들기
3. Firebase AI Logic 사용 설정
4. App Check → reCAPTCHA Enterprise 등록

### 기본 단어 넣기

```bash
GOOGLE_APPLICATION_CREDENTIALS=서비스계정.json \
FIREBASE_PROJECT_ID=프로젝트ID \
npm run seed
```

같은 단어가 이미 있으면 건너뛰므로 여러 번 실행해도 안전합니다.
단어 원본은 `src/data/words.seed.json` 하나이고, 앱의 fallback 목록도 같은 파일을 씁니다.

### 배포

```bash
firebase use --add          # 처음 한 번
npm run deploy              # build + hosting/firestore 배포
```

## 보안

- Firestore 규칙은 `firestore.rules` 에 있고, 정의하지 않은 컬렉션은 모두 막습니다.
- 규칙 테스트는 에뮬레이터에서 실행합니다.

  ```bash
  npm run test:rules
  ```

- App Check 는 운영에서 reCAPTCHA Enterprise 를 씁니다.
  개발에서는 **디버그 토큰**을 쓰고, 운영 사이트 키에 `localhost` 를 넣지 않습니다.
  `npm run dev` 로 처음 띄우면 콘솔에 디버그 토큰이 찍힙니다.
  Firebase Console → App Check → 앱 → 디버그 토큰 관리에 등록하고
  `.env.local` 의 `VITE_APPCHECK_DEBUG_TOKEN` 에도 넣어 두면 계속 같은 토큰을 씁니다.
- 이미지 생성은 한 세션에 **6번**까지로 제한합니다.
  보안 제한이 아니라 UX/비용 방어선입니다. 서버측 quota 가 필요해지면 M2 에서 Cloud Functions 를 붙입니다.

## 장애가 나도 수업은 계속됩니다

- Firestore 를 못 읽으면 앱에 들어 있는 **기본 단어**로 이어갑니다.
- 이미지 생성이 실패하면 다시 만들기, 또는 **그림 없이 자기소개 계속하기** 를 고를 수 있습니다.
- 안전 정책으로 막히면 "이 단어로는 그림을 만들기 어려워요" 를 보여주고 단어를 다시 고르게 합니다.
- 기술적인 오류 코드는 학생 화면에 내보내지 않습니다.

## 접근성

특수교육 수업용이라 일반적인 디자인보다 접근성을 앞에 둡니다.

- 기본 글자 20px, 제목 28~32px
- 터치 영역 최소 48px
- 한 화면에 하나의 핵심 질문
- 선택 상태를 색만으로 나타내지 않고 체크 표시와 `aria-pressed` 를 함께 씀
- 키보드만으로 조작 가능, 보이는 포커스 표시
- 모달 안에서 포커스가 갇히고 Esc 로 닫힘, 닫으면 원래 자리로 돌아감
- `prefers-reduced-motion` 지원

## 폴더 구조

```
src/
├─ app/         App, 상태 머신(store), 타입, 이미지 생성 훅
├─ components/  Button, Modal, WordCard, WordGrid, AddWordModal, FinalCard, ...
├─ screens/     Start, Trait, Character, Preview, Generating, ImageResult, Reason, Result
├─ firebase/    config, auth, firestore, ai, appCheck
├─ services/    wordService, imageService
├─ utils/       validateWord, buildImagePrompt, korean, download
├─ data/        words.seed.json, defaultWords
└─ styles/
```

## 학생이 추가한 단어

```
학생 단어 추가 → 그 학생 화면에서는 바로 사용
              → wordSuggestions 에 pending 으로 저장
              → 교사 검토 → 승인 → words 에 등록 → 모든 학생에게 표시
```

바로 공용 목록에 올리지 않습니다. 교사 승인 화면은 M2 후보입니다.

## M1 에서 하지 않는 것

학생 계정, 학급 관리, 결과 DB 저장, 갤러리, 교사 대시보드, 이미지 자동 저장,
AI 성격 분석, 사진 업로드, 얼굴 이미지 생성, 소셜 로그인, 음성 녹음, 통계.

## M2 후보

교사용 단어 승인 페이지, 자기소개 카드 전체 PNG 저장, 작품 갤러리, QR 표시,
결과 익명 수집, 발표 모드, TTS, AI 문장 다듬기.
