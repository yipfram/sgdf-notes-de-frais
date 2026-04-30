"use client"
import dynamic from 'next/dynamic'
import AuthSkeleton from './AuthSkeleton'
import React, { useCallback, useRef, useState } from 'react'

const SignInDynamic = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false }
)

export default function ClerkSignInClient(): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const observed = useRef(false)

  const refCallback = useCallback((el: HTMLDivElement | null) => {
    if (observed.current) return
    if (!el) return

    observed.current = true
    containerRef.current = el

    if (el.querySelector('.cl-card')) {
      setReady(true)
      return
    }

    const observer = new MutationObserver(() => {
      if (el.querySelector('.cl-card')) {
        setReady(true)
        observer.disconnect()
      }
    })

    observer.observe(el, { childList: true, subtree: true })
  }, [])

  return (
    <div ref={refCallback} className="relative min-h-[200px]">
      <div
        className="flex items-center justify-center absolute inset-0 transition-opacity duration-300"
        style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? 'none' : 'auto' }}
      >
        <AuthSkeleton />
      </div>
      <SignInDynamic />
    </div>
  )
}
