'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ClipboardDocumentListIcon, CheckCircleIcon, ExclamationTriangleIcon, PlusCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface ExpenseFormProps {
  readonly capturedImage: string | null
  readonly userEmail: string
  readonly initialBranch?: string // From Clerk public metadata
  readonly onPersistBranch?: (branch: string) => Promise<void> | void
  readonly onCreateNewNote?: () => void
  readonly onBranchChange?: (branch: string) => void
}

const SGDF_BRANCHES = [
  'Farfadets',
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Pionniers-Caravelles',
  'Compagnons',
  'Groupe'
]

export function ExpenseForm({ capturedImage, userEmail, initialBranch = '', onPersistBranch, onCreateNewNote, onBranchChange, isOnline = true }: ExpenseFormProps & { isOnline?: boolean }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    branch: initialBranch || '',
    expenseType: '',
    amount: '',
    description: ''
  })
  const [branchPersistStatus, setBranchPersistStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })



  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'branch') {
      if (onBranchChange) {
        onBranchChange(value)
      }
      // Persist branch selection to user metadata (fire & forget)
      if (onPersistBranch && value) {
        setBranchPersistStatus('saving')
        Promise.resolve(onPersistBranch(value))
          .then(() => setBranchPersistStatus('saved'))
          .catch(() => setBranchPersistStatus('error'))
      }
    }
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const formatAmount = (amount: string) => {
    return amount.replace(',', '.')
  }

  const generateFileName = () => {
    const { date, branch, amount, expenseType } = formData
    const formattedAmount = formatAmount(amount)
    const typeShort = expenseType ? expenseType.replace(/\s+/g, ' ').trim() : ''
    return `${date} - ${branch}${typeShort ? ' - ' + typeShort : ''} - ${formattedAmount}.jpg`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!capturedImage || !formData.branch || !formData.expenseType || !formData.amount) {
      setSubmitStatus({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires et capturer une image.'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/send-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          date: formData.date,
          branch: formData.branch,
          expenseType: formData.expenseType,
          amount: formatAmount(formData.amount),
          description: formData.description,
          imageBase64: capturedImage,
          fileName: generateFileName()
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Email envoyé avec succès ! La facture a été transmise à la trésorerie et une copie vous a été envoyée.'
        })
        // Reset only variable fields but keep branch (souvent même branche pour plusieurs notes)
        setFormData(prev => ({
          date: new Date().toISOString().split('T')[0],
          branch: prev.branch,
          expenseType: '',
          amount: '',
            description: ''
        }))
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Erreur lors de l\'envoi de l\'email'
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Erreur de connexion. Veuillez réessayer.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation complète (inclut type de dépense)
  const isFormValid = capturedImage && formData.branch && formData.expenseType && formData.amount

  const handleNewNote = () => {
    // Clear form (keep branch), clear status, notify parent to reset image & OCR amount
    setFormData(prev => ({
      date: new Date().toISOString().split('T')[0],
      branch: prev.branch,
      expenseType: '',
      amount: '',
      description: ''
    }))
    setSubmitStatus({ type: null, message: '' })
    if (onCreateNewNote) onCreateNewNote()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
        <ClipboardDocumentListIcon className="w-5 h-5 text-zinc-700" aria-hidden="true" />
        Informations de la dépense
      </h2>

      {capturedImage && (
        <div className="space-y-2">
          <label htmlFor="image-preview" className="block text-sm font-medium text-zinc-700">
            Aperçu du justificatif
          </label>
          <Image
            id="image-preview"
            src={capturedImage}
            alt="Justificatif"
            width={500}
            height={200}
            className="w-full h-48 object-cover rounded-lg border border-zinc-200"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="expenseType" className="block text-sm font-medium text-zinc-700">
          Type de dépense *
        </label>
        <select
          id="expenseType"
          value={formData.expenseType}
          onChange={(e) => handleInputChange('expenseType', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        >
          <option value="">Sélectionner un type</option>
          {[
            'Alimentation, Intendance',
            'Achat Petit Materiel',
            'Achat Materiel PÈdagogique',
            'Transport collectif Train',
            'Transport collectif : en Autocar',
            'Transport collectif en commun (RER, metro, Tram, bus, etc.)',
            'Medecin, Pharmacie',
            'Hebergement',
            'Achat Gros Materiel',
            'Participation Activites',
            'Carburants',
            'Peage-Parking',
            'Autres'
          ].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium text-zinc-700">
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="branch" className="block text-sm font-medium text-zinc-700">
          Branche *
        </label>
        <select
          id="branch"
          value={formData.branch}
          onChange={(e) => handleInputChange('branch', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        >
          <option value="">Sélectionner une branche</option>
          {SGDF_BRANCHES.map(branch => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        {formData.branch && (
          <div className="mt-1 flex items-center justify-between">
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              {branchPersistStatus === 'saving' && (
                <span className="inline-flex items-center gap-1">
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sauvegarde…
                </span>
              )}
              {branchPersistStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircleIcon className="w-4 h-4" aria-hidden="true" /> Branche mémorisée
                </span>
              )}
              {branchPersistStatus === 'error' && (
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <ExclamationTriangleIcon className="w-4 h-4" aria-hidden="true" /> Erreur de sauvegarde
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-700">
          Montant (€) *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 bg-white text-zinc-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          placeholder="Description de la dépense..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 resize-none bg-white text-zinc-900"
        />
      </div>

      {/* Status messages */}
      {submitStatus.type && (
        <div className={`p-4 rounded-lg space-y-3 ${
          submitStatus.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <p className="text-sm flex items-start gap-2">
            {submitStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5 flex-none" aria-hidden="true" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 flex-none" aria-hidden="true" />
            )}
            <span>{submitStatus.message}</span>
          </p>
          {submitStatus.type === 'success' && (
            <button
              type="button"
              onClick={handleNewNote}
              className="w-full p-3 rounded-lg font-medium bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <PlusCircleIcon className="w-5 h-5" aria-hidden="true" /> Nouvelle facture
              </span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {isFormValid && !submitStatus.type && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <p className="text-sm text-zinc-800">
              <span className="inline-flex items-center gap-2 font-medium">
                <PaperAirplaneIcon className="w-4 h-4" aria-hidden="true" /> Email sera envoyé à :
              </span><br />
              • Trésorerie : sgdf.tresolaguillotiere@gmail.com<br />
              • Vous : {userEmail}<br />
              <span className="inline-flex items-center gap-2 font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" x2="12" y1="5" y2="20"/></svg>
                Fichier :
              </span> {generateFileName()}
            </p>
          </div>
        )}

        {!isOnline && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" aria-hidden="true" />
            <span>Vous êtes hors ligne. Vous pouvez préparer la note mais l&apos;envoi ne fonctionnera qu&apos;une fois reconnecté.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting || !isOnline}
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors focus:outline-none ${
            isFormValid && !isSubmitting && isOnline
              ? 'bg-zinc-900 hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-400'
              : 'bg-zinc-300 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5" aria-hidden="true" /> Envoyer la facture
            </span>
          )}
        </button>
      </div>
    </form>
  )
}