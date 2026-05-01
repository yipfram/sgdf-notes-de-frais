'use client'

import { useSyncExternalStore } from 'react'
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { MAX_ATTACHMENT_COUNT } from '@/lib/attachments'

const STORAGE_KEY = 'sgdf-multiple-attachments-notice-dismissed'
const DISMISS_EVENT = 'sgdf-multiple-attachments-notice-dismissed-change'

function getDismissedSnapshot() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

function subscribeToDismissedState(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(DISMISS_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(DISMISS_EVENT, onStoreChange)
  }
}

export function FeatureNotice() {
  const isDismissed = useSyncExternalStore(
    subscribeToDismissedState,
    getDismissedSnapshot,
    () => false
  )

  const handleDismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')
    window.dispatchEvent(new Event(DISMISS_EVENT))
  }

  if (isDismissed) {
    return null
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
      <div className="flex items-start gap-2">
        <SparklesIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-700" aria-hidden="true" />
        <p className="flex-1">
          <span className="font-medium">Nouveau: </span> vous pouvez ajouter plusieurs justificatifs dans le même envoi,
          jusqu&apos;à {MAX_ATTACHMENT_COUNT} fichiers.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="-m-1 rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Masquer cette annonce"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
