import './style.css'
import { setupFileUpload, fetchVideoFromURL } from './file-handler.js'

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

tabText.addEventListener('click', () => {
  tabText.classList.add('active')
  tabSrt.classList.remove('active')
})

tabSrt.addEventListener('click', () => {
  tabSrt.classList.add('active')
  tabText.classList.remove('active')
})

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

  // TODO: Task 7 will add the actual processing pipeline here
  console.log('Selected file:', file.name, 'Size:', formatFileSize(file.size), 'Type:', file.type)
})
