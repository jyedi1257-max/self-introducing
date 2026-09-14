import { useEffect, useState } from 'react';
import type { SelectedWord, Word, WordType } from '../app/types';
import { WordGrid } from '../components/WordGrid';
import { AddWordModal } from '../components/AddWordModal';
import { Button } from '../components/Button';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { findExistingWord, loadWords, suggestWord } from '../services/wordService';
import { normalizeWord } from '../utils/validateWord';

interface Props {
  type: WordType;
  title: string;
  lead: string;
  selected?: SelectedWord;
  customWords: Word[];
  onAddCustomWord: (word: Word) => void;
  onSelect: (word: SelectedWord) => void;
  onNext: () => void;
  onBack: () => void;
  backLabel: string;
}

/** 성격 단어 화면과 캐릭터 단어 화면이 함께 쓰는 선택 화면. */
export function WordSelectScreen({
  type,
  title,
  lead,
  selected,
  customWords,
  onAddCustomWord,
  onSelect,
  onNext,
  onBack,
  backLabel,
}: Props) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadWords(type).then((result) => {
      if (cancelled) return;
      setWords(result.words);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [type]);

  const mine = customWords.filter((word) => word.type === type);
  const selectedId = selected?.id;

  function handleAdd(text: string) {
    setModalOpen(false);

    // 이미 목록에 있는 말이면 새로 만들지 않고 그 단어를 고른 것으로 처리한다.
    const existing = findExistingWord([...words, ...mine], text);
    if (existing) {
      onSelect({ id: existing.id, text: existing.text, emoji: existing.emoji, custom: existing.custom });
      return;
    }

    const word: Word = {
      id: `custom-${type}-${Date.now()}`,
      text,
      normalizedText: normalizeWord(text),
      type,
      emoji: null,
      active: true,
      sortOrder: 0,
      custom: true,
    };

    // 이 학생 화면에서는 바로 쓰고, 공용 목록 공개는 교사 검토 뒤에 이뤄진다.
    onAddCustomWord(word);
    onSelect({ id: word.id, text: word.text, custom: true });
    void suggestWord(text, type);
  }

  return (
    <div className="screen">
      <h1 className="screen__title">{title}</h1>
      <p className="screen__lead">{lead}</p>

      {loading ? (
        <LoadingIndicator label="단어를 가져오고 있어요." />
      ) : (
        <>
          {mine.length > 0 ? (
            <section className="word-section">
              <h2 className="word-section__title">
                <span aria-hidden="true">⭐</span> 내가 추가한 말
              </h2>
              <WordGrid
                words={mine}
                selectedId={selectedId}
                label="내가 추가한 말"
                onSelect={(word) =>
                  onSelect({ id: word.id, text: word.text, emoji: word.emoji, custom: true })
                }
              />
            </section>
          ) : null}

          <WordGrid
            words={words}
            selectedId={selectedId}
            label={title}
            onSelect={(word) => onSelect({ id: word.id, text: word.text, emoji: word.emoji })}
          />

          <Button variant="ghost" className="btn--wide" onClick={() => setModalOpen(true)}>
            ＋ 내가 생각한 단어 추가하기
          </Button>
        </>
      )}

      <div className="screen__actions">
        <Button variant="secondary" onClick={onBack}>
          ← {backLabel}
        </Button>
        <Button onClick={onNext} disabled={!selected}>
          다음 →
        </Button>
      </div>

      {selected ? (
        <p className="screen__status" role="status">
          고른 말: <strong>{selected.text}</strong>
        </p>
      ) : null}

      {modalOpen ? (
        <AddWordModal onClose={() => setModalOpen(false)} onAdd={handleAdd} />
      ) : null}
    </div>
  );
}
