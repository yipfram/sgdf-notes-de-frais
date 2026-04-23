'use client'

import { useState, useRef } from 'react'
import { CameraIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import {
  type ExpenseAttachment,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  isAllowedAttachmentMimeType
} from '@/lib/attachments'

// --- Utilitaires ---
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('FILE_READER_ERROR'))
    reader.readAsDataURL(blob)
  })
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await blobToDataUrl(blob)
  const commaIndex = dataUrl.indexOf(',')
  if (commaIndex === -1) throw new Error('FILE_DATA_URL_INVALID')
  return dataUrl.slice(commaIndex + 1)
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
  if (scale === 1) {
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

  const outputMime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg'
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('BLOB_CONVERSION_FAILED'))
          return
        }
        resolve(blob)
      },
      outputMime,
      outputMime === 'image/png' ? undefined : quality
    )
  })
}

interface PhotoCaptureProps {
  readonly onAttachmentsAdd: (attachments: ExpenseAttachment[]) => void
  readonly currentCount: number
}

export function PhotoCapture({ onAttachmentsAdd, currentCount }: Readonly<PhotoCaptureProps>) {
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [compressedInfo, setCompressedInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileBrowseInputRef = useRef<HTMLInputElement>(null)

  const processFiles = async (files: FileList, fromCamera = false) => {
    const selectedFiles = Array.from(files)
    if (selectedFiles.length === 0) return

    const nextErrors: string[] = []
    setCompressedInfo(null)

    if (currentCount >= MAX_ATTACHMENT_COUNT) {
      setErrorMessages([`Vous avez déjà atteint la limite de ${MAX_ATTACHMENT_COUNT} justificatifs.`])
      return
    }

    const availableSlots = MAX_ATTACHMENT_COUNT - currentCount
    const candidates = selectedFiles.slice(0, availableSlots)
    if (selectedFiles.length > availableSlots) {
      nextErrors.push(`Nombre maximum atteint: ${MAX_ATTACHMENT_COUNT} justificatifs.`)
    }

    const createdAttachments: ExpenseAttachment[] = []
    const compressionMessages: string[] = []

    for (const file of candidates) {
      if (!isAllowedAttachmentMimeType(file.type)) {
        nextErrors.push(`${file.name}: type non supporté (images JPG/PNG/WEBP ou PDF uniquement).`)
        continue
      }
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        nextErrors.push(`${file.name}: fichier trop volumineux (max ${(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB).`)
        continue
      }

      try {
        let processedBlob: Blob = file
        if (file.type.startsWith('image/')) {
          processedBlob = await downscaleImage(file)
          const originalKb = (file.size / 1024).toFixed(0)
          const newKb = (processedBlob.size / 1024).toFixed(0)
          if (originalKb !== newKb) {
            compressionMessages.push(`${file.name}: ${originalKb}KB → ${newKb}KB`)
          }
        }

        const mimeType = processedBlob.type || file.type
        const base64Data = await blobToBase64(processedBlob)
        createdAttachments.push({
          displayName: file.name,
          mimeType,
          base64Data,
          originalFileName: file.name,
          normalizedFileName: file.name
        })
      } catch (e) {
        console.error('Erreur traitement justificatif:', e)
        nextErrors.push(`${file.name}: erreur de lecture/traitement.`)
      }
    }

    if (createdAttachments.length > 0) {
      onAttachmentsAdd(createdAttachments)
    }

    if (fromCamera && createdAttachments.length === 0 && nextErrors.length === 0) {
      nextErrors.push('Impossible de traiter la photo capturée.')
    }

    if (compressionMessages.length > 0) {
      setCompressedInfo(compressionMessages.join(' | '))
    }

    setErrorMessages(nextErrors)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    try {
      await processFiles(files, event.target === fileInputRef.current)
    } finally {
      event.target.value = ''
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
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
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={fileBrowseInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {compressedInfo && errorMessages.length === 0 && (
        <p className="text-xs text-zinc-500">Optimisation: {compressedInfo}</p>
      )}

      {errorMessages.length > 0 && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errorMessages.map(msg => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
