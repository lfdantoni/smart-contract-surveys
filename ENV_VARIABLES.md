# Environment Variables

This project supports both **build-time** and **runtime** environment variables for flexible deployment.

## How It Works

1. **Build-time**: Vite automatically exposes variables prefixed with `VITE_` via `import.meta.env`
2. **Runtime**: Docker entrypoint generates `env.js` from environment variables prefixed with `APP_` (or custom `ENV_PREFIX`)
3. **Unified access**: The `env.ts` helper merges both sources, preferring runtime over build-time

## Usage

```typescript
import { env, getEnv, GEMINI_API_KEY } from './env';

// Option 1: Direct named export
const apiKey = GEMINI_API_KEY;

// Option 2: Proxy object
const apiKey = env.GEMINI_API_KEY;

// Option 3: Function with fallback
const apiKey = getEnv('GEMINI_API_KEY', 'fallback-value');
```

## Configuration

### Development (local)

Create `.env` file:
```bash
VITE_GEMINI_API_KEY=your-key-here
```

### Production (Docker/EasyPanel)

Set environment variables with `APP_` prefix:
```bash
APP_GEMINI_API_KEY=your-key-here
```

The Docker entrypoint will generate:
```javascript
window.__ENV__ = {
  GEMINI_API_KEY: "your-key-here"
};
```

### Custom Prefix

Override the default `APP_` prefix:
```bash
ENV_PREFIX=MY_APP_ docker run ...
```

## Security Notes

⚠️ **Client-side secrets**: The Gemini API key is exposed in the client bundle. For production, consider:
- Using a backend proxy to hide the API key
- Implementing request signing
- Rate limiting via your own API

The current setup is suitable for demos and prototypes where the API key has usage limits configured in Google AI Studio.
