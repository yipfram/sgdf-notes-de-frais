"use client"
import dynamic from 'next/dynamic'
import AuthSkeleton from './AuthSkeleton'
import React from 'react'

const SignInDynamic = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false, loading: () => <AuthSkeleton /> }
)

export default function ClerkSignInClient(): React.ReactElement {
  return <SignInDynamic />
}
