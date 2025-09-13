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
              display: 'standalone',
              background_color: '#ffffff',
              theme_color: '#0ea5e9',
              icons: [
                // Ensure these files exist in public before enabling PWA
                { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
              ],
            },
          }),
        ]
      : []),
  ],
  base: process.env.VITE_BASE || '/StudyWan/',
})
