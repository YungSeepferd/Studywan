import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Update base to match your GitHub Pages repo name if needed.
const enablePwa = process.env.VITE_ENABLE_PWA === 'true'

export default defineConfig({
  plugins: [
    react(),
    ...(enablePwa
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt'],
            manifest: {
              name: 'StudyWan',
              short_name: 'StudyWan',
              start_url: (process.env.VITE_BASE || '/StudyWan/') as string,
              scope: (process.env.VITE_BASE || '/StudyWan/') as string,
              display: 'standalone',
              background_color: '#ffffff',
              theme_color: '#0ea5e9',
              icons: [
                // Preferred PNG icons (provide these files for best install prompts)
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
                // Fallback SVG if PNGs are not present yet
                { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,json,mp3,ogg}'],
              navigateFallback: (process.env.VITE_BASE || '/StudyWan/') as string,
              runtimeCaching: [
                {
                  urlPattern: ({ request }) => request.destination === 'audio' || /\.(mp3|ogg)$/i.test(request.url),
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'audio-cache',
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  },
                },
                {
                  urlPattern: ({ request }) => request.destination === 'image' || /\.(png|jpg|jpeg|svg|webp)$/i.test(request.url),
                  handler: 'StaleWhileRevalidate',
                  options: { cacheName: 'image-cache' },
                },
              ],
            },
          }),
        ]
      : []),
  ],
  base: process.env.VITE_BASE || '/StudyWan/',
})
