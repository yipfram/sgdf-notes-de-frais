"use client"
import dynamic from 'next/dynamic'
import AuthSkeleton from './AuthSkeleton'
import React from 'react'

const SignUpDynamic = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { ssr: false, loading: () => <AuthSkeleton /> }
)

export default function ClerkSignUpClient(): React.ReactElement {
  return <SignUpDynamic />
}
