import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (bundled with the app) — no request to Google Fonts,
// so the user's IP is never sent there on page load.
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/noto-sans-malayalam/400.css';
import '@fontsource/noto-sans-malayalam/500.css';
import '@fontsource/noto-sans-malayalam/600.css';
import '@fontsource/noto-sans-malayalam/700.css';
import './index.css';
import './i18n';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
 <StrictMode>
  <App />
 </StrictMode>,
);

// Fade out the initial splash once the app has mounted. A short minimum
// keeps the animation from flashing on fast loads.
(() => {
 const splash = document.getElementById('app-splash');
 if (!splash) return;
 const MIN_VISIBLE_MS = 500;
 const start = performance.now();
 const hide = () => {
  const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
  window.setTimeout(() => {
   splash.classList.add('app-splash-hide');
   splash.addEventListener('transitionend', () => splash.remove(), { once: true });
   // Fallback removal in case transitionend doesn't fire.
   window.setTimeout(() => splash.remove(), 600);
  }, wait);
 };
 requestAnimationFrame(() => requestAnimationFrame(hide));
})();
