'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import QRCode from 'qrcode'

interface Branch {
  id: string
  name: string
  isActive: boolean
  chefsCount: number
}

interface PendingRequest {
  id: string
  email: string
  groupName: string
  branchName: string
  createdAt: string
  message?: string
}

interface GroupInfo {
  id: string
  name: string
  slug: string
  adminUserId: string
  isActive: boolean
}

export default function GroupeAdminPage() {
  const { user, isSignedIn, activeBranch, activeBranchRole, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBranch, setEditingBranch] = useState<string | null>(null)
  const [branchName, setBranchName] = useState('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [newBranchName, setNewBranchName] = useState('')
  const [isAddingBranch, setIsAddingBranch] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isSignedIn || !activeBranch || !isAdmin())) {
      router.push('/')
      return
    }

    if (activeBranch && isAdmin()) {
      loadGroupData()
    }
  }, [isSignedIn, activeBranch, isAdmin, isLoading, router])

  const loadGroupData = async () => {
    try {
      // Charger les informations du groupe
      const groupResponse = await fetch('/api/admin/group')
      if (groupResponse.ok) {
        const data = await groupResponse.json()
        setGroupInfo(data)
      }

      // Charger la liste des branches
      const branchesResponse = await fetch('/api/admin/branches')
      if (branchesResponse.ok) {
        const data = await branchesResponse.json()
        setBranches(data.branches || [])
      }

      // Charger les demandes en attente
      const requestsResponse = await fetch('/api/admin/pending-requests')
      if (requestsResponse.ok) {
        const data = await requestsResponse.json()
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du groupe:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/access/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demandeId: requestId }),
      })

      if (response.ok) {
        // Recharger les demandes
        loadGroupData()
      } else {
        const data = await response.json()
        console.error('Erreur lors de l\'approbation de la demande:', data.error)
        alert(`Erreur: ${data.error || 'Impossible d\'approuver la demande'}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error)
      alert('Erreur de connexion lors de l\'approbation de la demande')
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/access/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ demandeId: requestId }),
      })

      if (response.ok) {
        // Recharger les demandes
        loadGroupData()
      } else {
        const data = await response.json()
        console.error('Erreur lors du refus de la demande:', data.error)
        alert(`Erreur: ${data.error || 'Impossible de refuser la demande'}`)
      }
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error)
      alert('Erreur de connexion lors du refus de la demande')
    }
  }

  const handleBranchUpdate = async (branchId: string, newName: string) => {
    try {
      const response = await fetch(`/api/admin/branches/${branchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        setEditingBranch(null)
        setBranchName('')
        loadGroupData()
      } else {
        console.error('Erreur lors de la mise à jour de la branche')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la branche:', error)
    }
  }

  const copyGroupLink = async () => {
    if (groupInfo) {
      const link = `${window.location.origin}?group=${groupInfo.slug}`
      try {
        await navigator.clipboard.writeText(link)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } catch (err) {
        console.error('Erreur lors de la copie du lien:', err)
      }
    }
  }

  const generateQRCode = async () => {
    if (groupInfo) {
      try {
        const url = `${window.location.origin}?group=${groupInfo.slug}`
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrDataUrl)
        setShowQRCode(true)
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error)
      }
    }
  }

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      alert('Veuillez entrer un nom de branche')
      return
    }

    setIsAddingBranch(true)
    try {
      const response = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBranchName.trim() }),
      })

      if (response.ok) {
        setShowAddBranch(false)
        setNewBranchName('')
        loadGroupData()
      } else {
        const data = await response.json()
        alert(`Erreur: ${data.error || 'Impossible de créer la branche'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la branche:', error)
      alert('Erreur de connexion lors de la création de la branche')
    } finally {
      setIsAddingBranch(false)
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

  if (!isAdmin() || !groupInfo) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Accès non autorisé</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={28} className="rounded-sm" />
                  <h1 className="text-2xl font-semibold text-zinc-900">Administration du groupe</h1>
                </div>
                <p className="text-zinc-500 mt-1">Gestion de {groupInfo.name}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du groupe */}
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Informations du groupe</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-zinc-500">Nom du groupe</p>
                <p className="font-medium text-zinc-900">{groupInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Code d&apos;accès</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900">{groupInfo.slug.toUpperCase()}</p>
                  <button
                    onClick={copyGroupLink}
                    className={`text-sm cursor-pointer ${copiedLink ? 'text-green-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                    title={copiedLink ? 'Lien copié!' : 'Copier le lien'}
                  >
                    {copiedLink ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={generateQRCode}
                    className="text-zinc-500 hover:text-zinc-700 text-sm cursor-pointer"
                    title="Générer un QR code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File d'attente des demandes */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Demandes en attente ({pendingRequests.length})
            </h2>

            {pendingRequests.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Aucune demande en attente</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-zinc-900">{request.email}</p>
                        <p className="text-sm text-zinc-600">{request.branchName} • {request.groupName}</p>
                        {request.message && (
                          <p className="text-sm text-zinc-500 mt-1">&quot;{request.message}&quot;</p>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Liste des branches */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Branches du groupe</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-700">Nom</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-700">Statut</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-700">Chefs</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-zinc-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-3 px-3">
                      {editingBranch === branch.id ? (
                        <input
                          type="text"
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          onBlur={() => handleBranchUpdate(branch.id, branchName)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleBranchUpdate(branch.id, branchName)
                            }
                          }}
                          className="px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white text-zinc-900"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBranch(branch.id)
                            setBranchName(branch.name)
                          }}
                          className="text-zinc-900 hover:text-zinc-700 font-medium cursor-pointer"
                        >
                          {branch.name}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        branch.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-zinc-600">
                      {branch.chefsCount}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <button 
                          className="text-zinc-500 hover:text-zinc-700 text-sm cursor-pointer"
                          title="Modifier"
                          onClick={() => {
                            setEditingBranch(branch.id)
                            setBranchName(branch.name)
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200">
            <button 
              className="bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => setShowAddBranch(true)}
            >
              Ajouter une branche
            </button>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm max-w-md w-full">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900">Ajouter une branche</h3>
                <button
                  onClick={() => {
                    setShowAddBranch(false)
                    setNewBranchName('')
                  }}
                  className="text-zinc-500 hover:text-zinc-700 cursor-pointer"
                  disabled={isAddingBranch}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="branchName" className="block text-sm font-medium text-zinc-700 mb-2">
                  Nom de la branche
                </label>
                <input
                  id="branchName"
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAddingBranch) {
                      handleAddBranch()
                    }
                  }}
                  placeholder="Ex: Louveteaux, Scouts, Pionniers..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white text-zinc-900"
                  autoFocus
                  disabled={isAddingBranch}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddBranch(false)
                    setNewBranchName('')
                  }}
                  className="flex-1 border border-zinc-300 text-zinc-700 py-2 px-4 rounded-lg text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                  disabled={isAddingBranch}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddBranch}
                  className="flex-1 bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAddingBranch || !newBranchName.trim()}
                >
                  {isAddingBranch ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création...
                    </span>
                  ) : (
                    'Créer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && groupInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm max-w-md w-full">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900">QR Code d&apos;accès</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-zinc-500 hover:text-zinc-700 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-zinc-600 mb-2">
                  Partagez ce QR code avec les chefs de votre groupe
                </p>
                <p className="text-xs text-zinc-500 font-mono bg-zinc-100 p-2 rounded">
                  {groupInfo.slug.toUpperCase()}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-white border-2 border-zinc-200 rounded-lg p-4 mb-4 flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR Code d&apos;accès"
                    width={192}
                    height={192}
                    className="w-48 h-48"
                    unoptimized
                  />
                ) : (
                  <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center">
                    <div className="text-zinc-400 text-sm">Génération du QR code...</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyGroupLink}
                  className="flex-1 bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Copier le lien
                </button>
                <button
                  onClick={() => {
                    if (qrCodeDataUrl) {
                      const a = document.createElement('a')
                      a.href = qrCodeDataUrl
                      a.download = `qr-code-${groupInfo.slug}.png`
                      a.click()
                    }
                  }}
                  className="flex-1 border border-zinc-300 text-zinc-700 py-2 px-4 rounded-lg text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}