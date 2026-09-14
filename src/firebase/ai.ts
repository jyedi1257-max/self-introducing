import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  ResponseModality,
  ImageConfigAspectRatio,
  type GenerativeModel,
} from 'firebase/ai';
import { getFirebaseApp, firebaseEnabled, IMAGE_MODEL } from './config';

let model: GenerativeModel | undefined;

function imageModel(): GenerativeModel | undefined {
  const app = getFirebaseApp();
  if (!firebaseEnabled || !app) return undefined;

  if (!model) {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    model = getGenerativeModel(ai, {
      model: IMAGE_MODEL,
      generationConfig: {
        responseModalities: [ResponseModality.IMAGE],
        imageConfig: { aspectRatio: ImageConfigAspectRatio.SQUARE_1x1 },
      },
    });
  }

  return model;
}

export interface ImageResult {
  /** data: URL. 저장하지 않고 화면 표시에만 쓴다. */
  dataUrl: string;
}

export class SafetyBlockedError extends Error {
  constructor() {
    super('safety-blocked');
    this.name = 'SafetyBlockedError';
  }
}

/** 프롬프트로 이미지 한 장을 만든다. 실패하면 예외를 던진다. */
export async function generateImageFromPrompt(prompt: string): Promise<ImageResult> {
  const generative = imageModel();
  if (!generative) throw new Error('ai-unavailable');

  const result = await generative.generateContent(prompt);
  const response = result.response;

  if (response.promptFeedback?.blockReason) {
    throw new SafetyBlockedError();
  }

  const parts = response.inlineDataParts();
  const image = parts?.find((part) => part.inlineData.mimeType.startsWith('image/'));

  if (!image) {
    // 후보가 안전 정책으로 잘린 경우와 그냥 이미지가 없는 경우를 구분한다.
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
      throw new SafetyBlockedError();
    }
    throw new Error('no-image-returned');
  }

  return {
    dataUrl: `data:${image.inlineData.mimeType};base64,${image.inlineData.data}`,
  };
}
