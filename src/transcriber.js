import { pipeline } from '@huggingface/transformers'

let transcriber = null

/**
 * Load or return cached Whisper pipeline.
 * @param {string} model - 'base' or 'small'
 * @param {Function} onProgress - callback(statusText, progressFloat)
 */
async function loadModel(model, onProgress) {
  const modelId = model === 'small'
    ? 'onnx-community/whisper-small'
    : 'onnx-community/whisper-base'

  onProgress?.('載入語音辨識模型...', 0)

  transcriber = await pipeline('automatic-speech-recognition', modelId, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (progress) => {
      if (progress.status === 'progress') {
        const pct = Math.round(progress.progress)
        onProgress?.(`下載模型... ${pct}%`, progress.progress / 100)
      }
    },
  })

  return transcriber
}

/**
 * Transcribe audio using Whisper.
 * @param {Float32Array} audioData - 16kHz mono PCM
 * @param {object} options
 * @param {string} options.language - 'zh', 'en', or 'auto'
 * @param {string} options.model - 'base' or 'small'
 * @param {Function} options.onProgress
 * @returns {Array<{start: number, end: number, text: string}>} - timestamped chunks
 */
export async function transcribe(audioData, { language, model, onProgress }) {
  if (!transcriber) {
    await loadModel(model, onProgress)
  }

  onProgress?.('辨識語音中...', 0.5)

  const result = await transcriber(audioData, {
    language: language === 'auto' ? undefined : language,
    task: 'transcribe',
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  })

  onProgress?.('辨識完成', 1)

  // result.chunks = [{timestamp: [start, end], text: "..."}]
  return (result.chunks || []).map((chunk) => ({
    start: chunk.timestamp[0] ?? 0,
    end: chunk.timestamp[1] ?? chunk.timestamp[0] + 5,
    text: chunk.text.trim(),
  }))
}
