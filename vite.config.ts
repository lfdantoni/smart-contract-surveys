import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// We only need VITE_ prefixed variables baked into the bundle.
// Runtime overrides come from window.__ENV__ via env.ts helper.
export default defineConfig(({ mode }) => {
  // Load Vite env vars; only VITE_ prefixed will be exposed automatically.
  const env = loadEnv(mode, process.cwd());
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Avoid defining process.env.* to reduce accidental secret leakage.
    // Access variables via import.meta.env.VITE_... or our env helper.
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
