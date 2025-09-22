import React from 'react'

export default function AuthSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse">
  <span className="sr-only" aria-live="polite">Chargement de l&apos;interface...</span>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-6 bg-gray-200 rounded w-5/6 mx-auto" />
        <div className="h-10 bg-gray-200 rounded w-full" />
        <div className="h-10 bg-gray-200 rounded w-full" />
        <div className="h-10 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
