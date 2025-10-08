'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GroupCodeForm } from '@/components/GroupCodeForm'
import { useAuth } from '@/contexts/AuthContext'
import { InstallPrompt } from '@/components/InstallPrompt'
import Image from 'next/image'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded, isSignedIn, activeBranch, activeBranchRole, isLoading, hasPendingRequest } = useAuth()
  const [isProcessingQRCode, setIsProcessingQRCode] = useState(false)
  const [qrCodeError, setQrCodeError] = useState<string | null>(null)

  // Récupérer le code groupe depuis l'URL (QR code scan)
  const groupCodeFromURL = searchParams.get('group')

  // Traiter automatiquement le QR code scan
  useEffect(() => {
    const processQRCodeScan = async () => {
      // Conditions pour traiter le QR code:
      // 1. Clerk est chargé et utilisateur est connecté
      // 2. Il y a un code groupe dans l'URL
      // 3. Pas de branche active
      // 4. Pas de demande en attente
      // 5. Pas déjà en train de traiter
      // 6. Auth context a fini de charger
      if (isLoaded && isSignedIn && user && groupCodeFromURL && !activeBranch && !hasPendingRequest && !isProcessingQRCode && !isLoading) {
        setIsProcessingQRCode(true)
        setQrCodeError(null)

        try {
          console.log('QR Code scanné - création automatique de la demande:', groupCodeFromURL)

          const response = await fetch('/api/access/request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              groupCode: groupCodeFromURL,
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Erreur lors de la demande d\'accès')
          }

          console.log('Demande créée avec succès, redirection vers pending-approval')
          
          // Recharger les données utilisateur pour mettre à jour hasPendingRequest
          window.location.href = '/pending-approval'
        } catch (err) {
          console.error('Erreur lors du traitement du QR code:', err)
          setQrCodeError(err instanceof Error ? err.message : 'Une erreur est survenue')
          setIsProcessingQRCode(false)
        }
      }
    }

    processQRCodeScan()
  }, [isLoaded, isSignedIn, user, groupCodeFromURL, activeBranch, hasPendingRequest, isProcessingQRCode, isLoading])

  // Rediriger les utilisateurs connectés vers leurs interfaces appropriées
  useEffect(() => {
    if (!isLoading && isSignedIn && !groupCodeFromURL) {
      // Si l'utilisateur a des demandes en attente, rediriger vers la page d'attente
      if (hasPendingRequest) {
        router.push('/pending-approval')
        return
      }

      // Si l'utilisateur a une branche active, rediriger selon son rôle
      if (activeBranch) {
        if (activeBranchRole === 'admin') {
          router.push('/admin/groupe')
        } else {
          router.push('/admin/ma-branche')
        }
      }
    }
  }, [isLoading, isSignedIn, activeBranch, activeBranchRole, hasPendingRequest, router, groupCodeFromURL])

  // Afficher un loader pendant le chargement
  if (isLoading || !isLoaded || isProcessingQRCode) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-zinc-600">
              {isProcessingQRCode ? 'Création de votre demande d\'accès...' : 'Chargement…'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Afficher une erreur si le QR code a échoué
  if (qrCodeError && groupCodeFromURL) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Erreur</h2>
            <p className="text-zinc-600 mb-4">{qrCodeError}</p>
            <button
              onClick={() => router.push('/')}
              className="text-zinc-600 hover:text-zinc-900 underline"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (isSignedIn && !activeBranch && !hasPendingRequest) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <p className="text-zinc-600 mb-4">
              Votre compte est en cours de configuration.
            </p>
            <p className="text-sm text-zinc-500 mb-2">
              Veuillez contacter le trésorier de votre groupe pour obtenir l&apos;accès.
            </p>
            <p className="text-xs text-zinc-400">
              Si vous avez scanné un QR code, assurez-vous d&apos;avoir utilisé la même adresse email lors de votre inscription.
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Page d'accueil avec formulaire de code groupe pour les nouveaux utilisateurs
  return (
    <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
      {isSignedIn ? (
        <GroupCodeForm />
      ) : (
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              {groupCodeFromURL ? 'Connectez-vous pour continuer' : 'Bienvenue !'}
            </h2>
            <p className="text-zinc-600 mb-6">
              {groupCodeFromURL 
                ? 'Vous avez scanné un QR code d\'invitation. Connectez-vous pour rejoindre le groupe.'
                : 'Pour rejoindre votre groupe SGDF, veuillez d\'abord vous connecter ou créer un compte.'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const signUpUrl = groupCodeFromURL 
                    ? '/sign-up?redirect_url=' + encodeURIComponent('/?group=' + groupCodeFromURL)
                    : '/sign-up'
                  router.push(signUpUrl)
                }}
                className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
              >
                Créer un compte
              </button>
              <button
                onClick={() => {
                  const signInUrl = groupCodeFromURL 
                    ? '/sign-in?redirect_url=' + encodeURIComponent('/?group=' + groupCodeFromURL)
                    : '/sign-in'
                  router.push(signInUrl)
                }}
                className="w-full bg-white text-zinc-900 py-3 px-6 rounded-lg font-semibold border border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
              >
                Se connecter
              </button>
            </div>
            {groupCodeFromURL && (
              <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg">
                <p className="font-medium">📱 Code groupe détecté</p>
                <p className="text-xs mt-1">Vous rejoindrez automatiquement le groupe après connexion</p>
              </div>
            )}
          </div>
        </div>
      )}
      <InstallPrompt />
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}