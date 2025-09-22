'use client'

import { useState, useEffect } from 'react'

interface ExpenseFormProps {
  readonly capturedImage: string | null
  readonly extractedAmount: string
  readonly userEmail: string
  readonly initialBranch?: string // From Clerk public metadata
  readonly onPersistBranch?: (branch: string) => Promise<void> | void
  readonly onCreateNewNote?: () => void
}

const SGDF_BRANCHES = [
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Pionniers-Caravelles'
]

export function ExpenseForm({ capturedImage, extractedAmount, userEmail, initialBranch = '', onPersistBranch, onCreateNewNote }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    branch: initialBranch || '',
    amount: '',
    description: ''
  })
  const [branchPersistStatus, setBranchPersistStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Update amount when OCR extracts it
  useEffect(() => {
    if (extractedAmount) {
      setFormData(prev => ({ ...prev, amount: extractedAmount }))
    }
  }, [extractedAmount])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'branch') {
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
    const { date, branch, amount } = formData
    const formattedAmount = formatAmount(amount)
    return `${date} - ${branch} - ${formattedAmount}.jpg`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!capturedImage || !formData.branch || !formData.amount || !formData.description) {
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
          message: 'Email envoyé avec succès ! La note de frais a été transmise à la trésorerie et une copie vous a été envoyée.'
        })
        // Reset only variable fields but keep branch (souvent même branche pour plusieurs notes)
        setFormData(prev => ({
          date: new Date().toISOString().split('T')[0],
          branch: prev.branch,
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

  const isFormValid = capturedImage && formData.branch && formData.amount && formData.description

  const handleNewNote = () => {
    // Clear form (keep branch), clear status, notify parent to reset image & OCR amount
    setFormData(prev => ({
      date: new Date().toISOString().split('T')[0],
      branch: prev.branch,
      amount: '',
      description: ''
    }))
    setSubmitStatus({ type: null, message: '' })
    if (onCreateNewNote) onCreateNewNote()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        📋 Informations de la dépense
      </h2>

      {capturedImage && (
        <div className="space-y-2">
          <label htmlFor="image-preview" className="block text-sm font-medium text-gray-700">
            Aperçu du justificatif
          </label>
          <img 
            id="image-preview"
            src={capturedImage} 
            alt="Justificatif" 
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent bg-white text-gray-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
          Branche *
        </label>
        <select
          id="branch"
          value={formData.branch}
          onChange={(e) => handleInputChange('branch', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent bg-white text-gray-900"
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
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            {branchPersistStatus === 'saving' && '💾 Sauvegarde...'}
            {branchPersistStatus === 'saved' && '✅ Branche mémorisée'}
            {branchPersistStatus === 'error' && '⚠️ Erreur de sauvegarde'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Montant (€) *
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent bg-white text-gray-900"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          placeholder="Description de la dépense..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent resize-none bg-white text-gray-900"
          required
        />
      </div>

      {/* Status messages */}
      {submitStatus.type && (
        <div className={`p-4 rounded-lg space-y-3 ${
          submitStatus.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="text-sm">
            {submitStatus.type === 'success' ? '✅' : '❌'} {submitStatus.message}
          </p>
          {submitStatus.type === 'success' && (
            <button
              type="button"
              onClick={handleNewNote}
              className="w-full p-3 rounded-lg font-medium bg-sgdf-blue text-white hover:bg-blue-700 transition-colors"
            >
              ➕ Nouvelle note de frais
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {isFormValid && !submitStatus.type && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📧 Email sera envoyé à :</strong><br />
              • Trésorerie : sgdf.tresolaguillotiere@gmail.com<br />
              • Vous : {userEmail}<br />
              <strong>📎 Fichier :</strong> {generateFileName()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-sgdf-blue hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
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
            '📧 Envoyer la note de frais'
          )}
        </button>
      </div>
    </form>
  )
}