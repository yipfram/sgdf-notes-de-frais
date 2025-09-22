import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-sgdf-blue text-white p-6 text-center">
          <h1 className="text-2xl font-bold">
            📝 SGDF Notes de Frais
          </h1>
          <p className="text-blue-100 mt-2">
            Inscription - La Guillotière
          </p>
        </div>
        <div className="p-6">
          <SignUp />
        </div>
      </div>
    </div>
  )
}