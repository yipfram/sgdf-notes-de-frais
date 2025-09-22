'use client'

import { useState, useRef } from 'react'

// --- Utilitaires ---
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('FILE_READER_ERROR'))
    reader.readAsDataURL(blob)
  })
}

// Fallback createImageBitmap pour navigateurs anciens
async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('IMAGE_ELEMENT_LOAD_FAILED'))
    }
    img.src = url
  })
}

async function downscaleImage(file: File, maxDim = 1600, quality = 0.75): Promise<Blob> {
  let width: number
  let height: number
  let drawSource: CanvasImageSource

  // Détection prudente de createImageBitmap (certains navigateurs anciens)
  const canUseCreateImageBitmap = typeof window !== 'undefined' && 'createImageBitmap' in window
  const bitmapOrImage = canUseCreateImageBitmap ? await createImageBitmap(file).catch(() => null) : null
  if (bitmapOrImage) {
    width = (bitmapOrImage as any).width
    height = (bitmapOrImage as any).height
    drawSource = bitmapOrImage
  } else {
    const imgEl = await loadImageElement(file)
    width = imgEl.width
    height = imgEl.height
    drawSource = imgEl
  }

  const largest = Math.max(width, height)
  const scale = Math.min(1, maxDim / largest)
  if (scale === 1 && file.type === 'image/jpeg') {
    // Pas besoin de redimensionner
    return file
  }

  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CANVAS_CONTEXT_FAILED')
  ctx.drawImage(drawSource, 0, 0, targetWidth, targetHeight)
  if ('close' in drawSource && typeof (drawSource as any).close === 'function') {
    try { (drawSource as any).close() } catch {}
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('BLOB_CONVERSION_FAILED'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      quality
    )
  })
}

interface PhotoCaptureProps {
  readonly onImageCapture: (imageUrl: string) => void
}

export function PhotoCapture({ onImageCapture }: Readonly<PhotoCaptureProps>) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [compressedInfo, setCompressedInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Plus d'OCR: suppression du worker pour alléger la mémoire

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    setCompressedInfo(null)

    let processedBlob: Blob
    try {
      processedBlob = await downscaleImage(file)
      const originalKb = (file.size / 1024).toFixed(0)
      const newKb = (processedBlob.size / 1024).toFixed(0)
      setCompressedInfo(`${originalKb}KB → ${newKb}KB`)
    } catch (e) {
      console.error('Erreur compression image:', e)
      setErrorMsg("Impossible d'optimiser la photo. Essayez une image plus petite (moins de 8MP).")
      return
    }

    try {
      const dataUrl = await blobToDataUrl(processedBlob)
      onImageCapture(dataUrl)
    } catch (e) {
      console.error('Erreur conversion image en base64:', e)
      setErrorMsg('Erreur de lecture du fichier image.')
      return
    }

    // OCR désactivé – aucune extraction automatique
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">📸 Justificatif de dépense</h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCameraCapture}
          className="flex flex-col items-center p-4 bg-sgdf-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-2xl mb-2">📷</span>
          <span className="text-sm font-medium">Prendre photo</span>
        </button>
        <button
          onClick={handleCameraCapture}
          className="flex flex-col items-center p-4 bg-sgdf-gold text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <span className="text-2xl mb-2">📁</span>
          <span className="text-sm font-medium">Importer fichier</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {compressedInfo && !errorMsg && (
        <p className="text-xs text-gray-500">Optimisation: {compressedInfo}</p>
      )}

      {errorMsg && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* OCR supprimé : aucun état de traitement */}
    </div>
  )
}