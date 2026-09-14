type ParticleKind = 'object' | 'topic' | 'subject';

const PAIRS: Record<ParticleKind, [withConsonant: string, withoutConsonant: string]> = {
  object: ['을', '를'],
  topic: ['은', '는'],
  subject: ['이', '가'],
};

/** 마지막 글자에 받침이 있는지. 한글 음절이 아니면 판단하지 않는다. */
function hasFinalConsonant(word: string): boolean | null {
  const last = word.trim().slice(-1);
  if (!last) return null;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  return (code - 0xac00) % 28 !== 0;
}

/**
 * 단어에 맞는 조사만 돌려준다.
 * 학생이 넣은 말이 한글이 아닐 수도 있어서, 판단이 어려우면 '을(를)' 형태로 둔다.
 */
export function particleFor(word: string, kind: ParticleKind = 'object'): string {
  const [withConsonant, withoutConsonant] = PAIRS[kind];
  const final = hasFinalConsonant(word);
  if (final === null) return `${withConsonant}(${withoutConsonant})`;
  return final ? withConsonant : withoutConsonant;
}

/** 단어 뒤에 조사를 붙인 문자열. */
export function withParticle(word: string, kind: ParticleKind = 'object'): string {
  return `${word}${particleFor(word, kind)}`;
}

/**
 * 이유를 "나는 ~해서 ... 골랐어요." 문장에 넣을 수 있는 형태로 다듬는다.
 * 학생이 이미 '~아서/어서/니까' 처럼 이유를 나타내는 말로 끝맺었으면 그대로 둔다.
 */
const CONNECTIVE_ENDING = /(서|니까|때문에|라고|거든)$/;

export function reasonClause(reason: string): string {
  const trimmed = reason.trim().replace(/[.·,]+$/, '');
  if (!trimmed) return '';
  return CONNECTIVE_ENDING.test(trimmed) ? trimmed : `${trimmed}해서`;
}
