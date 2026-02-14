import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg = null

async function loadFFmpeg(onProgress) {
  if (ffmpeg) return ffmpeg
  ffmpeg = new FFmpeg()

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.(`提取音訊中... ${Math.round(progress * 100)}%`, progress)
  })

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  return ffmpeg
}

/**
 * Extracts audio from video file as 16kHz mono WAV (required by Whisper).
 * @param {File} videoFile
 * @param {Function} onProgress - callback(statusText, progressFloat)
 * @returns {Float32Array} - PCM audio samples at 16kHz
 */
export async function extractAudio(videoFile, onProgress) {
  onProgress?.('載入 FFmpeg...', 0)
  const ff = await loadFFmpeg(onProgress)

  const inputName = 'input' + videoFile.name.substring(videoFile.name.lastIndexOf('.'))
  const outputName = 'output.wav'

  await ff.writeFile(inputName, await fetchFile(videoFile))

  await ff.exec([
    '-i', inputName,
    '-ar', '16000',       // 16kHz sample rate
    '-ac', '1',            // mono
    '-c:a', 'pcm_s16le',  // 16-bit PCM
    outputName,
  ])

  const data = await ff.readFile(outputName)

  // Clean up
  await ff.deleteFile(inputName)
  await ff.deleteFile(outputName)

  // Convert WAV bytes to Float32Array for Whisper
  // Skip WAV header (44 bytes), read as Int16, normalize to Float32
  const int16 = new Int16Array(data.buffer, 44)
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0
  }

  return float32
}
