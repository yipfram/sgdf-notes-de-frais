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
async function loadImageElement(file: Blob): Promise<HTMLImageElement> {
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

async function downscaleImage(file: Blob, maxDim = 1600, quality = 0.75): Promise<Blob> {
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileBrowseInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Nettoyage du stream si le composant est démonté
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOpen(true)
    } catch (err) {
      console.error('Erreur accès caméra:', err)
      setErrorMsg("Impossible d'accéder à la caméra. Veuillez vérifier les permissions ou utiliser l'import de fichier.")
      // Fallback au sélecteur de fichier standard si la caméra échoue
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Définir la taille du canvas pour correspondre à la vidéo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dessiner l'image actuelle de la vidéo sur le canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convertir en blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setErrorMsg("Erreur lors de la capture.")
        return
      }

      stopCamera()
      await processImage(blob)
    }, 'image/jpeg', 0.95)
  }

  const processImage = async (blob: Blob) => {
    setErrorMsg(null)
    setCompressedInfo(null)

    let processedBlob: Blob
    try {
      processedBlob = await downscaleImage(blob)
      const originalKb = (blob.size / 1024).toFixed(0)
      const newKb = (processedBlob.size / 1024).toFixed(0)
      setCompressedInfo(`${originalKb}KB → ${newKb}KB`)
    } catch (e) {
      console.error('Erreur compression image:', e)
      setErrorMsg("Impossible d'optimiser la photo.")
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
    await processImage(file)
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

      {isCameraOpen ? (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4] md:aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-8">
            <button
              type="button"
              onClick={stopCamera}
              className="p-3 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="p-1 rounded-full border-4 border-white/50 hover:border-white transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>

            <div className="w-12" /> {/* Spacer pour équilibrer */}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="flex flex-col items-center p-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
          >
            <CameraIcon className="w-6 h-6 mb-2" aria-hidden="true" />
            <span className="text-sm font-medium">Prendre photo</span>
          </button>
          <button
            type="button"
            onClick={handleFileBrowse}
            className="flex flex-col items-center p-4 bg-white text-zinc-900 rounded-lg border border-zinc-200 hover:bg-zinc-100 transition-colors"
          >
            <ArrowUpOnSquareIcon className="w-6 h-6 mb-2 text-zinc-700" aria-hidden="true" />
            <span className="text-sm font-medium">Importer fichier</span>
          </button>
        </div>
      )}

      {/* Inputs cachés pour le fallback et l'import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={fileBrowseInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {compressedInfo && !errorMsg && !isCameraOpen && (
        <p className="text-xs text-zinc-500">Optimisation: {compressedInfo}</p>
      )}

      {errorMsg && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {errorMsg}
        </div>
      )}
    </div>
  )
}