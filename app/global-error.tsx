'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Erreur Critique
          </h1>
          <p className="mb-6 text-gray-600">
            L'application a rencontré une erreur critique. Veuillez recharger la page.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  )
}
