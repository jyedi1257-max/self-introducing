/**
 * Firestore words 컬렉션에 기본 단어를 넣는다.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=서비스계정.json \
 *   FIREBASE_PROJECT_ID=my-project \
 *   node scripts/seedWords.mjs
 *
 * 같은 단어(normalizedText + type)가 이미 있으면 건너뛰므로 여러 번 실행해도 안전하다.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const seedPath = fileURLToPath(new URL('../src/data/words.seed.json', import.meta.url));
const seed = JSON.parse(await readFile(seedPath, 'utf8'));

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('FIREBASE_PROJECT_ID 환경 변수를 설정해 주세요.');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

const normalize = (text) => text.replace(/\s+/g, '').toLowerCase();

const entries = [
  ...seed.trait.map((text, index) => ({
    text,
    type: 'trait',
    emoji: null,
    sortOrder: (index + 1) * 10,
  })),
  ...seed.character.map((entry, index) => ({
    text: entry.text,
    type: 'character',
    emoji: entry.emoji || null,
    sortOrder: (index + 1) * 10,
  })),
];

const existing = new Set();
const snapshot = await db.collection('words').get();
snapshot.forEach((doc) => {
  const data = doc.data();
  existing.add(`${data.type}:${data.normalizedText ?? normalize(String(data.text ?? ''))}`);
});

let added = 0;
let batch = db.batch();
let pending = 0;

for (const entry of entries) {
  const key = `${entry.type}:${normalize(entry.text)}`;
  if (existing.has(key)) continue;

  batch.set(db.collection('words').doc(), {
    text: entry.text,
    normalizedText: normalize(entry.text),
    type: entry.type,
    emoji: entry.emoji,
    active: true,
    sortOrder: entry.sortOrder,
    createdAt: FieldValue.serverTimestamp(),
  });

  added += 1;
  pending += 1;

  if (pending === 400) {
    await batch.commit();
    batch = db.batch();
    pending = 0;
  }
}

if (pending > 0) await batch.commit();

console.log(`단어 ${added}개를 추가했습니다. (이미 있던 단어 ${entries.length - added}개는 건너뜀)`);
