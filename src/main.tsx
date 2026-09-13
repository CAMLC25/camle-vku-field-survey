import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

// Register Service Worker with automatic updates & offline caching
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[PWA] New version available, automatically updating Service Worker...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] VKU Field Survey application cached and ready for 100% offline usage.');
  },
  onRegisterError(error) {
    console.warn('[PWA] Service Worker registration failed:', error);
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LanguageProvider>
  </React.StrictMode>
);
