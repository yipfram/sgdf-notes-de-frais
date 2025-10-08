'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'
import { useOnlineStatus } from '@/lib/useOnlineStatus'

interface BranchInfo {
  id: string
  name: string
  groupName: string
  groupCode: string
}

interface Chef {
  id: string
  email: string
  role: string
  grantedAt: string
}

interface Proposition {
  id: string
  type: 'email_unite' | 'nom_interne'
  value: string
  statut: 'propose' | 'valide' | 'refuse'
  createdAt: string
}

export default function MaBranchePage() {
  const { user, isSignedIn, activeBranch, isLoading } = useAuth()
  const router = useRouter()
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null)
  const [chefs, setChefs] = useState<Chef[]>([])
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!isLoading && (!isSignedIn || !activeBranch)) {
      router.push('/')
      return
    }

    if (activeBranch) {
      loadBranchData()
    }
  }, [isSignedIn, activeBranch, isLoading, router])

  const loadBranchData = async () => {
    if (!activeBranch) return

    try {
      // Charger les informations de la branche
      const branchResponse = await fetch(`/api/branches/${activeBranch.id}`)
      if (branchResponse.ok) {
        const data = await branchResponse.json()
        setBranchInfo(data)
      }

      // Charger la liste des chefs
      const chefsResponse = await fetch(`/api/branches/${activeBranch.id}/chefs`)
      if (chefsResponse.ok) {
        const data = await chefsResponse.json()
        setChefs(data.chefs || [])
      }

      // Charger les propositions
      const propsResponse = await fetch(`/api/branches/${activeBranch.id}/propositions`)
      if (propsResponse.ok) {
        const data = await propsResponse.json()
        setPropositions(data.propositions || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de la branche:', error)
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

      loadBranchData()
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Branche non trouvée</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={28} className="rounded-sm" />
                  <h1 className="text-2xl font-semibold text-zinc-900">Ma branche</h1>
                </div>
                <p className="text-zinc-500 mt-1">Gestion de votre espace</p>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations de la branche */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Informations de la branche</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-500">Branche</p>
                <p className="font-medium text-zinc-900">{branchInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Groupe</p>
                <p className="font-medium text-zinc-900">{branchInfo.groupName}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Code du groupe</p>
                <p className="font-medium text-zinc-900">{branchInfo.groupCode}</p>
              </div>
            </div>
          </div>

          {/* Liste des chefs */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Chefs de la branche</h2>
            <div className="space-y-2">
              {chefs.length === 0 ? (
                <p className="text-zinc-500 text-sm">Aucun autre chef dans cette branche</p>
              ) : (
                chefs.map((chef) => (
                  <div key={chef.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                    <div>
                      <p className="font-medium text-zinc-900">{chef.email}</p>
                      <p className="text-xs text-zinc-500 capitalize">{chef.role}</p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(chef.grantedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Propositions */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Propositions en cours</h2>

          {propositions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 mb-4">Aucune proposition en cours</p>
              <button className="bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors">
                Faire une proposition
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {propositions.map((prop) => (
                <div key={prop.id} className="border border-zinc-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-zinc-900">
                        {prop.type === 'email_unite' ? 'Email d\'unité' : 'Nom interne'}
                      </p>
                      <p className="text-zinc-600">{prop.value}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prop.statut === 'propose'
                        ? 'bg-amber-100 text-amber-800'
                        : prop.statut === 'valide'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prop.statut === 'propose' ? 'En attente' :
                       prop.statut === 'valide' ? 'Validé' : 'Refusé'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Proposé le {new Date(prop.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
              <button className="w-full bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors">
                Faire une nouvelle proposition
              </button>
            </div>
          )}
        </div>

        {/* Formulaire de note de frais */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <h2 className="text-lg font-semibold text-zinc-900">Envoyer une note de frais</h2>
          </div>

          {!isOnline && (
            <div className="bg-amber-50 border-t border-b border-amber-200 text-amber-800 text-center text-sm py-2">
              Hors ligne - certaines fonctionnalités sont limitées
            </div>
          )}

          <div className="p-6 space-y-6">
            <PhotoCapture onImageCapture={setCapturedImage} />

            <ExpenseForm
              capturedImage={capturedImage}
              userEmail={user?.emailAddresses[0]?.emailAddress || ''}
              initialBranch={activeBranch.name}
              onCreateNewNote={() => {
                setCapturedImage(null)
              }}
              onPersistBranch={async () => {
                // La branche est déjà gérée via le contexte
              }}
              onBranchChange={() => {
                // Le changement de branche est géré via le contexte
              }}
              isOnline={isOnline}
            />
          </div>
        </div>
      </div>
    </main>
  )
}