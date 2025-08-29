import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function registerAppServiceWorker() {
  if ('serviceWorker' in navigator) {
    const path = window.location.pathname;
    if (path.startsWith('/app')) {
      const register = async () => {
        try {
          // Dynamically inject the app-scoped manifest link only for /app/*
          const existing = document.querySelector('link[rel="manifest"][data-scope="app"]');
          if (!existing) {
            const link = document.createElement('link');
            link.setAttribute('rel', 'manifest');
            link.setAttribute('href', '/app/manifest.json');
            link.setAttribute('data-scope', 'app');
            document.head.appendChild(link);
          }

          await navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('SW registration failed', err);
        }
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        register();
      } else {
        window.addEventListener('DOMContentLoaded', register);
      }
    }
  }
}

registerAppServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
