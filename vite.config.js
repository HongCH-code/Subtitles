import { defineConfig } from 'vite';

// NOTE: COOP/COEP headers are required for SharedArrayBuffer (used by FFmpeg WASM).
// When deploying to production, configure your hosting provider / reverse proxy
// to send these same headers:
//   Cross-Origin-Opener-Policy: same-origin
//   Cross-Origin-Embedder-Policy: require-corp

export default defineConfig({
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
