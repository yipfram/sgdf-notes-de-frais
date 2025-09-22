'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> }

export function InstallTestButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  const trigger = async () => {
    if (!deferred) {
      setResult('Événement non disponible (conditions non remplies)')
      return
    }
    await deferred.prompt()
    const choice = await deferred.userChoice
    setResult(`Choix: ${choice.outcome}`)
    setDeferred(null)
  }

  return (
    <div className="mt-4 p-3 border border-dashed border-sgdf-blue/40 rounded-lg text-sm bg-white/60">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-700 font-medium">Test Installation PWA</span>
        <button
          type="button"
          onClick={trigger}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold text-white ${deferred ? 'bg-sgdf-blue hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {deferred ? 'Lancer prompt' : 'Indisponible'}
        </button>
      </div>
      {result && <p className="mt-2 text-xs text-gray-600">{result}</p>}
  <p className="mt-1 text-[11px] text-gray-500 leading-snug">Le bouton n&apos;est actif que si le navigateur a émis <code>beforeinstallprompt</code>.</p>
    </div>
  )
}