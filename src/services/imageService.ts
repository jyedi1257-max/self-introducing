import { buildImagePrompt } from '../utils/buildImagePrompt';
import {
  generateImageFromPrompt,
  SafetyBlockedError,
  type ImageResult,
} from '../firebase/ai';
import { firebaseEnabled } from '../firebase/config';
import type { GenerationError } from '../app/types';

/** 한 세션에서 만들 수 있는 이미지 수. 보안 제한이 아니라 UX/비용 방어선이다. */
export const MAX_GENERATIONS_PER_SESSION = 6;

export interface GenerateOptions {
  trait: string;
  character: string;
  extraWhimsical?: boolean;
}

let inFlight: Promise<ImageResult> | null = null;

/**
 * 이미지를 생성한다.
 * 같은 요청이 동시에 여러 번 나가지 않도록 진행 중인 요청을 공유한다.
 */
export async function generateImage(options: GenerateOptions): Promise<ImageResult> {
  if (inFlight) return inFlight;

  const prompt = buildImagePrompt({
    trait: options.trait,
    character: options.character,
    extraWhimsical: options.extraWhimsical ?? false,
  });

  const task = firebaseEnabled
    ? generateImageFromPrompt(prompt)
    : mockImage(options);

  inFlight = task.finally(() => {
    inFlight = null;
  });

  return inFlight;
}

/** 예외를 학생에게 보여줄 오류 종류로 바꾼다. 기술적인 코드는 화면에 내보내지 않는다. */
export function toGenerationError(error: unknown): GenerationError {
  if (error instanceof SafetyBlockedError) return { kind: 'safety' };

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  const message = error instanceof Error ? error.message : '';

  if (code.includes('fetch-error') || /network|failed to fetch/i.test(message)) {
    return { kind: 'network' };
  }
  if (/safety|blocked|prohibited/i.test(message)) return { kind: 'safety' };

  return { kind: 'unknown' };
}

/**
 * Firebase 설정이 없을 때 쓰는 자리표시 이미지.
 * Phase 1(UI만 구현) 과 수업 전 점검에서 전체 흐름을 확인할 수 있게 한다.
 */
async function mockImage({ trait, character }: GenerateOptions): Promise<ImageResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe8c9"/>
      <stop offset="100%" stop-color="#cfe8ff"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="216" r="110" fill="#fff" stroke="#2f2a26" stroke-width="8"/>
  <circle cx="220" cy="200" r="14" fill="#2f2a26"/>
  <circle cx="292" cy="200" r="14" fill="#2f2a26"/>
  <path d="M212 252 q44 34 88 0" stroke="#2f2a26" stroke-width="8" fill="none" stroke-linecap="round"/>
  <text x="256" y="392" font-size="30" font-family="sans-serif" text-anchor="middle" fill="#2f2a26">${escapeXml(trait)}</text>
  <text x="256" y="436" font-size="30" font-family="sans-serif" text-anchor="middle" fill="#2f2a26">${escapeXml(character)}</text>
</svg>`;

  return {
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  };
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      default:
        return '&quot;';
    }
  });
}
