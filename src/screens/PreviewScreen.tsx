import { Button } from '../components/Button';
import { combinedName, useCreation } from '../app/store';

interface Props {
  onGenerate: () => void;
  disabled: boolean;
  limitReached: boolean;
  onContinueWithoutImage: () => void;
}

export function PreviewScreen({
  onGenerate,
  disabled,
  limitReached,
  onContinueWithoutImage,
}: Props) {
  const { state, dispatch } = useCreation();

  return (
    <div className="screen screen--center">
      <div className="card card--preview">
        <h1 className="screen__title">내가 고른 두 단어</h1>

        <p className="combo__word">{state.trait?.text}</p>
        <p className="combo__plus" aria-hidden="true">
          ＋
        </p>
        <p className="combo__word">
          {state.character?.emoji ? (
            <span aria-hidden="true">{state.character.emoji} </span>
          ) : null}
          {state.character?.text}
        </p>

        <p className="combo__result">✨ {combinedName(state)} ✨</p>

        <p className="screen__lead">이 모습으로 나만의 캐릭터를 만들어 볼까요?</p>

        {limitReached ? (
          <p className="screen__note" role="status">
            오늘은 그림을 충분히 만들었어요. 고른 단어로 자기소개를 이어가 볼까요?
          </p>
        ) : null}

        <div className="screen__actions">
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'goto', step: 'character' })}
          >
            ← 다시 고르기
          </Button>
          {limitReached ? (
            <Button onClick={onContinueWithoutImage}>그림 없이 계속하기 →</Button>
          ) : (
            <Button onClick={onGenerate} disabled={disabled}>
              그림 만들기 →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
