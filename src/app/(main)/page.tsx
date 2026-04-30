'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { ExpenseForm } from '@/components/ExpenseForm'
import { PhotoCapture } from '@/components/PhotoCapture'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { InstallPrompt } from '@/components/InstallPrompt'
import { MAX_ATTACHMENT_COUNT, type ExpenseAttachment } from '@/lib/attachments'
import Image from 'next/image'

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [attachments, setAttachments] = useState<ExpenseAttachment[]>([])
  const [activeBranch, setActiveBranch] = useState<string>('')
  const [branchSaveStatus, setBranchSaveStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const isOnline = useOnlineStatus()

  useEffect(() => {
    if (!branchSaveStatus.type) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setBranchSaveStatus({ type: null, message: '' })
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [branchSaveStatus.type])

  // Update activeBranch when user metadata loads
  useEffect(() => {
    if (user?.publicMetadata?.branch) {
      setActiveBranch(user.publicMetadata.branch as string)
    } else {
      setActiveBranch('')
    }
  }, [user?.publicMetadata?.branch])

  // Afficher un loader pendant le chargement de l'état d'authentification
  if (!isLoaded || !isSignedIn) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
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
                <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={20} className="rounded-sm" style={{ height: 'auto' }} />
                <h1 className="text-2xl font-semibold text-zinc-900">Factures carte procurement SGDF</h1>
              </div>
              <p className="text-zinc-500 mt-2">La Guillotière</p>
            </div>
            <div className="flex items-center space-x-3">
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
        
        {!isOnline && (
          <div className="bg-amber-50 border-t border-b border-amber-200 text-amber-800 text-center text-sm py-2">
            Hors ligne - certaines fonctionnalités sont limitées
          </div>
        )}

        {branchSaveStatus.type && (
          <div
            className={`border-t border-b text-center text-sm py-2 ${
              branchSaveStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {branchSaveStatus.message}
          </div>
        )}

        <div className="p-6 space-y-6">
          <PhotoCapture
            onAttachmentsAdd={(newAttachments) => {
              setAttachments(prev => [...prev, ...newAttachments].slice(0, MAX_ATTACHMENT_COUNT))
            }}
            currentCount={attachments.length}
          />

          <ExpenseForm
            attachments={attachments}
            userEmail={user?.emailAddresses[0]?.emailAddress || ''}
            initialBranch={activeBranch}
            onCreateNewNote={() => {
              setAttachments([])
            }}
            onRemoveAttachment={(index) => {
              setAttachments(prev => prev.filter((_, i) => i !== index))
            }}
            onPersistBranch={async (branch: string) => {
              try {
                setBranchSaveStatus({ type: null, message: '' })
                const res = await fetch('/api/update-branch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ branch })
                })
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}))
                  throw new Error(data.error || 'Erreur API')
                }
                await user?.reload()
                setActiveBranch(branch)
                setBranchSaveStatus({
                  type: 'success',
                  message: 'Branche sauvegardée.'
                })
              } catch (e) {
                console.error('Erreur de sauvegarde de la branche dans Clerk', e)
                setBranchSaveStatus({
                  type: 'error',
                  message: 'Impossible de sauvegarder la branche. Veuillez réessayer plus tard.'
                })
              }
            }}
            onBranchChange={(b) => setActiveBranch(b)}
            isOnline={isOnline}
          />
        </div>
      </div>
      <InstallPrompt />
    </main>
  )
}
