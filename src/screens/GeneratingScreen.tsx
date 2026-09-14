import { combinedName, useCreation } from '../app/store';
import { LoadingIndicator } from '../components/LoadingIndicator';

export function GeneratingScreen() {
  const { state } = useCreation();

  return (
    <div className="screen screen--center">
      <div className="card card--generating">
        <p className="generating__emoji" aria-hidden="true">
          🎨
        </p>
        <h1 className="screen__title">
          {combinedName(state)}을(를)
          <br />
          그리고 있어요.
        </h1>
        <p className="screen__lead">
          {state.trait?.text} ＋ {state.character?.text}
        </p>
        <LoadingIndicator label="조금만 기다려 주세요." />
      </div>
    </div>
  );
}
