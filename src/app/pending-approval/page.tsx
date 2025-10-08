'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

interface DemandeAcces {
  id: string
  statut: string
  createdAt: string
  groupName: string
  branchName: string
}

export default function PendingApprovalPage() {
  const { isSignedIn, isLoading } = useAuth()
  const router = useRouter()
  const [demandes, setDemandes] = useState<DemandeAcces[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/')
      return
    }

    if (isSignedIn) {
      loadDemandes()
    }
  }, [isSignedIn, isLoading, router])

  const loadDemandes = async () => {
    try {
      const response = await fetch('/api/access/request')
      if (response.ok) {
        const data = await response.json()
        setDemandes(data.demandes || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Afficher un loader pendant le chargement
  if (isLoading || loading) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    )
  }

  const pendingDemandes = demandes.filter(d => d.statut === 'en_attente')

  // Si aucune demande en attente, rediriger vers l'accueil
  if (pendingDemandes.length === 0) {
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
              Aucune demande en attente.
            </p>
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

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white p-6 border-b border-zinc-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={28} className="rounded-sm" />
                <h1 className="text-2xl font-semibold text-zinc-900">Notes de frais</h1>
              </div>
              <p className="text-zinc-500 mt-2">En attente de validation</p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-zinc-900 text-center mb-4">
            Votre demande est en cours de validation
          </h2>

          <p className="text-zinc-600 text-center mb-6">
            Le trésorier de votre groupe examine votre demande d&apos;accès. Vous recevrez un email dès qu&apos;une décision sera prise.
          </p>

          <div className="space-y-4 mb-6">
            {pendingDemandes.map((demande) => (
              <div key={demande.id} className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-zinc-900">{demande.groupName}</p>
                    <p className="text-sm text-zinc-600">{demande.branchName}</p>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    En attente
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Demande envoyée le {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-lg mb-6">
            <p className="font-medium mb-1">Prochaines étapes :</p>
            <ul className="text-sm space-y-1">
              <li>• Le trésorier examine votre demande</li>
              <li>• Vous recevrez un email de confirmation</li>
              <li>• Une fois approuvé, vous pourrez accéder à l&apos;espace de votre groupe</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="text-zinc-600 hover:text-zinc-900 underline text-sm"
            >
              Actualiser le statut
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}