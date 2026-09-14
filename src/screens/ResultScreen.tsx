import { Button } from '../components/Button';
import { FinalCard } from '../components/FinalCard';
import { combinedName, useCreation } from '../app/store';
import { downloadDataUrl } from '../utils/download';

export function ResultScreen() {
  const { state, dispatch } = useCreation();
  const name = combinedName(state);

  const intro = state.nickname ? `${name} ${state.nickname}입니다.` : `나는 ${name}입니다.`;

  return (
    <div className="screen screen--center">
      <h1 className="screen__title">나의 자기소개 카드</h1>
      <p className="screen__lead">{intro}</p>

      <FinalCard state={state} name={name} />

      <div className="screen__actions">
        {state.generatedImage ? (
          <Button
            variant="secondary"
            onClick={() => downloadDataUrl(state.generatedImage as string, name)}
          >
            ⬇ 이미지 저장하기
          </Button>
        ) : null}
        <Button onClick={() => dispatch({ type: 'restart' })}>다른 모습도 만들어 보기</Button>
      </div>

      <p className="screen__note">
        만든 그림과 자기소개는 저장되지 않아요. 남기고 싶으면 이미지를 저장해 주세요.
      </p>
    </div>
  );
}
