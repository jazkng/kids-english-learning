import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { App } from './app/App';
import { startPwa } from './services/pwa';
import './styles/app.css';

// 👑 Native bundles already ship local assets; avoid stale service-worker caches in Android WebView.
if (import.meta.env.PROD && !Capacitor.isNativePlatform()) startPwa();
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
