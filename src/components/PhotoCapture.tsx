'use client'

import { useState, useRef, useEffect } from 'react'
import { CameraIcon, ArrowUpOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
    try { (drawSource as any).close() } catch { }
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
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const fileBrowseInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    if (isCameraOpen) {
      // Check if mediaDevices API is available (requires HTTPS on mobile browsers)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia non disponible')
        setErrorMsg("L'accès à la caméra nécessite une connexion sécurisée (HTTPS). Utilisez 'Importer fichier' à la place.")
        setIsCameraOpen(false)
        return
      }

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => {
          console.error('Erreur caméra:', err)
          setErrorMsg("Impossible d'accéder à la caméra. Vérifiez les permissions.")
          setIsCameraOpen(false)
        })
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isCameraOpen])

  const processFile = async (file: File | Blob) => {
    setErrorMsg(null)
    setCompressedInfo(null)

    let processedBlob: Blob
    try {
      processedBlob = await downscaleImage(file as File)
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
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleCameraCapture = () => {
    setIsCameraOpen(true)
  }

  const handleCaptureClick = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) {
        processFile(blob)
        setIsCameraOpen(false)
      }
    }, 'image/jpeg', 0.9)
  }

  const handleFileBrowse = () => {
    if (fileBrowseInputRef.current) {
      fileBrowseInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
        <CameraIcon className="w-5 h-5 text-zinc-700" aria-hidden="true" /> Justificatif de dépense
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCameraCapture}
          className="flex flex-col items-center p-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
        >
          <CameraIcon className="w-6 h-6 mb-2" aria-hidden="true" />
          <span className="text-sm font-medium">Prendre photo</span>
        </button>
        <button
          onClick={handleFileBrowse}
          className="flex flex-col items-center p-4 bg-white text-zinc-900 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition-colors"
        >
          <ArrowUpOnSquareIcon className="w-6 h-6 mb-2 text-zinc-700" aria-hidden="true" />
          <span className="text-sm font-medium">Importer fichier</span>
        </button>
      </div>

      <input
        ref={fileBrowseInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {compressedInfo && !errorMsg && (
        <p className="text-xs text-zinc-500">Optimisation: {compressedInfo}</p>
      )}

      {errorMsg && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {errorMsg}
        </div>
      )}

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 flex gap-6 items-center z-10">
            <button
              onClick={() => setIsCameraOpen(false)}
              className="p-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors border border-zinc-600"
              aria-label="Annuler"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <button
              onClick={handleCaptureClick}
              className="p-5 bg-white text-zinc-900 rounded-full hover:bg-gray-200 transition-colors shadow-lg ring-4 ring-zinc-500/30"
              aria-label="Prendre la photo"
            >
              <CameraIcon className="w-10 h-10" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  )
}