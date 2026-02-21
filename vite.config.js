import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'], // Archivos que deben estar siempre offline
      manifest: {
        name: 'Yalaza - Gestión de Eventos',
        short_name: 'Yalaza',
        description: 'Crea, valida y gestiona eventos de forma simple.',
        theme_color: '#7C4DFF',
        background_color: '#121212', // Color de fondo para el splash screen
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'favicon.ico', sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' },
          { src: 'logo192.png', type: 'image/png', sizes: '192x192' },
          { src: 'logo512.png', type: 'image/png', sizes: '512x512', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // Estrategia de caché para optimizar el rendimiento del Objetivo 5
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://your-supabase-url.supabase.co',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              }
            }
          }
        ]
      }
    })
  ]
});