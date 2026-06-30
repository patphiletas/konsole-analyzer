import type { Enrichment } from '@/lib/types'

export function EnrichmentCard({ enrichment }: { enrichment: Enrichment }) {
  if (!enrichment.found) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-950">Données publiques</h3>
        {enrichment.wikiUrl && (
          <a href={enrichment.wikiUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline">
            Wikipedia →
          </a>
        )}
      </div>
      <dl className="mt-4 grid gap-2 sm:grid-cols-3">
        {enrichment.founded && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Fondée en</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{enrichment.founded}</dd>
          </div>
        )}
        {enrichment.founder && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Fondateur</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{enrichment.founder}</dd>
          </div>
        )}
        {enrichment.ceo && enrichment.ceo !== enrichment.founder && (
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-500">Dirigeant actuel</dt>
            <dd className="mt-0.5 font-medium text-zinc-950">{enrichment.ceo}</dd>
          </div>
        )}
      </dl>
      {enrichment.summary && (
        <p className="mt-4 text-sm leading-6 text-zinc-600">{enrichment.summary}</p>
      )}
    </div>
  )
}
