"use client";
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)

    const installedHandler = () => {
      setInstalled(true)
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  if (!visible || installed || !deferredPrompt) return null

  const onInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome !== 'accepted') {
      // allow user to trigger again later
      setTimeout(() => setVisible(true), 10000)
    } else {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const onDismiss = () => {
    setVisible(false)
  }

  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-50">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Installer l&apos;application</p>
          <p className="text-xs text-gray-500">Accès rapide hors navigateur, meilleure expérience mobile.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onDismiss} className="text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">Plus tard</button>
          <button onClick={onInstall} className="text-xs px-3 py-2 rounded-lg bg-sgdf-blue text-white hover:bg-blue-700 font-semibold">Installer</button>
        </div>
      </div>
    </div>
  )
}
