import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Admin page is a separate chunk so guests never download it.
const AdminPage = lazy(() => import('./AdminPage.tsx').then((m) => ({ default: m.AdminPage })));

const isAdmin = window.location.pathname.replace(/\/+$/, '').toLowerCase() === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
