import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Factures carte procurement SGDF',
  description: "Application de gestion des factures carte procurement pour SGDF La Guillotière",
  manifest: '/manifest.json',
}

// Provide a generateViewport function so Next can place theme-color metadata correctly
export function generateViewport(): any {
  return {
    // themeColor accepts a string or an array of descriptors; use descriptor form for clarity
    themeColor: [
      {
        color: '#18181B' // zinc-800
      }
    ]
  }
}

export default function RootLayout({
  children,
}: { readonly children: React.ReactNode }) {
  return (
    <ClerkProvider>
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
            <AuthProvider>
              {children}
            </AuthProvider>
          </div>
          <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(e=>console.log('SW registration failed',e));});}`}} />
        </body>
      </html>
    </ClerkProvider>
  )
}