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
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect iOS (Safari) which doesn't fire beforeinstallprompt
  const ua = window.navigator.userAgent
  const iOS = /iphone|ipad|ipod/i.test(ua)
  const android = /android/i.test(ua)
  const mobile = iOS || android || /mobile/i.test(ua)
    const standalone = (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone === true
    setIsIOS(iOS)
    setIsStandalone(standalone)
  setIsMobile(mobile)

    const handler = (e: Event) => {
      e.preventDefault()
      // Only show custom prompt on mobile devices
      if (mobile) {
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setVisible(true)
      }
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

  // iOS manual A2HS instructions when not installed and no deferredPrompt available
  if (isIOS && isMobile && !isStandalone && !installed && !deferredPrompt) {
    return (
      <div className="fixed bottom-4 inset-x-0 px-4 z-50">
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-200 p-4 flex items-start gap-4">
          <div className="flex-1 text-sm text-gray-700 space-y-1">
            <p className="font-medium text-gray-900">Installer sur votre iPhone / iPad</p>
            <ol className="list-decimal list-inside text-xs space-y-1">
              <li>Appuyez sur l'icône <span className="inline-block px-1 py-0.5 border rounded">Partager</span> en bas de Safari.</li>
              <li>Sélectionnez « Ajouter à l'écran d'accueil ».</li>
              <li>Confirmez en appuyant sur « Ajouter ».</li>
            </ol>
          </div>
          <button onClick={() => setInstalled(true)} className="text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 h-fit">Fermer</button>
        </div>
      </div>
    )
  }

  if (!isMobile) return null
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

  // Old implementation for Desktop, outdated

  // const onDismiss = () => {
  //   setVisible(false)
  // }

  // return (
  //   <div className="fixed bottom-4 inset-x-0 px-4 z-50">
  //     <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-200 p-4 flex items-center gap-4">
  //       <div className="flex-1">
  //         <p className="text-sm font-medium text-gray-800">Installer l&apos;application</p>
  //         <p className="text-xs text-gray-500">Accès rapide hors navigateur, meilleure expérience mobile.</p>
  //       </div>
  //       <div className="flex gap-2">
  //         <button onClick={onDismiss} className="text-xs px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">Plus tard</button>
  //         <button onClick={onInstall} className="text-xs px-3 py-2 rounded-lg bg-sgdf-blue text-white hover:bg-blue-700 font-semibold">Installer</button>
  //       </div>
  //     </div>
  //   </div>
  // )
}
