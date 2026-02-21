import React from 'react';
import ReactDOM from 'react-dom/client';
import { init, browserTracingIntegration, replayIntegration } from "@sentry/react";
import App from './App';
import './i18n';

// Sentry Frontend Configuration
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  init({
    dsn: SENTRY_DSN,
    integrations: [
      browserTracingIntegration(),
      replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {

    }).catch(registrationError => {

    });
  });
}
