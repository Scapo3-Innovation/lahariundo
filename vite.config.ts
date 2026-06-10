import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Reuse the hand-authored public/manifest.json + existing icons —
      // do NOT let the plugin generate or inject its own manifest.
      manifest: false,
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
        'logo.png',
        'logo-opt.png',
        'logo.svg',
        'manifest.json',
        'data.json',
      ],
      workbox: {
        // Precache the app shell + data.json + key static assets so the
        // resources hub, helplines, rights, FAQ and roadmap work fully offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        // Large promo-only images aren't part of the offline shell — skip them
        // so they don't bloat the precache (and exceed the 2 MB limit).
        globIgnores: ['**/logo-wordmark.png', '**/og-image.png'],
        // SPA fallback so deep links (/faq, /recovery, …) resolve offline.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/data\.json$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Google Fonts stylesheets — needed for Malayalam glyphs offline.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Google Fonts webfont files.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
