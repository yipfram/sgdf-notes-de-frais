'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GroupCodeForm } from '@/components/GroupCodeForm'
import { useAuth } from '@/contexts/AuthContext'
import { InstallPrompt } from '@/components/InstallPrompt'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const { user, isLoaded, isSignedIn, activeBranch, activeBranchRole, isLoading, hasPendingRequest } = useAuth()

  // Rediriger les utilisateurs connectés vers leurs interfaces appropriées
  useEffect(() => {
    if (!isLoading && isSignedIn) {
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
  }, [isLoading, isSignedIn, activeBranch, activeBranchRole, hasPendingRequest, router])

  // Afficher un loader pendant le chargement
  if (isLoading || !isLoaded) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    )
  }

  if (isSignedIn && !activeBranch) {
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
            <p className="text-sm text-zinc-500">
              Veuillez contacter le trésorier de votre groupe pour obtenir l&apos;accès.
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Page d'accueil avec formulaire de code groupe pour les nouveaux utilisateurs
  return (
    <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
      <GroupCodeForm />
      <InstallPrompt />
    </main>
  )
}