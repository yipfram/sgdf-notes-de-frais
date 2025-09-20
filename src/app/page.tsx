'use client'

import { useState, useRef } from 'react'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [extractedAmount, setExtractedAmount] = useState<string>('')

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-sgdf-blue text-white p-6">
          <h1 className="text-2xl font-bold text-center">
            📝 Notes de Frais SGDF
          </h1>
          <p className="text-center text-blue-100 mt-2">
            La Guillotière
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <PhotoCapture 
            onImageCapture={setCapturedImage}
            onAmountExtracted={setExtractedAmount}
          />
          
          <ExpenseForm 
            capturedImage={capturedImage}
            extractedAmount={extractedAmount}
          />
        </div>
      </div>
    </main>
  )
}