import ClerkSignUpClient from '../../../components/ClerkSignUpClient'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg">
        <div className="bg-sgdf-blue text-white p-6 text-center rounded-t-lg">
          <h1 className="text-2xl font-bold">📝 SGDF Notes de Frais</h1>
          <p className="text-blue-100 mt-2">Inscription - La Guillotière</p>
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