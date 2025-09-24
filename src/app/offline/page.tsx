export const metadata = { title: 'Hors ligne - Factures carte procurement SGDF' }

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 text-center">
      <div className="max-w-md space-y-4 bg-white border border-zinc-200 rounded-lg p-6 text-zinc-800">
        <h1 className="text-2xl font-semibold text-zinc-900">Mode Hors Ligne</h1>
        <p>Vous êtes actuellement hors connexion. L&apos;envoi d&apos;email est désactivé.</p>
        <p>Vous pouvez préparer votre facture puis réessayer quand la connexion sera rétablie.</p>
        <p className="text-zinc-500 text-sm">Cette page s&apos;affiche automatiquement si le réseau est indisponible.</p>
      </div>
    </main>
  )
}