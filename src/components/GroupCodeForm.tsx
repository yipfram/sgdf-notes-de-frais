'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export function GroupCodeForm() {
  const { user } = useAuth()
  const [groupCode, setGroupCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour rejoindre un groupe')
      }

      const response = await fetch('/api/access/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la demande d\'accès')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
          <div className="flex items-center justify-center gap-2">
            <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
            <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Demande envoyée !</h2>
          <p className="text-zinc-600 mb-4">
            Votre demande d&apos;accès au groupe a été envoyée au trésorier.
          </p>
          <p className="text-sm text-zinc-500">
            Vous recevrez un email à <strong>{userEmail}</strong> dès qu&apos;elle sera approuvée.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
      <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
        <div className="flex items-center justify-center gap-2">
          <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
          <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
        </div>
        <p className="text-center text-zinc-500 mt-2">
          Rejoignez votre groupe SGDF
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-lg mb-4">
          <p className="font-medium mb-1">📧 Email de connexion :</p>
          <p className="text-sm">{userEmail}</p>
        </div>

        <div>
          <label htmlFor="groupCode" className="block text-sm font-medium text-zinc-700 mb-1">
            Code groupe
          </label>
          <input
            type="text"
            id="groupCode"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
            placeholder="Ex: LAGUILLOTIERE"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            Entrez le code fourni par le trésorier de votre groupe
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Rejoindre mon groupe'}
        </button>
      </form>
    </div>
  )
}
