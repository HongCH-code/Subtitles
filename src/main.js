import './style.css'
import { setupFileUpload, fetchVideoFromURL } from './file-handler.js'
import { extractAudio } from './audio-extractor.js'
import { transcribe } from './transcriber.js'
import { resegment, generateSRT, generateText } from './subtitle-generator.js'

// --- Module-level state for results ---
let srtContent = ''
let textContent = ''
let activeTab = 'text'

// --- Progress helpers ---
function showProgress(text, progress) {
  document.getElementById('progress-section').style.display = 'block'
  document.getElementById('progress-text').textContent = text
  document.getElementById('progress-bar').style.width = `${Math.round(progress * 100)}%`
}
function hideProgress() {
  document.getElementById('progress-section').style.display = 'none'
}

// --- Settings ---
function getSettings() {
  const intervalValue = document.getElementById('interval-select').value
  const customInterval = parseFloat(document.getElementById('custom-interval').value)
  return {
    language: document.getElementById('lang-select').value,
    model: document.getElementById('model-select').value,
    interval: intervalValue === 'custom' ? (customInterval || 5) : parseFloat(intervalValue),
  }
}

// --- Custom interval toggle ---
const intervalSelect = document.getElementById('interval-select')
const customIntervalGroup = document.getElementById('custom-interval-group')

intervalSelect.addEventListener('change', () => {
  if (intervalSelect.value === 'custom') {
    customIntervalGroup.style.display = ''
  } else {
    customIntervalGroup.style.display = 'none'
  }
})

// --- Tab switching ---
const tabText = document.getElementById('tab-text')
const tabSrt = document.getElementById('tab-srt')

function switchTab(tab) {
  activeTab = tab
  tabText.classList.toggle('active', tab === 'text')
  tabSrt.classList.toggle('active', tab === 'srt')
  document.getElementById('result-content').textContent = tab === 'srt' ? srtContent : textContent
}

tabText.addEventListener('click', () => switchTab('text'))
tabSrt.addEventListener('click', () => switchTab('srt'))

// --- File upload handling ---
const dropZone = document.getElementById('drop-zone')
const fileInput = document.getElementById('file-input')
let selectedFile = null

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

setupFileUpload(dropZone, fileInput, (file) => {
  selectedFile = file
  const mainText = dropZone.querySelector('.drop-zone-main')
  const subText = dropZone.querySelector('.drop-zone-sub')
  mainText.textContent = file.name
  subText.textContent = formatFileSize(file.size)
})

// --- Start button ---
const startBtn = document.getElementById('start-btn')
const urlInput = document.getElementById('url-input')

startBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim()

  if (!selectedFile && !url) {
    alert('請先選擇影片檔案或貼上影片網址。')
    return
  }

  let file = selectedFile

  if (!file && url) {
    try {
      startBtn.disabled = true
      startBtn.textContent = '下載影片中...'
      file = await fetchVideoFromURL(url)
      selectedFile = file
    } catch (err) {
      alert(err.message)
      return
    } finally {
      startBtn.disabled = false
      startBtn.textContent = '開始轉寫'
    }
  }

  // File size warning
  if (file.size > 500 * 1024 * 1024) {
    if (!confirm('檔案大於 500MB，可能導致瀏覽器記憶體不足。是否繼續？')) {
      return
    }
  }

  startBtn.disabled = true
  startBtn.textContent = '處理中...'
  document.getElementById('results-section').style.display = 'none'

  try {
    // 1. Extract audio
    const audioData = await extractAudio(file, showProgress)

    // 2. Transcribe
    const settings = getSettings()
    const chunks = await transcribe(audioData, {
      language: settings.language,
      model: settings.model,
      onProgress: showProgress,
    })

    // 3. Process subtitles
    showProgress('產生字幕...', 0.9)
    const segments = resegment(chunks, settings.interval)
    srtContent = generateSRT(segments)
    textContent = generateText(segments)

    // 4. Show results
    hideProgress()
    document.getElementById('results-section').style.display = 'block'
    switchTab(activeTab)

  } catch (err) {
    hideProgress()
    alert('處理失敗: ' + err.message)
    console.error(err)
  } finally {
    startBtn.disabled = false
    startBtn.textContent = '開始轉寫'
  }
})

// --- Copy to clipboard ---
document.getElementById('copy-btn').addEventListener('click', async () => {
  const content = activeTab === 'srt' ? srtContent : textContent
  await navigator.clipboard.writeText(content)
  const btn = document.getElementById('copy-btn')
  btn.textContent = '已複製！'
  setTimeout(() => { btn.textContent = '複製全部' }, 2000)
})

// --- Download helper ---
function download(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// --- Download SRT ---
document.getElementById('download-srt-btn').addEventListener('click', () => {
  const name = (selectedFile?.name || 'video').replace(/\.[^.]+$/, '') + '.srt'
  download(srtContent, name)
})

// --- Download TXT ---
document.getElementById('download-txt-btn').addEventListener('click', () => {
  const name = (selectedFile?.name || 'video').replace(/\.[^.]+$/, '') + '.txt'
  download(textContent, name)
})

// --- Reset / Restart ---
document.getElementById('reset-btn').addEventListener('click', () => {
  selectedFile = null
  srtContent = ''
  textContent = ''
  document.getElementById('results-section').style.display = 'none'
  document.getElementById('url-input').value = ''
  document.getElementById('drop-zone').querySelector('.drop-zone-main').textContent = '拖拽影片到此處，或點擊上傳'
  document.getElementById('drop-zone').querySelector('.drop-zone-sub').textContent = '支援 mp4, mov, webm, mkv'
})
