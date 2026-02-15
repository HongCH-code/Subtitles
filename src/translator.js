import { pipeline } from '@huggingface/transformers'
import * as OpenCC from 'opencc-js'

let translator = null
const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' })

/**
 * Translate an array of English text segments to Traditional Chinese.
 * Uses Helsinki-NLP/opus-mt-en-zh via Transformers.js (runs in browser).
 *
 * @param {string[]} texts - Array of English text strings
 * @param {Function} onProgress - callback(statusText, progressFloat)
 * @returns {string[]} - Array of Traditional Chinese translations
 */
export async function translateEnToZh(texts, onProgress) {
  if (!translator) {
    onProgress?.('載入翻譯模型...', 0)

    translator = await pipeline('translation', 'Xenova/opus-mt-en-zh', {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (progress) => {
        if (progress.status === 'progress') {
          const pct = Math.round(progress.progress)
          onProgress?.(`下載翻譯模型... ${pct}%`, progress.progress / 100)
        }
      },
    })
  }

  onProgress?.('翻譯中...', 0.3)

  const results = []
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i].trim()
    if (!text) {
      results.push('')
      continue
    }

    const output = await translator(text)
    // Convert Simplified Chinese to Traditional Chinese (Taiwan)
    results.push(s2tConverter(output[0].translation_text))

    // Update progress
    const progress = 0.3 + (0.7 * (i + 1)) / texts.length
    onProgress?.(`翻譯中... (${i + 1}/${texts.length})`, progress)
  }

  return results
}
