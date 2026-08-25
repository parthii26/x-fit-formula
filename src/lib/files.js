// ─── Client-side image processing for uploads ──────────────────────────────
// Compresses images to a bounded JPEG data URL so uploads survive
// localStorage quotas. Non-image files are rejected with a reason.

const MAX_DIM = 1000
const QUALITY = 0.72
const MAX_RAW_BYTES = 15 * 1024 * 1024 // refuse absurd inputs outright

export const MAX_ATTACHMENTS = 4

export function processUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Images only — JPG, PNG, WEBP or HEIC screenshots.'))
      return
    }
    if (file.size > MAX_RAW_BYTES) {
      reject(new Error('File exceeds 15 MB.'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY)
      resolve({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        dataUrl,
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image file.'))
    }
    img.src = url
  })
}
