import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      // 👑 A new worker must not reload an active lesson; CC adds a parent-facing update flow.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Kids English Learning', short_name: 'English', lang: 'en',
        start_url: './', scope: './', display: 'standalone',
        background_color: '#fffaf0', theme_color: '#164b43',
        icons: [{ src: 'icons/app.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,mp3,wav,ogg}'],
        // 👑 Keep an atomic small starter package; exceeding this must fail rather than silently skip media.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
