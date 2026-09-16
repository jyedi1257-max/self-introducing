import { useId, useState } from 'react';
import { Button } from '../components/Button';
import { useCreation } from '../app/store';
import { MAX_REASON_LENGTH, sanitizeReason } from '../utils/validateWord';
import { particleFor } from '../utils/korean';

const DONT_KNOW = '잘 모르겠어요';

export function ReasonScreen() {
  const { state, dispatch } = useCreation();
  const traitId = useId();
  const characterId = useId();

  const [traitReason, setTraitReason] = useState(state.traitReason ?? '');
  const [characterReason, setCharacterReason] = useState(state.characterReason ?? '');

  function finish() {
    dispatch({ type: 'setTraitReason', reason: sanitizeReason(traitReason) });
    dispatch({ type: 'setCharacterReason', reason: sanitizeReason(characterReason) });
    dispatch({ type: 'goto', step: 'result' });
  }

  return (
    <div className="screen">
      <h1 className="screen__title">왜 이 단어를 골랐나요?</h1>
      <p className="screen__lead">정답은 없어요. 떠오르는 대로 적어 보세요.</p>

      <div className="card reason-card">
        <label className="reason__question" htmlFor={traitId}>
          왜 ‘{state.trait?.text}’{particleFor(state.trait?.text ?? '')} 골랐나요?
        </label>
        <p className="reason__frame">
          나는 <span className="reason__blank">__________</span>해서 ‘{state.trait?.text}’{particleFor(state.trait?.text ?? '')} 골랐어요.
        </p>
        <input
          id={traitId}
          className="field__input"
          type="text"
          value={traitReason}
          maxLength={MAX_REASON_LENGTH}
          autoComplete="off"
          onChange={(event) => setTraitReason(event.target.value)}
        />
        <Button variant="ghost" onClick={() => setTraitReason(DONT_KNOW)}>
          {DONT_KNOW}
        </Button>
      </div>

      <div className="card reason-card">
        <label className="reason__question" htmlFor={characterId}>
          왜 ‘{state.character?.text}’{particleFor(state.character?.text ?? '')} 골랐나요?
        </label>
        <p className="reason__frame">
          나는 <span className="reason__blank">__________</span>해서 ‘{state.character?.text}’{particleFor(state.character?.text ?? '')} 골랐어요.
        </p>
        <input
          id={characterId}
          className="field__input"
          type="text"
          value={characterReason}
          maxLength={MAX_REASON_LENGTH}
          autoComplete="off"
          onChange={(event) => setCharacterReason(event.target.value)}
        />
        <Button variant="ghost" onClick={() => setCharacterReason(DONT_KNOW)}>
          {DONT_KNOW}
        </Button>
      </div>

      <div className="screen__actions">
        <Button variant="secondary" onClick={() => dispatch({ type: 'goto', step: 'preview' })}>
          ← 뒤로
        </Button>
        <Button onClick={finish}>자기소개 완성하기 →</Button>
      </div>
    </div>
  );
}
