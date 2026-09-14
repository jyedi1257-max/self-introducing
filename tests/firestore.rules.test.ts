import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

const STUDENT = 'student-uid';
const OTHER_STUDENT = 'other-student-uid';
const TEACHER = 'teacher-uid';

let testEnv: RulesTestEnvironment;

function suggestion(overrides: Record<string, unknown> = {}) {
  return {
    text: '엉뚱한',
    normalizedText: '엉뚱한',
    type: 'trait',
    ownerUid: STUDENT,
    status: 'pending',
    ...overrides,
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'two-words-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'admins', TEACHER), { role: 'teacher' });
    await setDoc(doc(db, 'words', 'w1'), {
      text: '호기심 많은',
      normalizedText: '호기심많은',
      type: 'trait',
      active: true,
      sortOrder: 10,
    });
  });
});

describe('words', () => {
  it('로그인하지 않아도 단어를 읽을 수 있다', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDocs(collection(db, 'words')));
  });

  it('학생은 단어를 만들거나 고칠 수 없다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(setDoc(doc(db, 'words', 'w2'), { text: '새 단어', type: 'trait' }));
    await assertFails(updateDoc(doc(db, 'words', 'w1'), { active: false }));
    await assertFails(deleteDoc(doc(db, 'words', 'w1')));
  });

  it('교사는 단어를 만들 수 있다', async () => {
    const db = testEnv.authenticatedContext(TEACHER).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'words', 'w2'), {
        text: '엉뚱한',
        normalizedText: '엉뚱한',
        type: 'trait',
        active: true,
        sortOrder: 20,
      }),
    );
  });
});

describe('wordSuggestions', () => {
  it('학생은 자기 이름으로 pending 제안을 만들 수 있다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertSucceeds(setDoc(doc(db, 'wordSuggestions', 's1'), suggestion()));
  });

  it('로그인하지 않으면 제안을 만들 수 없다', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(db, 'wordSuggestions', 's1'), suggestion()));
  });

  it('다른 사람의 uid 로는 제안을 만들 수 없다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(
      setDoc(doc(db, 'wordSuggestions', 's1'), suggestion({ ownerUid: OTHER_STUDENT })),
    );
  });

  it('처음부터 approved 로 올릴 수 없다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(setDoc(doc(db, 'wordSuggestions', 's1'), suggestion({ status: 'approved' })));
  });

  it('15자를 넘는 단어나 빈 단어는 막는다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(setDoc(doc(db, 'wordSuggestions', 's1'), suggestion({ text: '가'.repeat(16) })));
    await assertFails(setDoc(doc(db, 'wordSuggestions', 's2'), suggestion({ text: '' })));
  });

  it('trait/character 가 아닌 종류는 막는다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(setDoc(doc(db, 'wordSuggestions', 's1'), suggestion({ type: 'something' })));
  });

  it('제안은 본인과 교사만 읽을 수 있다', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'wordSuggestions', 's1'), suggestion());
    });

    await assertSucceeds(
      getDoc(doc(testEnv.authenticatedContext(STUDENT).firestore(), 'wordSuggestions', 's1')),
    );
    await assertSucceeds(
      getDoc(doc(testEnv.authenticatedContext(TEACHER).firestore(), 'wordSuggestions', 's1')),
    );
    await assertFails(
      getDoc(doc(testEnv.authenticatedContext(OTHER_STUDENT).firestore(), 'wordSuggestions', 's1')),
    );
    await assertFails(
      getDoc(doc(testEnv.unauthenticatedContext().firestore(), 'wordSuggestions', 's1')),
    );
  });

  it('승인은 교사만 할 수 있다', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'wordSuggestions', 's1'), suggestion());
    });

    await assertFails(
      updateDoc(doc(testEnv.authenticatedContext(STUDENT).firestore(), 'wordSuggestions', 's1'), {
        status: 'approved',
      }),
    );
    await assertSucceeds(
      updateDoc(doc(testEnv.authenticatedContext(TEACHER).firestore(), 'wordSuggestions', 's1'), {
        status: 'approved',
      }),
    );
  });

  it('학생은 자기 pending 제안만 지울 수 있다', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'wordSuggestions', 'pending1'), suggestion());
      await setDoc(doc(db, 'wordSuggestions', 'approved1'), suggestion({ status: 'approved' }));
    });

    const studentDb = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(deleteDoc(doc(studentDb, 'wordSuggestions', 'approved1')));
    await assertSucceeds(deleteDoc(doc(studentDb, 'wordSuggestions', 'pending1')));

    await assertFails(
      deleteDoc(
        doc(testEnv.authenticatedContext(OTHER_STUDENT).firestore(), 'wordSuggestions', 'approved1'),
      ),
    );
  });
});

describe('admins', () => {
  it('자기 문서만 읽을 수 있고 아무도 쓸 수 없다', async () => {
    const teacherDb = testEnv.authenticatedContext(TEACHER).firestore();
    await assertSucceeds(getDoc(doc(teacherDb, 'admins', TEACHER)));

    const studentDb = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(getDoc(doc(studentDb, 'admins', TEACHER)));
    await assertFails(setDoc(doc(studentDb, 'admins', STUDENT), { role: 'teacher' }));
    await assertFails(setDoc(doc(teacherDb, 'admins', 'someone'), { role: 'teacher' }));
  });
});

describe('그 밖의 컬렉션', () => {
  it('정의하지 않은 컬렉션은 읽기도 쓰기도 막는다', async () => {
    const db = testEnv.authenticatedContext(STUDENT).firestore();
    await assertFails(getDoc(doc(db, 'students', STUDENT)));
    await assertFails(setDoc(doc(db, 'students', STUDENT), { name: '지우' }));
  });
});
