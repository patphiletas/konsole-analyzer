'use client'

import { useState } from 'react'
import type { AnalysisResult } from '@/lib/types'

type Tab = 'stack' | 'signaux' | 'donnees' | 'ia'
import { CompanyCard } from './CompanyCard'
import { EnrichmentCard } from './EnrichmentCard'
import { GtmCard } from './GtmCard'
import { DnsCard } from './DnsCard'
import { FooterCard } from './FooterCard'
import { TechStackCard } from './TechStackCard'
import { ScoreCard } from './ScoreCard'
import { LLMIntelCard } from './LLMIntelCard'

const examples = ['stripe.com', 'hubspot.com', 'linear.app']

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('stack')

  async function handleAnalyze(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setActiveTab('stack')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Analyse échouée')
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
              Intelligence commerciale B2B
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Kpratik
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
              Analyse un site web, extrait les signaux utiles pour une équipe
              sales/marketing, puis score le fit pour une offre vendue aux SaaS B2B.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <label htmlFor="url" className="text-sm font-medium text-zinc-800">
              Site à analyser
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
              ['1', 'Scraping', 'Titre, métas, scripts et liens publics.'],
              ['2', 'Classification', 'Secteur, taille, stack et signaux GTM.'],
              ['3', 'Scoring', 'Score SaaS B2B expliqué et actionnable.'],
            ].map(([step, title, copy]) => (
              <div key={step} className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {step}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-zinc-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
              </div>
            ))}
          </div>
        )}

        {result && (() => {
          const { footerSignals, enrichment } = result
          const hasPublicData =
            enrichment.found ||
            footerSignals.certifications.length > 0 ||
            footerSignals.socialLinks.length > 0 ||
            footerSignals.notableLinks.length > 0 ||
            !!footerSignals.copyrightYear ||
            !!footerSignals.legalForm ||
            !!footerSignals.headquarters

          const tabs: Array<{ id: Tab; label: string }> = [
            { id: 'stack',   label: 'Stack technique'  },
            { id: 'signaux', label: 'Signaux'           },
            ...(hasPublicData ? [{ id: 'donnees' as Tab, label: 'Données publiques' }] : []),
            ...(result.llmIntel ? [{ id: 'ia' as Tab, label: 'Analyse IA' }] : []),
          ]

          return (
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="min-w-0 space-y-5">
                <CompanyCard
                  companyName={result.companyName}
                  url={result.url}
                  description={result.description}
                  industry={result.industry}
                  estimatedSize={result.estimatedSize}
                  enrichment={result.enrichment}
                  analysisSource={result.analysisSource}
                />

                <div>
                  <div className="border-b border-zinc-200">
                    <nav className="-mb-px flex">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                            activeTab === tab.id
                              ? 'border-blue-600 text-blue-700'
                              : 'border-transparent text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-5 space-y-5">
                    {activeTab === 'stack' && (
                      <TechStackCard techStack={result.techStack} />
                    )}
                    {activeTab === 'signaux' && (
                      <>
                        <GtmCard gtmSignals={result.gtmSignals} />
                        <DnsCard emailProvider={result.emailProvider} dnsTools={result.dnsTools} />
                      </>
                    )}
                    {activeTab === 'donnees' && (
                      <>
                        <EnrichmentCard enrichment={result.enrichment} />
                        <FooterCard footerSignals={result.footerSignals} />
                      </>
                    )}
                    {activeTab === 'ia' && result.llmIntel && (
                      <LLMIntelCard llmIntel={result.llmIntel} />
                    )}
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <ScoreCard
                  fitScore={result.fitScore}
                  explanation={result.explanation}
                  scoreBreakdown={result.scoreBreakdown}
                  analyzedAt={result.analyzedAt}
                />
              </aside>
            </div>
          )
        })()}
      </section>
    </main>
  )
}
