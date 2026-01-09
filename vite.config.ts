import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { cloudflare } from '@cloudflare/vite-plugin';

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [vue(), mode === 'development' && (await import('vite-plugin-vue-devtools')).default(), cloudflare()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}));
