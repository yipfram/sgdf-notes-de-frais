'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function InitDatabasePage() {
  const { isSignedIn, isLoaded } = useUser()
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'initialisation')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsInitializing(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Non autorisé</h1>
          <p>Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={32} height={32} className="rounded-sm" />
              <h1 className="text-2xl font-semibold">Initialisation Base de Données</h1>
            </div>
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              ← Retour
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h2 className="font-semibold text-amber-900 mb-2">⚠️ Action importante</h2>
              <p className="text-amber-800 text-sm">
                Cette action va initialiser la base de données multi-groupes pour SGDF Notes de Frais.
                Elle créera le groupe &ldquo;La Guillotière&rdquo; avec toutes les branches SGDF et vous donnera
                les accès administrateur sur toutes les branches.
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleInitialize}
                disabled={isInitializing}
                className="bg-zinc-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isInitializing ? 'Initialisation...' : 'Initialiser la base de données'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">❌ Erreur</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Succès</h3>
                <div className="text-green-800 text-sm space-y-1">
                  <p>{result.message}</p>
                  {result.data && (
                    <div className="mt-2 pl-4 border-l-2 border-green-300">
                      <p>Groupe ID: {result.data.groupId}</p>
                      <p>Nombre de branches créées: {result.data.branchCount}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Link
                    href="/"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Aller à l&apos;application
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}