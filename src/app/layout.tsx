import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from '@clerk/localizations'
import './globals.css'

export const metadata: Metadata = {
  title: 'Factures carte procurement SGDF',
  description: "Application de gestion des factures carte procurement pour SGDF La Guillotière",
  manifest: '/manifest.json',
}

export function generateViewport() {
  return {
    themeColor: [
      {
        color: '#18181B'
      }
    ]
  }
}

export default function RootLayout({
  children,
}: { readonly children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: '#18181B',
          colorBackground: '#FFFFFF',
          colorForeground: '#18181B',
          colorInputBackground: '#FFFFFF',
          colorInputBorder: '#D4D4D8',
        },
      }}
    >
      <html lang="fr">
        <head>
          <meta name="theme-color" content="#18181B" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Notes SGDF" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/SGDF_symbole_RVB.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className="font-sans">
          <div className="min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
