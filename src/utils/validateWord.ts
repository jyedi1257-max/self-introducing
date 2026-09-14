export const MAX_WORD_LENGTH = 15;

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

/** 중복 검사에 쓰는 정규화 형태: 공백 제거 + 소문자 */
export function normalizeWord(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|kr|io|co)\b)/i;
const EMAIL_PATTERN = /[^\s@]+@[^\s@]+/;
const PHONE_PATTERN = /\d{2,}[-\s.]?\d{3,}/;
const TAG_LIKE = /<[^>]*>/g;
const CODE_CHARS = /[<>{}[\]\\|`^~]/g;

/**
 * 학생이 직접 입력한 단어를 검사한다.
 * 오류 메시지는 기술적인 표현 대신 학생이 읽고 바로 고칠 수 있는 말로 돌려준다.
 */
export function validateWord(raw: string): ValidationResult {
  // 줄바꿈은 막는 대신 공백으로 바꿔서 입력을 되도록 살린다.
  const collapsed = raw.replace(/[\r\n\t]+/g, ' ');
  const cleaned = collapsed
    .replace(TAG_LIKE, '')
    .replace(CODE_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length === 0) {
    return { ok: false, message: '넣고 싶은 말을 적어 주세요.' };
  }

  // 주소·연락처는 길이보다 먼저 걸러서 학생에게 맞는 안내가 나가게 한다.
  if (EMAIL_PATTERN.test(cleaned) || URL_PATTERN.test(cleaned) || PHONE_PATTERN.test(cleaned)) {
    return { ok: false, message: '단어만 적어 주세요.' };
  }

  if (cleaned.length > MAX_WORD_LENGTH) {
    return { ok: false, message: '조금 더 짧은 말로 적어 주세요.' };
  }

  return { ok: true, value: cleaned };
}

/** 이름/별명 입력용. 저장하지 않고 화면에서만 쓰므로 길이만 정리한다. */
export function sanitizeNickname(raw: string): string {
  return raw
    .replace(/[\r\n\t]+/g, ' ')
    .replace(TAG_LIKE, '')
    .replace(CODE_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_WORD_LENGTH);
}

/** 이유 입력용. 길이 상한만 두고 내용은 학생 표현 그대로 둔다. */
export const MAX_REASON_LENGTH = 100;

export function sanitizeReason(raw: string): string {
  return raw.replace(/[\r\n]+/g, ' ').slice(0, MAX_REASON_LENGTH);
}
