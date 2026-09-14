import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function ErrorMessage({ title, description, children }: Props) {
  return (
    <div className="error-box" role="alert">
      <p className="error-box__title">
        <span aria-hidden="true">😅</span> {title}
      </p>
      {description ? <p className="error-box__description">{description}</p> : null}
      {children ? <div className="error-box__actions">{children}</div> : null}
    </div>
  );
}
