'use client'

import { useState } from 'react'

interface AnalysisResult {
  url: string
  companyName: string
  description: string
  techStack: string[]
  gtmSignals: string[]
  fitScore: number
  explanation: string
  analyzedAt: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Analysis failed')
      }

      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fitColor =
    result && result.fitScore >= 70
      ? 'bg-green-100 text-green-900'
      : result && result.fitScore >= 40
        ? 'bg-yellow-100 text-yellow-900'
        : 'bg-red-100 text-red-900'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Konsole Analyzer
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Analyse automatique de sites web pour extraire insights GTM
          </p>
        </div>

        <form
          onSubmit={handleAnalyze}
          className="space-y-4 rounded-lg bg-white p-6 shadow-md"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              URL à analyser
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="stripe.com ou https://stripe.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyse en cours...' : 'Analyser'}
          </button>
        </form>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-900">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 rounded-lg bg-white p-6 shadow-md">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {result.companyName}
              </h2>
              <p className="mt-2 text-slate-600">{result.description}</p>
            </div>

            <div className={`rounded-lg p-4 ${fitColor}`}>
              <p className="text-sm font-medium opacity-75">Fit Score SaaS B2B</p>
              <p className="text-3xl font-bold">{result.fitScore}/100</p>
              <p className="mt-2 text-sm">{result.explanation}</p>
            </div>

            {result.techStack.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900">Tech Stack</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-900"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.gtmSignals.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900">Signaux GTM</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.gtmSignals.map((signal) => (
                    <span
                      key={signal}
                      className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Analysé le {new Date(result.analyzedAt).toLocaleString('fr-FR')}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
