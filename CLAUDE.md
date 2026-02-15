# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server (http://localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build locally

No test framework is configured.

## Architecture

Pure frontend SPA (no backend) that transcribes video speech to subtitles using browser-side AI. Built with Vite + vanilla JS (no framework).

### Processing Pipeline

```
Video File/URL → FFmpeg WASM (extract audio) → Whisper WASM (transcribe) → [Translate if English] → SRT/Text output
```

### Module Responsibilities

- **`src/main.js`** — Orchestrator. Wires all modules together, manages UI state, handles the processing pipeline sequence.
- **`src/file-handler.js`** — File input (drag-and-drop, click-to-upload, URL fetch with validation).
- **`src/audio-extractor.js`** — FFmpeg WASM integration. Converts video to 16kHz mono WAV Float32Array. FFmpeg core files served from `public/ffmpeg/` (same-origin) to avoid COEP blocking.
- **`src/transcriber.js`** — Whisper speech recognition via `@huggingface/transformers`. Supports base/small models, caches loaded model, handles model switching.
- **`src/translator.js`** — English→Chinese translation via `Xenova/opus-mt-en-zh` + `opencc-js` for Simplified→Traditional Chinese (Taiwan) conversion.
- **`src/subtitle-generator.js`** — Pure logic: `resegment()` splits chunks by max interval at sentence boundaries, `generateSRT()`/`generateText()` produce output. Supports optional bilingual (original + translation) output.

### Key Technical Constraints

- **COOP/COEP headers required** — `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` must be set for SharedArrayBuffer (FFmpeg WASM). Configured in `vite.config.js` for dev/preview. Production hosting must set these headers separately.
- **FFmpeg core served locally** — `public/ffmpeg/ffmpeg-core.js` and `.wasm` are copies from `@ffmpeg/core` npm package. If upgrading `@ffmpeg/core`, these files must be re-copied.
- **`@huggingface/transformers`, `@ffmpeg/ffmpeg`, `@ffmpeg/util` excluded from Vite optimizeDeps** — Their worker/WASM loading breaks with Vite's dependency optimizer.
- **AI models download on first use** — Whisper base (~75MB), small (~250MB), translation (~300MB). Cached in browser IndexedDB after first download.
