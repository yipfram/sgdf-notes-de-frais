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
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        // Recharger les demandes
        loadGroupData()
      } else {
        console.error('Erreur lors de l\'approbation de la demande')
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/access/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        // Recharger les demandes
        loadGroupData()
      } else {
        console.error('Erreur lors du refus de la demande')
      }
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error)
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
                <p className="text-sm text-zinc-500">Code d'accès</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900">{groupInfo.slug.toUpperCase()}</p>
                  <button
                    onClick={copyGroupLink}
                    className={`text-sm ${copiedLink ? 'text-green-600' : 'text-zinc-500 hover:text-zinc-700'}`}
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
                    className="text-zinc-500 hover:text-zinc-700 text-sm"
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
                          <p className="text-sm text-zinc-500 mt-1">"{request.message}"</p>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition-colors"
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
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleBranchUpdate(branch.id, branchName)
                            }
                          }}
                          className="px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-400"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBranch(branch.id)
                            setBranchName(branch.name)
                          }}
                          className="text-zinc-900 hover:text-zinc-700 font-medium"
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
                        <button className="text-zinc-500 hover:text-zinc-700 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="text-zinc-500 hover:text-zinc-700 text-sm">
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
            <button className="bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors">
              Ajouter une branche
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && groupInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm max-w-md w-full">
            <div className="p-6 border-b border-zinc-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-zinc-900">QR Code d'accès</h3>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="text-zinc-500 hover:text-zinc-700"
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
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code d'accès"
                    className="w-48 h-48"
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
                  className="flex-1 bg-zinc-900 text-white py-2 px-4 rounded-lg text-sm hover:bg-zinc-800 transition-colors"
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
                  className="flex-1 border border-zinc-300 text-zinc-700 py-2 px-4 rounded-lg text-sm hover:bg-zinc-50 transition-colors"
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