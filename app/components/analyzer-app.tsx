'use client'

import { useState } from 'react'

interface ScoreBreakdown {
  size: number
  industry: number
  techStack: number
  gtm: number
}

interface AnalysisResult {
  url: string
  companyName: string
  description: string
  industry: string
  estimatedSize: string
  techStack: string[]
  gtmSignals: string[]
  fitScore: number
  scoreBreakdown: ScoreBreakdown
  explanation: string
  analysisSource: string
  emailProvider: string
  dnsTools: string[]
  analyzedAt: string
}

const examples = ['stripe.com', 'hubspot.com', 'linear.app']

function scoreLabel(score: number): string {
  if (score >= 75) return 'Excellent fit'
  if (score >= 55) return 'Bon fit'
  if (score >= 35) return 'A qualifier'
  return 'Fit faible'
}

function scoreTone(score: number): string {
  if (score >= 75) return 'bg-emerald-600'
  if (score >= 55) return 'bg-blue-600'
  if (score >= 35) return 'bg-amber-500'
  return 'bg-rose-600'
}

function BreakdownBar({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="tabular-nums text-zinc-500">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-zinc-900"
          style={{ width }}
        />
      </div>
    </div>
  )
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
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Revenue engineering intelligence
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Kpratik
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
              Analyse un site web, extrait les signaux utiles pour une equipe
              sales/marketing, puis score le fit pour une offre vendue aux SaaS
              B2B.
            </p>
          </div>

          <form
            onSubmit={handleAnalyze}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm"
          >
            <label
              htmlFor="url"
              className="text-sm font-medium text-zinc-800"
            >
              Site a analyser
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row lg:flex-col">
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="stripe.com"
                className="min-h-12 flex-1 rounded-md border border-zinc-300 bg-white px-4 text-base text-zinc-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="min-h-12 rounded-md bg-zinc-950 px-5 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? 'Analyse...' : 'Analyser'}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setUrl(example)}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600 transition hover:border-zinc-500 hover:text-zinc-950"
                >
                  {example}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <p className="font-medium">Analyse impossible</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-white" />
            <div className="h-72 animate-pulse rounded-lg border border-zinc-200 bg-white" />
          </div>
        )}

        {!loading && !result && !error && (
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ['1', 'Scraping', 'Title, metas, scripts et liens publics.'],
              ['2', 'Classification', 'Secteur, taille, stack et signaux GTM.'],
              ['3', 'Scoring', 'Score SaaS B2B explique et actionnable.'],
            ].map(([step, title, copy]) => (
              <div
                key={step}
                className="rounded-lg border border-zinc-200 bg-white p-5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {step}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-zinc-950">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="break-all text-sm text-zinc-500">
                      {result.url}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                      {result.companyName}
                    </h2>
                    <p className="mt-3 max-w-3xl leading-7 text-zinc-600">
                      {result.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600">
                    {result.analysisSource}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">Secteur</p>
                    <p className="mt-1 font-medium text-zinc-950">
                      {result.industry}
                    </p>
                  </div>
                  <div className="rounded-md bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-500">Taille estimee</p>
                    <p className="mt-1 font-medium text-zinc-950">
                      {result.estimatedSize}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-zinc-950">
                  Signaux GTM detectes
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.gtmSignals.length > 0 ? (
                    result.gtmSignals.map((signal) => (
                      <span
                        key={signal}
                        className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        {signal}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      Aucun signal fort detecte sur la page analysee.
                    </p>
                  )}
                </div>
              </div>

              {(result.dnsTools.length > 0 || result.emailProvider !== 'Unknown') && (
                <div className="rounded-lg border border-zinc-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-zinc-950">
                    Outils detectes via DNS
                  </h3>
                  {result.emailProvider !== 'Unknown' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                      <span className="font-medium text-zinc-800">Email :</span>
                      {result.emailProvider}
                    </div>
                  )}
                  {result.dnsTools.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.dnsTools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-zinc-950">
                  Stack technique
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.techStack.length > 0 ? (
                    result.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">
                      Stack non concluante depuis les scripts publics.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    Fit SaaS B2B
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium text-white ${scoreTone(result.fitScore)}`}
                  >
                    {scoreLabel(result.fitScore)}
                  </span>
                </div>
                <p className="mt-4 text-6xl font-semibold tracking-tight text-zinc-950">
                  {result.fitScore}
                  <span className="text-2xl text-zinc-400">/100</span>
                </p>
                <p className="mt-4 leading-6 text-zinc-600">
                  {result.explanation}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-zinc-950">
                  Detail du score
                </h3>
                <div className="mt-5 space-y-4">
                  <BreakdownBar
                    label="Taille"
                    value={result.scoreBreakdown.size}
                    max={30}
                  />
                  <BreakdownBar
                    label="Secteur"
                    value={result.scoreBreakdown.industry}
                    max={30}
                  />
                  <BreakdownBar
                    label="Stack"
                    value={result.scoreBreakdown.techStack}
                    max={25}
                  />
                  <BreakdownBar
                    label="GTM"
                    value={result.scoreBreakdown.gtm}
                    max={20}
                  />
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                Analyse le{' '}
                {new Date(result.analyzedAt).toLocaleString('fr-FR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
