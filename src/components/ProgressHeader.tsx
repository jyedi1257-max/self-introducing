import type { Step } from '../app/types';

const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'trait', label: '성격 단어' },
  { key: 'character', label: '캐릭터 단어' },
  { key: 'preview', label: '두 단어 확인' },
  { key: 'generating', label: '그림 만들기' },
  { key: 'reason', label: '고른 이유' },
  { key: 'result', label: '자기소개' },
];

interface Props {
  step: Step;
}

export function ProgressHeader({ step }: Props) {
  if (step === 'start') return null;

  const currentIndex = STEPS.findIndex((item) => item.key === step);
  const current = currentIndex < 0 ? 0 : currentIndex;

  return (
    <header className="progress">
      <p className="progress__text">
        {current + 1} / {STEPS.length} · {STEPS[current].label}
      </p>
      <ol className="progress__bar">
        {STEPS.map((item, index) => (
          <li
            key={item.key}
            className={`progress__dot ${index <= current ? 'is-done' : ''}`.trim()}
          >
            <span className="sr-only">
              {item.label}
              {index === current ? ' (지금 하는 것)' : ''}
            </span>
          </li>
        ))}
      </ol>
    </header>
  );
}
