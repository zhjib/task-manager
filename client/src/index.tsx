import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createPortal } from 'react-dom';

import RoutesComponent from './app.tsx';
import './index.css';
import { Toaster } from '@/components/ui/sonner';

const CLIENT_BASE_PATH = import.meta.env.CLIENT_BASE_PATH || '/';

const MainApp = () => {
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
            <div className="text-lg font-semibold text-gray-800">页面出错了</div>
            <div className="text-sm text-gray-500">{(error as Error)?.message}</div>
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
              onClick={resetErrorBoundary}
            >
              返回重试
            </button>
          </div>
        )}
      >
        <RoutesComponent />
        {createPortal(<Toaster />, document.body)}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
