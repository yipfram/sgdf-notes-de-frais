import nodemailer from 'nodemailer'
import { getBranchColor } from './branches'

export interface EmailData {
  userEmail: string
  date: string
  branch: string
  expenseType: string
  amount: string
  description?: string
  imageBase64: string
  fileName: string
  groupName?: string
  treasuryEmail?: string
  unitEmail?: string | null
}

// Configuration du transporteur Gmail SMTP
export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true pour port 465, false pour les autres ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Fonction pour envoyer un email avec pièce jointe
export const sendExpenseEmail = async (data: EmailData) => {
  const transporter = createEmailTransporter()

  // Vérifier la connexion SMTP
  try {
    await transporter.verify()
    console.log('Serveur SMTP prêt à envoyer des emails')
  } catch (error) {
    console.error('Erreur de configuration SMTP:', error)
    throw new Error('Configuration SMTP invalide')
  }

  const {
  userEmail,
  date,
  branch,
  expenseType,
  amount,
  description,
  imageBase64,
  fileName,
  groupName = 'La Guillotière',
  treasuryEmail = process.env.TREASURY_EMAIL,
  unitEmail
} = data

  // Helper pour extraire le buffer depuis une data URL ou une chaîne base64 brute
  const extractImageBuffer = (input: string) => {
    if (!input) {
      throw new Error('IMAGE_MISSING')
    }

    let mime = 'image/jpeg'
    let base64Part = input

    // Format attendu: data:image/<type>;base64,<data>
    if (input.startsWith('data:')) {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/.exec(input)
      if (!match || match.length < 3) {
        throw new Error('IMAGE_DATA_URL_INVALID')
      }
      mime = match[1]
      base64Part = match[2]
    } else if (input.includes(',')) {
      // Cas dégradé: on tente de prendre après la dernière virgule
      base64Part = input.split(',').pop() as string
    } else if (!/^[A-Za-z0-9+/=\r\n]+$/.test(input)) {
      // Vérification minimale que la chaîne ressemble à du base64
      throw new Error('IMAGE_NOT_BASE64')
    }

    try {
      const buffer = Buffer.from(base64Part, 'base64')
      if (buffer.length === 0) {
        throw new Error('IMAGE_EMPTY_BUFFER')
      }
      return { buffer, mime }
    } catch (e) {
      console.error('Erreur conversion buffer image:', e)
      throw new Error('IMAGE_BUFFER_CONVERSION_FAILED')
    }
  }

  let imageInfo: { buffer: Buffer; mime: string }
  try {
    imageInfo = extractImageBuffer(imageBase64)
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('IMAGE_')) {
      // Relever une erreur claire pour la route API afin de retourner 400
      throw new Error(`INVALID_IMAGE:${e.message}`)
    }
    throw e
  }

  const subject = `Facture carte procurement - ${branch} - ${date}`
  const primaryColor = getBranchColor(branch)
  // Accent: If the primary color is a warm tone, keep gold, else use a light variant
  const accentColor = '#FBB042'
  const textOnPrimary = '#ffffff'

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${primaryColor}; color: ${textOnPrimary}; padding: 20px; text-align: center;">
  <h1 style="margin: 0; font-size: 24px;">📜 Facture carte procurement SGDF</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${groupName}</p>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
  <h2 style="color: ${primaryColor}; margin-top: 0;">Nouvelle facture</h2>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Date :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Branche :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${branch}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Type :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${expenseType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: ${primaryColor};">Montant :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: ${primaryColor}; font-weight: bold; font-size: 18px;">${amount} €</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #374151;">Demandeur :</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #374151;">${userEmail}</td>
            </tr>
            ${description ? `
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #374151; vertical-align: top;">Description :</td>
              <td style="padding: 10px 0; color: #374151;">${description}</td>
            </tr>` : ''}
          </table>
        </div>
        
        <div style="background-color: ${accentColor}; color: ${primaryColor}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📎 Justificatif en pièce jointe :</strong> ${fileName}
        </div>
        
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
          Email envoyé automatiquement par l'application Factures carte procurement SGDF.
        </p>
      </div>
    </div>
  `

  const textContent = `
Facture carte procurement SGDF - ${groupName}

Nouvelle facture

Date : ${date}
Branche : ${branch}
Type : ${expenseType}
Montant : ${amount} €
Demandeur : ${userEmail}
${description ? `Description : ${description}` : ''}

Justificatif en pièce jointe : ${fileName}

Email envoyé automatiquement par l'application Factures carte procurement SGDF.
  `

  // Build recipients list
  const recipients = [treasuryEmail!]
  const ccList = [userEmail]

  if (unitEmail) {
    ccList.push(unitEmail)
  }

  const mailOptions = {
    from: {
  name: 'Factures carte procurement SGDF',
      address: process.env.GMAIL_USER!
    },
    to: recipients,
    cc: ccList,
    subject,
    text: textContent,
    html: htmlContent,
  // Mark the message as important/high priority for most email clients
  priority: 'high' as const,
    headers: {
      Importance: 'High',
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High'
    },
    attachments: [
      {
        filename: fileName,
        content: imageInfo.buffer,
        contentType: imageInfo.mime || 'image/jpeg'
      }
    ]
  }

  try {
    // Some nodemailer typings present overloads that make the return type awkward;
    // cast to any so we can access messageId reliably at runtime.
    const info: any = await transporter.sendMail(mailOptions)
    console.log('Email envoyé avec succès:', info?.messageId)
    return { success: true, messageId: info?.messageId }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    throw error
  }
}