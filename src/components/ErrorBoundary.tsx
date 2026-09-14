import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** 예상 못 한 오류로 빈 화면이 되지 않도록 감싼다. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="screen screen--center">
        <div className="card">
          <h1 className="screen__title">잠깐 문제가 생겼어요.</h1>
          <p className="screen__lead">페이지를 새로 열면 다시 할 수 있어요.</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }
}
