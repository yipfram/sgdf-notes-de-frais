import { SpeedInsights } from '@vercel/speed-insights/next'

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <SpeedInsights />
      {/* Register the service worker for offline/PWA support. */}
      <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(e=>console.log('SW registration failed',e));});}` }} />
    </>
  )
}
