'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'

interface WalkthroughStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function WalkthroughPage() {
  const { isSignedIn, activeBranch, activeBranchRole, isLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isSignedIn || !activeBranch)) {
      router.push('/')
    }
  }, [isSignedIn, activeBranch, isLoading, router])

  const walkthroughSteps: WalkthroughStep[] = [
    {
      id: 1,
      title: 'Bienvenue dans votre espace',
      description: 'Découvrez les fonctionnalités de gestion des notes de frais pour votre groupe.',
      completed: false
    },
    {
      id: 2,
      title: 'Envoyer une note de frais',
      description: 'Apprenez à photographier et envoyer vos reçus en quelques clics.',
      completed: false
    },
    {
      id: 3,
      title: 'Gérer les accès',
      description: 'Comprenez comment inviter les chefs et gérer les permissions.',
      completed: false
    },
    {
      id: 4,
      title: 'Suivi des dépenses',
      description: 'Explorez les outils de suivi et d\'administration.',
      completed: false
    },
    {
      id: 5,
      title: 'Personnalisation',
      description: 'Configurez les emails d\'unité et autres paramètres de votre branche.',
      completed: false
    }
  ]

  const startWalkthrough = () => {
    setIsStarted(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeWalkthrough = () => {
    // TODO: Sauvegarder que l'utilisateur a terminé le walkthrough
    router.push(activeBranchRole === 'admin' ? '/admin/groupe' : '/admin/ma-branche')
  }

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-600 text-sm">Chargement…</div>
      </main>
    )
  }

  if (!isSignedIn || !activeBranch) {
    return null // Redirection gérée par useEffect
  }

  if (isCompleted) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center bg-zinc-50">
        <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-white text-zinc-900 p-6 border-b border-zinc-200">
            <div className="flex items-center justify-center gap-2">
              <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={24} height={24} className="rounded-sm" />
              <h1 className="text-2xl font-semibold text-center">Walkthrough terminé !</h1>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Félicitations !</h2>
            <p className="text-zinc-600 mb-6">
              Vous avez maintenant toutes les clés pour utiliser l&apos;application efficacement.
            </p>
            <button
              onClick={completeWalkthrough}
              className="bg-zinc-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            >
              Accéder à mon espace
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Image src="/SGDF_symbole_RVB.png" alt="SGDF" width={28} height={28} className="rounded-sm" />
                  <h1 className="text-2xl font-semibold text-zinc-900">Walkthrough de rentrée</h1>
                </div>
                <p className="text-zinc-500 mt-1">Découvrez toutes les fonctionnalités</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>

        {!isStarted ? (
          /* Page d'accueil du walkthrough */
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Prêt à commencer ?</h2>
            <p className="text-zinc-600 mb-8 max-w-2xl mx-auto">
              Ce walkthrough vous guidera à travers les fonctionnalités essentielles de l&apos;application pour que vous soyez opérationnel rapidement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {walkthroughSteps.map((step, index) => (
                <div key={step.id} className="border border-zinc-200 rounded-lg p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-sm font-medium text-zinc-600">
                      {index + 1}
                    </div>
                    <h3 className="font-medium text-zinc-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-600">{step.description}</p>
                </div>
              ))}
            </div>
            <button
              onClick={startWalkthrough}
              className="bg-zinc-900 text-white py-3 px-8 rounded-lg font-semibold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            >
              Lancer le walkthrough
            </button>
          </div>
        ) : (
          /* Étape actuelle du walkthrough */
          <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-8">
            {/* Progression */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-700">
                  Étape {currentStep + 1} sur {walkthroughSteps.length}
                </span>
                <span className="text-sm text-zinc-500">
                  {Math.round(((currentStep + 1) / walkthroughSteps.length) * 100)}% terminé
                </span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2">
                <div
                  className="bg-zinc-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Contenu de l'étape */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">{currentStep + 1}</span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
                {walkthroughSteps[currentStep].title}
              </h2>
              <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
                {walkthroughSteps[currentStep].description}
              </p>
            </div>

            {/* Contenu interactif (placeholder pour Phase 2) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8">
              <div className="text-center text-zinc-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Contenu interactif de cette étape</p>
                <p className="text-sm">Sera implémenté dans la Phase 2</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-6 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              <button
                onClick={nextStep}
                className="bg-zinc-900 text-white py-2 px-6 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {currentStep === walkthroughSteps.length - 1 ? 'Terminer' : 'Suivant'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}