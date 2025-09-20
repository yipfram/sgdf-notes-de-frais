'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Upload, Loader2, Download, Mail } from 'lucide-react';
import { ExpenseFormData, SGDF_BRANCHES } from '@/types/expense';
import { performOCR, OCRResult } from '@/lib/ocr';
import { generateFileName, downloadFile, createMailtoLink, resizeImage } from '@/lib/utils';
import { format } from 'date-fns';

export default function ExpenseForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      branch: '',
      amount: '',
      description: '',
    },
  });

  const watchedValues = watch();

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsProcessing(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      // Resize image for better processing
      const resizedFile = await resizeImage(file);
      setProcessedFile(resizedFile);

      // Perform OCR
      const result = await performOCR(resizedFile);
      setOcrResult(result);

      // Auto-fill amount if found
      if (result.amounts.length > 0) {
        setValue('amount', result.amounts[0]);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAmountSelect = (amount: string) => {
    setValue('amount', amount);
  };

  const handleDownload = () => {
    if (!processedFile || !watchedValues.date || !watchedValues.branch || !watchedValues.amount) {
      alert('Veuillez remplir tous les champs obligatoires avant de télécharger.');
      return;
    }

    const fileName = generateFileName(watchedValues.date, watchedValues.branch, watchedValues.amount);
    downloadFile(processedFile, fileName);
  };

  const handleEmailSend = async () => {
    if (!processedFile || !watchedValues.date || !watchedValues.branch || !watchedValues.amount || !watchedValues.description || !recipientEmail) {
      alert('Veuillez remplir tous les champs et l\'email destinataire.');
      return;
    }

    setIsSendingEmail(true);

    try {
      const fileName = generateFileName(watchedValues.date, watchedValues.branch, watchedValues.amount);
      const renamedFile = new File([processedFile], fileName, { type: processedFile.type });

      const formData = new FormData();
      formData.append('date', watchedValues.date);
      formData.append('branch', watchedValues.branch);
      formData.append('amount', watchedValues.amount);
      formData.append('description', watchedValues.description);
      formData.append('recipientEmail', recipientEmail);
      formData.append('file', renamedFile);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Email envoyé avec succès !');
      } else {
        alert(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleEmailPrep = () => {
    if (!watchedValues.date || !watchedValues.branch || !watchedValues.amount || !watchedValues.description) {
      alert('Veuillez remplir tous les champs obligatoires avant de préparer l\'email.');
      return;
    }

    const fileName = generateFileName(watchedValues.date, watchedValues.branch, watchedValues.amount);
    const mailtoLink = createMailtoLink(
      watchedValues.date,
      watchedValues.branch,
      watchedValues.amount,
      watchedValues.description,
      fileName
    );

    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold text-center">Notes de Frais</h1>
          <p className="text-blue-100 text-center mt-2">SGDF La Guillotière</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">1. Photo du justificatif</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Prendre une photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Importer un fichier</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Aperçu du justificatif"
                  className="w-full h-48 object-contain rounded-lg border"
                />
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Analyse en cours...</span>
              </div>
            )}

            {ocrResult && ocrResult.amounts.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Montants détectés :</h3>
                <div className="flex flex-wrap gap-2">
                  {ocrResult.amounts.map((amount, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                    >
                      {amount}€
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Section */}
          <form className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">2. Informations de la dépense</h2>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                {...register('date', { required: 'La date est obligatoire' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                Branche *
              </label>
              <select
                id="branch"
                {...register('branch', { required: 'La branche est obligatoire' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              >
                <option value="">Sélectionnez une branche</option>
                {SGDF_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€) *
              </label>
              <input
                type="text"
                id="amount"
                {...register('amount', { 
                  required: 'Le montant est obligatoire',
                  pattern: {
                    value: /^\d+([.,]\d{1,2})?$/,
                    message: 'Format du montant invalide (ex: 12,34 ou 12.34)'
                  }
                })}
                placeholder="ex: 12,34"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                {...register('description', { required: 'La description est obligatoire' })}
                placeholder="Décrivez la dépense..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </form>

          {/* Actions Section */}
          {processedFile && (
            <div className="space-y-3 pt-4 border-t">
              <h2 className="text-lg font-semibold text-gray-900">3. Actions</h2>
              
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger le fichier
              </button>

              <button
                type="button"
                onClick={handleEmailPrep}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Préparer l&apos;email
              </button>

              <div className="pt-4 border-t">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="showEmailOption"
                    checked={showEmailOption}
                    onChange={(e) => setShowEmailOption(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="showEmailOption" className="text-sm text-gray-600">
                    Envoyer l&apos;email automatiquement (optionnel)
                  </label>
                </div>

                {showEmailOption && (
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email destinataire"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                    <button
                      type="button"
                      onClick={handleEmailSend}
                      disabled={isSendingEmail || !recipientEmail}
                      className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingEmail ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5 mr-2" />
                      )}
                      {isSendingEmail ? 'Envoi en cours...' : 'Envoyer l\'email'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}