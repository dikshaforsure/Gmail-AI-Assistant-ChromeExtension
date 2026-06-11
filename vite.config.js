import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' }), crx({ manifest })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: "index.html",
        background: "src/background.js",
        content: "src/content.jsx" 
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});