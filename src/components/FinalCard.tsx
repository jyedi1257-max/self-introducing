import type { CreationState } from '../app/types';
import { particleFor, reasonClause } from '../utils/korean';

interface Props {
  state: CreationState;
  name: string;
}

const DONT_KNOW = '잘 모르겠어요';

function ReasonLine({ word, reason }: { word?: string; reason?: string }) {
  if (!word || !reason) return null;

  if (reason.trim() === DONT_KNOW) {
    return (
      <p className="final-card__reason">
        ‘{word}’{particleFor(word)} 고른 이유는 아직 찾는 중이에요.
      </p>
    );
  }

  return (
    <p className="final-card__reason">
      나는 {reasonClause(reason)} ‘{word}’{particleFor(word)} 골랐어요.
    </p>
  );
}

export function FinalCard({ state, name }: Props) {
  const hasReason = Boolean(state.traitReason || state.characterReason);

  return (
    <article className="final-card">
      {state.generatedImage ? (
        <img
          className="final-card__image"
          src={state.generatedImage}
          alt={`${name} 모습으로 만든 그림`}
        />
      ) : (
        <div className="final-card__placeholder" aria-hidden="true">
          ✨
        </div>
      )}

      <h2 className="final-card__name">{name}</h2>

      {hasReason ? (
        <>
          <ReasonLine word={state.trait?.text} reason={state.traitReason} />
          <ReasonLine word={state.character?.text} reason={state.characterReason} />
        </>
      ) : (
        <p className="final-card__reason">나는 {name}입니다.</p>
      )}

      {state.nickname ? <p className="final-card__nickname">{state.nickname}</p> : null}
    </article>
  );
}
