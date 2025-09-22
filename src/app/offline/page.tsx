export const metadata = { title: 'Hors ligne - SGDF Notes de Frais' }

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-sgdf-blue text-white text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Mode Hors Ligne</h1>
  <p>Vous êtes actuellement hors connexion. L&apos;envoi d&apos;email est désactivé.</p>
  <p>Vous pouvez préparer votre note de frais puis réessayer quand la connexion sera rétablie.</p>
  <p className="text-white/70 text-sm">Cette page s&apos;affiche automatiquement si le réseau est indisponible.</p>
      </div>
    </main>
  )
}