import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  root: resolve(root, 'hostinger/client'),
  publicDir: resolve(root, 'public'),
  base: '/mcm-public/',
  resolve: { alias: { '@': root, 'next/link': resolve(root, 'hostinger/client/link.tsx') } },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('/api'),
    'process.env.NEXT_PUBLIC_MAP_EDITOR_ENABLED': JSON.stringify('false'),
  },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    outDir: resolve(root, 'dist-hostinger/mcm-public'),
    emptyOutDir: true,
    rollupOptions: { input: resolve(root, 'hostinger/client/map-app.html') },
  },
});
