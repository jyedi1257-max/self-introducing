/** 화면(단계) 식별자. 라우터 대신 상태 머신으로 화면을 전환한다. */
export type Step =
  | 'start'
  | 'trait'
  | 'character'
  | 'preview'
  | 'generating'
  | 'reason'
  | 'result';

/** 단어 종류: 성격/상태 단어와 캐릭터(비유) 단어 */
export type WordType = 'trait' | 'character';

export interface Word {
  id: string;
  text: string;
  normalizedText: string;
  type: WordType;
  emoji?: string | null;
  active: boolean;
  sortOrder: number;
  /** 이 학생이 직접 추가한 단어인지 여부 (Firestore words 에는 없는 값) */
  custom?: boolean;
}

/** 학생이 선택한 단어. 직접 추가한 단어는 id 가 없을 수 있다. */
export interface SelectedWord {
  id?: string;
  text: string;
  emoji?: string | null;
  custom?: boolean;
}

export interface CreationState {
  step: Step;
  nickname?: string;

  trait?: SelectedWord;
  character?: SelectedWord;

  /** data: URL 형태의 생성 이미지. 저장하지 않고 브라우저 메모리에만 둔다. */
  generatedImage?: string;

  traitReason?: string;
  characterReason?: string;

  /** 이번 세션에서 이미지를 몇 번 생성했는지 (비용 방어선) */
  generationCount: number;

  /** 이미지 없이 자기소개를 이어가기로 한 경우 */
  skippedImage: boolean;
}

export type GenerationErrorKind = 'safety' | 'network' | 'unknown';

export interface GenerationError {
  kind: GenerationErrorKind;
}
