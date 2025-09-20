import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SGDF Notes de Frais',
  description: 'Application de gestion des notes de frais pour SGDF La Guillotière',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-sgdf-blue to-blue-800">
          {children}
        </div>
      </body>
    </html>
  )
}