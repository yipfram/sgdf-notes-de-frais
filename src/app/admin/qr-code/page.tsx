'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

export default function QRCodePage() {
  const { isSignedIn, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const [groupSlug, setGroupSlug] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/')
      return
    }

    if (!isLoading && isSignedIn && !isAdmin()) {
      router.push('/admin/ma-branche')
      return
    }

    if (isSignedIn && isAdmin()) {
      loadGroupInfo()
    }
  }, [isSignedIn, isLoading, router])

  const loadGroupInfo = async () => {
    try {
      const response = await fetch('/api/admin/group')
      if (response.ok) {
        const data = await response.json()
        const slug = data.group?.slug
        if (slug) {
          setGroupSlug(slug.toUpperCase())
          generateQRCode(slug)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du groupe:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = (slug: string) => {
    const baseUrl = window.location.origin
    const inviteUrl = `${baseUrl}/?group=${slug.toUpperCase()}`
    // Utiliser l'API QR Code de Google Charts
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(inviteUrl)}`
    setQrCodeUrl(qrUrl)
  }

  const copyToClipboard = () => {
    const baseUrl = window.location.origin
    const inviteUrl = `${baseUrl}/?group=${groupSlug}`
    navigator.clipboard.writeText(inviteUrl)
    alert('Lien copié dans le presse-papier !')
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `qr-code-${groupSlug}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading || isLoading) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={28} className="rounded-sm" />
                  <h1 className="text-2xl font-semibold text-zinc-900">QR Code d&apos;invitation</h1>
                </div>
                <p className="text-zinc-500 mt-2">Partagez ce QR code avec les membres de votre groupe</p>
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
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8 mb-6">
              <div className="flex flex-col items-center">
                {qrCodeUrl && (
                  <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                )}
                <div className="bg-white px-4 py-2 rounded-full border border-zinc-300 text-sm font-mono">
                  Code: <strong>{groupSlug}</strong>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm p-4 rounded-lg">
                <p className="font-medium mb-2">📱 Comment ça marche ?</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Les nouveaux membres scannent le QR code avec leur téléphone</li>
                  <li>Ils sont redirigés vers l&apos;application</li>
                  <li>Ils se connectent ou créent un compte</li>
                  <li>Une demande d&apos;accès est automatiquement créée</li>
                  <li>Vous recevez la demande et pouvez l&apos;approuver</li>
                </ol>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-700 mb-2">Lien d&apos;invitation :</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/?group=${groupSlug}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono bg-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger le QR Code
                </button>
                <button
                  onClick={() => router.push('/admin/groupe')}
                  className="px-6 py-3 border border-zinc-300 text-zinc-900 rounded-lg font-semibold hover:bg-zinc-50 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
