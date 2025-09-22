'use client'

import { useState } from 'react'
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'
import { getBranchColor } from '@/lib/branches'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const initialBranch = (user?.publicMetadata?.branch as string) || ''
  const [activeBranch, setActiveBranch] = useState<string>(initialBranch)
  const branchColor = getBranchColor(activeBranch)

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
              Connectez-vous pour accéder à l&apos;application de gestion des notes de frais.
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
    <main
      className="min-h-screen p-4 transition-colors"
      style={{
        backgroundColor: activeBranch ? branchColor : undefined
      }}
    >
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur rounded-lg shadow-xl overflow-hidden border border-white/40">
        <div className="text-white p-6" style={{ backgroundColor: branchColor }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                📝 Notes de Frais SGDF
              </h1>
              <p className="text-white/80 mt-2">
                La Guillotière
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white/80">
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
          />

          <ExpenseForm
            capturedImage={capturedImage}
            extractedAmount={''}
            userEmail={user?.emailAddresses[0]?.emailAddress || ''}
            initialBranch={initialBranch}
            onCreateNewNote={() => {
              setCapturedImage(null)
            }}
            onPersistBranch={async (branch: string) => {
              try {
                const res = await fetch('/api/update-branch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ branch })
                })
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}))
                  throw new Error(data.error || 'Erreur API')
                }
              } catch (e) {
                console.error('Erreur de sauvegarde de la branche dans Clerk', e)
              }
            }}
            onBranchChange={(b) => setActiveBranch(b)}
          />
        </div>
      </div>
    </main>
  )
}