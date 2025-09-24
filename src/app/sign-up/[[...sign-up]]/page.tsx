import ClerkSignUpClient from '../../../components/ClerkSignUpClient'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden w-full max-w-lg">
        <div className="bg-white text-zinc-900 p-6 text-center border-b border-zinc-200 rounded-t-lg">
          <div className="flex items-center justify-center gap-2">
            <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
            <h1 className="text-2xl font-semibold">Factures carte procurement SGDF</h1>
          </div>
          <p className="text-zinc-500 mt-2">Inscription - La Guillotière</p>
        </div>
        <div className="py-6 flex justify-center items-center">
          <div className="max-w-sm mx-auto">
            <ClerkSignUpClient />
          </div>
        </div>
      </div>
    </div>
  )
}