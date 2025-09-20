'use client'

import { useState, useEffect } from 'react'

interface ExpenseFormProps {
  capturedImage: string | null
  extractedAmount: string
}

const SGDF_BRANCHES = [
  'Louveteaux',
  'Jeannettes',
  'Scouts',
  'Guides',
  'Pionniers-Caravelles'
]

export function ExpenseForm({ capturedImage, extractedAmount }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    branch: '',
    amount: '',
    description: ''
  })

  // Update amount when OCR extracts it
  useEffect(() => {
    if (extractedAmount) {
      setFormData(prev => ({ ...prev, amount: extractedAmount }))
    }
  }, [extractedAmount])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatAmount = (amount: string) => {
    return amount.replace(',', '.')
  }

  const generateFileName = () => {
    const { date, branch, amount } = formData
    const formattedAmount = formatAmount(amount)
    return `${date} - ${branch} - ${formattedAmount}.jpg`
  }

  const downloadImage = async () => {
    if (!capturedImage) return

    try {
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = generateFileName()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const generateMailto = () => {
    const subject = encodeURIComponent(`Note de frais - ${formData.branch} - ${formData.date}`)
    const body = encodeURIComponent(`Bonjour,

Veuillez trouver ci-joint ma note de frais :

Date : ${formData.date}
Branche : ${formData.branch}
Montant : ${formatAmount(formData.amount)} €
Description : ${formData.description}

Nom du fichier : ${generateFileName()}

Cordialement`)

    return `mailto:?subject=${subject}&body=${body}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!capturedImage || !formData.branch || !formData.amount) {
      alert('Veuillez remplir tous les champs obligatoires et capturer une image.')
      return
    }

    // Download the renamed image
    await downloadImage()

    // Open mailto for manual email sending
    window.location.href = generateMailto()
  }

  const isFormValid = capturedImage && formData.branch && formData.amount && formData.description

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        📋 Informations de la dépense
      </h2>

      {capturedImage && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Aperçu du justificatif
          </label>
          <img 
            src={capturedImage} 
            alt="Justificatif" 
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Date *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Branche *
        </label>
        <select
          value={formData.branch}
          onChange={(e) => handleInputChange('branch', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent"
          required
        >
          <option value="">Sélectionner une branche</option>
          {SGDF_BRANCHES.map(branch => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Montant (€) *
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          placeholder="Description de la dépense..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sgdf-blue focus:border-transparent resize-none"
          required
        />
      </div>

      <div className="space-y-4">
        {isFormValid && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Nom du fichier généré :</strong><br />
              {generateFileName()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full p-4 rounded-lg font-semibold text-white transition-colors ${
            isFormValid
              ? 'bg-sgdf-blue hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          📧 Télécharger et préparer email
        </button>
      </div>
    </form>
  )
}