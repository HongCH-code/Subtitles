/**
 * Sets up drag-and-drop and click-to-upload on the drop zone.
 * Returns selected File via callback.
 */
export function setupFileUpload(dropZone, fileInput, onFileSelected) {
  const allowedExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
  const allowedMimeTypes = [
    'video/mp4', 'video/quicktime', 'video/webm',
    'video/x-matroska', 'video/avi', 'video/x-msvideo',
  ]

  function isValidVideoFile(file) {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    return allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.type)
  }

  // Click to open file picker
  dropZone.addEventListener('click', () => fileInput.click())

  // Keyboard accessibility: Enter/Space opens file picker
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInput.click()
    }
  })

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) onFileSelected(e.target.files[0])
  })

  // Drag and drop
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
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!isValidVideoFile(file)) {
      alert('不支援的檔案格式。請上傳 mp4, mov, webm, mkv 格式的影片。')
      return
    }
    onFileSelected(file)
  })
}

/**
 * Fetches a video from a direct URL and returns it as a File object.
 * Validates the URL points to a video file.
 */
export async function fetchVideoFromURL(url) {
  let parsedUrl
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new Error('無效的 URL 格式。')
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('僅支援 HTTP/HTTPS 網址。')
  }

  const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
  const pathname = parsedUrl.pathname.toLowerCase()
  const hasVideoExt = videoExtensions.some((ext) => pathname.endsWith(ext))
  if (!hasVideoExt) {
    throw new Error('URL 不像是影片直連結。請提供 .mp4, .mov, .webm 等影片的直連結。')
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`無法下載影片: ${response.status}`)

  const blob = await response.blob()
  const filename = parsedUrl.pathname.split('/').pop() || 'video.mp4'
  return new File([blob], filename, { type: blob.type })
}
