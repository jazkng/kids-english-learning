import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertCompletePrecache, packageResources, precacheExtensions } from './scripts/precache-policy.ts';

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
        globPatterns: [`**/*.{${precacheExtensions.join(',')}}`],
        // 👑 Keep an atomic small starter package; exceeding this must fail rather than silently skip media.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        manifestTransforms: [async (entries) => {
          assertCompletePrecache(entries, packageResources(resolve('dist')));
          // 👑 Derive readiness from the same list Workbox installs, including future packaged audio.
          const index = JSON.stringify({ schemaVersion: 1, resources: entries.map(({ url, revision }) => ({ url, revision: revision ?? null })) });
          writeFileSync(resolve('dist/offline-package.json'), index);
          return {
            manifest: [...entries, { url: 'offline-package.json', revision: createHash('sha256').update(index).digest('hex'), size: Buffer.byteLength(index) }],
            warnings: [],
          };
        }],
      },
    }),
  ],
});
