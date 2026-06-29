'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-900">
          Oops! Quelque chose s'est mal passé
        </h1>
        <p className="mb-6 text-red-700">
          {error.message || 'Une erreur inattendue s\'est produite'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
