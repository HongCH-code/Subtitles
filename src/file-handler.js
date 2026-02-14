/**
 * Sets up drag-and-drop and click-to-upload on the drop zone.
 * Returns selected File via callback.
 */
export function setupFileUpload(dropZone, fileInput, onFileSelected) {
  // Click to open file picker
  dropZone.addEventListener('click', () => fileInput.click())
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
    if (e.dataTransfer.files[0]) onFileSelected(e.dataTransfer.files[0])
  })
}

/**
 * Fetches a video from a direct URL and returns it as a File object.
 * Validates the URL points to a video file.
 */
export async function fetchVideoFromURL(url) {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
  const hasVideoExt = videoExtensions.some((ext) => url.toLowerCase().includes(ext))
  if (!hasVideoExt) {
    throw new Error('URL 不像是影片直連結。請提供 .mp4, .mov, .webm 等影片的直連結。')
  }

  const response = await fetch(url)
  if (!response.ok) throw new Error(`無法下載影片: ${response.status}`)

  const blob = await response.blob()
  const filename = url.split('/').pop().split('?')[0] || 'video.mp4'
  return new File([blob], filename, { type: blob.type })
}
