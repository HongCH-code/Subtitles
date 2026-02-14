import './style.css'

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

// --- Drop zone click to trigger file input ---
const dropZone = document.getElementById('drop-zone')
const fileInput = document.getElementById('file-input')

dropZone.addEventListener('click', () => {
  fileInput.click()
})

// --- Drop zone drag & drop visual feedback ---
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('dragover')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('dragover')
})
