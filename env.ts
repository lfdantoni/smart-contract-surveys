// Runtime + build-time environment helper
// This merges window.__ENV__ (injected at container start) with Vite build-time variables (prefixed VITE_)
// Usage: import { env, getEnv, GEMINI_API_KEY } from './env';

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

// Access a key without prefix; will look into runtime first then Vite import.meta.env
export function getEnv(key: string, fallback?: string): string | undefined {
  if (typeof window !== 'undefined' && window.__ENV__ && key in window.__ENV__) {
    return window.__ENV__[key];
  }
  const viteVal = (import.meta as any).env?.[`VITE_${key}`];
  return viteVal ?? fallback;
}

export const env = new Proxy({}, {
  get: (_, prop: string) => getEnv(prop)
}) as Record<string, string | undefined>;

// Convenience export for Gemini API key. NOTE: Avoid exposing secrets in client bundles; prefer backend proxy.
export const GEMINI_API_KEY = getEnv('GEMINI_API_KEY');
