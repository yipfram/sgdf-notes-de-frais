import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Factures carte procurement SGDF',
  description: "Application de gestion des factures carte procurement pour SGDF La Guillotière",
  manifest: '/manifest.json',
  themeColor: '#1E3A8A'
}

export default function RootLayout({
  children,
}: { readonly children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <head>
          <meta name="theme-color" content="#1E3A8A" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Notes SGDF" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/SGDF_symbole_RVB.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className="font-sans">
          <div className="min-h-screen bg-gradient-to-br from-sgdf-blue to-blue-800">
            {children}
          </div>
          <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(e=>console.log('SW registration failed',e));});}`}} />
        </body>
      </html>
    </ClerkProvider>
  )
}