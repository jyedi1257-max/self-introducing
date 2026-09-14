import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { CreationProvider } from './app/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root 를 찾을 수 없습니다.');

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <CreationProvider>
        <App />
      </CreationProvider>
    </ErrorBoundary>
  </StrictMode>,
);
