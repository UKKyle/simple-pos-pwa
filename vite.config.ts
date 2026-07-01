import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/simple-pos-pwa/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Simple POS',
        short_name: 'POS',
        description: 'A local-first point of sale PWA for small businesses.',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        start_url: '/simple-pos-pwa/',
        scope: '/simple-pos-pwa/',
        icons: [
          {
            src: 'icons.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
