import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { combinedName, useCreation } from '../app/store';
import type { GenerationError } from '../app/types';
import { downloadDataUrl } from '../utils/download';

interface Props {
  error: GenerationError | null;
  limitReached: boolean;
  remaining: number;
  onRetry: (extraWhimsical?: boolean) => void;
  onContinue: () => void;
  onBackToWords: () => void;
  onContinueWithoutImage: () => void;
}

export function ImageResultScreen({
  error,
  limitReached,
  remaining,
  onRetry,
  onContinue,
  onBackToWords,
  onContinueWithoutImage,
}: Props) {
  const { state } = useCreation();
  const name = combinedName(state);

  if (error) {
    return (
      <div className="screen screen--center">
        <div className="card">
          {error.kind === 'safety' ? (
            <ErrorMessage
              title="이 단어로는 그림을 만들기 어려워요."
              description="다른 단어를 골라 볼까요?"
            >
              <Button onClick={onBackToWords}>단어 다시 고르기</Button>
            </ErrorMessage>
          ) : (
            <ErrorMessage title="그림을 만들지 못했어요." description="한 번 더 만들어 볼까요?">
              <Button onClick={() => onRetry(false)} disabled={limitReached}>
                다시 만들기
              </Button>
              <Button variant="secondary" onClick={onContinueWithoutImage}>
                그림 없이 자기소개 계속하기
              </Button>
            </ErrorMessage>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--center">
      <div className="card card--image">
        {state.generatedImage ? (
          <img
            className="result-image"
            src={state.generatedImage}
            alt={`${name} 모습으로 만든 그림`}
          />
        ) : null}

        <p className="combo__caption">
          {state.trait?.text} ＋ {state.character?.text}
        </p>

        <h1 className="screen__title screen__title--small">이 그림이 나와 잘 어울리나요?</h1>

        <div className="screen__actions">
          <Button variant="secondary" onClick={() => onRetry(false)} disabled={limitReached}>
            🤔 조금 달라요
          </Button>
          <Button onClick={onContinue}>😍 마음에 들어요</Button>
        </div>

        <div className="screen__actions screen__actions--extra">
          <Button variant="ghost" onClick={() => onRetry(true)} disabled={limitReached}>
            🎲 조금 더 엉뚱하게!
          </Button>
          {state.generatedImage ? (
            <Button
              variant="ghost"
              onClick={() => downloadDataUrl(state.generatedImage as string, `${name}.png`)}
            >
              ⬇ 이미지 저장하기
            </Button>
          ) : null}
        </div>

        <p className="screen__note" role="status">
          {limitReached
            ? '오늘은 그림을 충분히 만들었어요. 고른 단어로 자기소개를 이어가 볼까요?'
            : `그림은 ${remaining}번 더 만들 수 있어요.`}
        </p>
      </div>
    </div>
  );
}
