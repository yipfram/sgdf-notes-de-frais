'use client'

import { useState } from 'react'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [extractedAmount, setExtractedAmount] = useState<string>('')

  // Afficher un loader pendant le chargement de l'état d'authentification
  if (!isLoaded) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </main>
    )
  }

  // Afficher la page de connexion si l'utilisateur n'est pas connecté
  if (!isSignedIn) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-sgdf-blue text-white p-6">
            <h1 className="text-2xl font-bold text-center">
              📝 Notes de Frais SGDF
            </h1>
            <p className="text-center text-blue-100 mt-2">
              La Guillotière
            </p>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Connectez-vous pour accéder à l'application de gestion des notes de frais.
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-sgdf-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Se connecter
              </button>
            </SignInButton>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-sgdf-blue text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                📝 Notes de Frais SGDF
              </h1>
              <p className="text-blue-100 mt-2">
                La Guillotière
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-100">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <PhotoCapture 
            onImageCapture={setCapturedImage}
            onAmountExtracted={setExtractedAmount}
          />
          
          <ExpenseForm 
            capturedImage={capturedImage}
            extractedAmount={extractedAmount}
            userEmail={user?.emailAddresses[0]?.emailAddress || ''}
          />
        </div>
      </div>
    </main>
  )
}