interface Props {
  label: string;
}

/** 로딩 표시. prefers-reduced-motion 에서는 CSS 가 애니메이션을 멈춘다. */
export function LoadingIndicator({ label }: Props) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="loading__label">{label}</span>
    </div>
  );
}
