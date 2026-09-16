import { useId, useState } from 'react';
import { Button } from '../components/Button';
import { useCreation } from '../app/store';
import { sanitizeNickname, MAX_WORD_LENGTH } from '../utils/validateWord';

export function StartScreen() {
  const { state, dispatch } = useCreation();
  const nameId = useId();
  const [name, setName] = useState(state.nickname ?? '');

  function start() {
    dispatch({ type: 'setNickname', nickname: sanitizeNickname(name) });
    dispatch({ type: 'goto', step: 'trait' });
  }

  return (
    <div className="screen screen--center">
      <div className="card card--start">
        <p className="start__emoji" aria-hidden="true">
          ✨
        </p>
        <h1 className="screen__title">두 단어로 나를 만들어 봐!</h1>
        <p className="screen__lead">
          나를 잘 나타내는 단어 두 개를 골라
          <br />
          나만의 캐릭터를 만들어 보세요.
        </p>

        <div className="field">
          <label className="field__label" htmlFor={nameId}>
            이름 또는 별명 <span className="field__optional">(안 써도 괜찮아요)</span>
          </label>
          <input
            id={nameId}
            className="field__input"
            type="text"
            value={name}
            maxLength={MAX_WORD_LENGTH}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') start();
            }}
          />
        </div>

        <Button className="btn--wide" onClick={start}>
          시작하기
        </Button>

        <p className="start__note">사진이나 개인정보는 입력하지 않아도 돼요.</p>
      </div>
    </div>
  );
}
