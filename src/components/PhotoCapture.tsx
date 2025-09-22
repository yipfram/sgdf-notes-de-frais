'use client'

import { useState, useRef } from 'react'

// Helper pour convertir un fichier image en data URL base64
async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('FILE_READER_ERROR'))
    reader.readAsDataURL(file)
  })
}
import { createWorker } from 'tesseract.js'

interface PhotoCaptureProps {
  readonly onImageCapture: (imageUrl: string) => void
  readonly onAmountExtracted: (amount: string) => void
}

export function PhotoCapture({ onImageCapture, onAmountExtracted }: Readonly<PhotoCaptureProps>) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Convertir le fichier en data URL (base64) pour envoi serveur
    let dataUrl: string
    try {
      dataUrl = await fileToDataUrl(file)
    } catch (e) {
      console.error('Erreur conversion image en base64:', e)
      return
    }

    onImageCapture(dataUrl)

    // Perform OCR to extract amounts
    setIsProcessing(true)
    try {
      const worker = await createWorker('fra')
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // Extract potential amounts from the text
      const amountRegex = /(\d+[.,]\d{2})\s*€?/g
      const amounts = [...text.matchAll(amountRegex)]
      
      if (amounts.length > 0) {
        // Take the first amount found and normalize it
        const amount = amounts[0][1].replace(',', '.')
        onAmountExtracted(amount)
      }
    } catch (error) {
      console.error('OCR Error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        📸 Justificatif de dépense
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCameraCapture}
          className="flex flex-col items-center p-4 bg-sgdf-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isProcessing}
        >
          <span className="text-2xl mb-2">📷</span>
          <span className="text-sm font-medium">Prendre photo</span>
        </button>
        
        <button
          onClick={handleCameraCapture}
          className="flex flex-col items-center p-4 bg-sgdf-gold text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors"
          disabled={isProcessing}
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

      {isProcessing && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sgdf-blue mr-3"></div>
          <span className="text-sm text-gray-700">Analyse du document en cours...</span>
        </div>
      )}
    </div>
  )
}