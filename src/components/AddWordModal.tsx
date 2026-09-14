import { useId, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { MAX_WORD_LENGTH, validateWord } from '../utils/validateWord';

interface Props {
  onClose: () => void;
  onAdd: (text: string) => void;
}

export function AddWordModal({ onClose, onAdd }: Props) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const result = validateWord(value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onAdd(result.value);
  }

  return (
    <Modal title="내 단어 추가하기" onClose={onClose}>
      <label className="modal__label" htmlFor={inputId}>
        어떤 말을 넣고 싶나요?
      </label>
      <input
        id={inputId}
        className="modal__input"
        type="text"
        value={value}
        maxLength={MAX_WORD_LENGTH + 5}
        autoComplete="off"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        onChange={(event) => {
          setValue(event.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
      />
      <p className="modal__hint">{MAX_WORD_LENGTH}글자까지 쓸 수 있어요.</p>
      {error ? (
        <p className="modal__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      <div className="modal__actions">
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button onClick={submit}>추가하기</Button>
      </div>
    </Modal>
  );
}
