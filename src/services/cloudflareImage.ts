import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from '../firebase/config';
import { ensureAnonymousUser } from '../firebase/auth';

export interface ImageResult {
  dataUrl: string;
}

export class SafetyBlockedError extends Error {
  constructor() {
    super('safety-blocked');
    this.name = 'SafetyBlockedError';
  }
}

export async function generateCloudflareImage(options: {
  trait: string;
  character: string;
  extraWhimsical?: boolean;
}): Promise<ImageResult> {
  const url = import.meta.env.VITE_IMAGE_WORKER_URL;
  const app = getFirebaseApp();
  if (!url || !app) throw new Error('image-worker-not-configured');
  await ensureAnonymousUser();
  const token = await getAuth(app).currentUser?.getIdToken();
  if (!token) throw new Error('auth-unavailable');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      trait: options.trait,
      character: options.character,
      extraWhimsical: options.extraWhimsical ?? false,
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (response.status === 422) throw new SafetyBlockedError();
  if (response.status === 429) throw new Error('image-quota-reached');
  if (!response.ok) throw new Error('image-worker-unavailable');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('dataUrl' in result) ||
      typeof result.dataUrl !== 'string' || !/^data:image\/jpeg;base64,\/9j\//.test(result.dataUrl)) {
    throw new Error('invalid-image');
  }
  return { dataUrl: result.dataUrl };
}
