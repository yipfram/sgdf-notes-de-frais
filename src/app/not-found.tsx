import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
          <div className="flex items-center justify-center gap-2">
            <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
            <h1 className="text-2xl font-semibold text-center">Notes de frais</h1>
          </div>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Page non trouvée</h2>
          <p className="text-zinc-600 mb-6">
            La page que vous recherchez n&apos;existe pas.
          </p>
          <Link
            href="/"
            className="inline-block bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
