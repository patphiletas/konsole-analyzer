import type { Enrichment } from '@/lib/types'

const SIZE_FR: Record<string, string> = {
  enterprise:      'Grands comptes',
  'scale-up':      'Scale-up',
  'startup / smb': 'Startup / PME',
  startup:         'Startup',
}

function displaySize(size: string): string {
  return SIZE_FR[size.toLowerCase()] ?? size
}

export function CompanyCard({ companyName, url, description, industry, estimatedSize, enrichment, analysisSource }: {
  companyName: string
  url: string
  description: string
  industry: string
  estimatedSize: string
  enrichment: Enrichment
  analysisSource: string
}) {
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-4">
          <img
            src={enrichment.logoUrl}
            alt={companyName}
            className="h-16 w-16 shrink-0 rounded-xl border border-zinc-200 bg-white object-contain p-1"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-zinc-500">{url}</p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-zinc-950">{companyName}</h2>
          </div>
          <span className="shrink-0 rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600">
            {analysisSource}
          </span>
        </div>
        <div className="p-5">
          <p className="max-w-3xl wrap-break-word leading-7 text-zinc-600">{description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Secteur</p>
              <p className="mt-1 font-medium text-zinc-950">{industry === 'Unknown' ? '—' : industry}</p>
            </div>
            <div className="rounded-md bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Taille estimée</p>
              <p className="mt-1 font-medium text-zinc-950">{displaySize(estimatedSize)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto rounded-lg border border-zinc-200 bg-white" style={{ maxHeight: '220px' }}>
        <img
          src={enrichment.screenshotUrl}
          alt={`Aperçu de ${companyName}`}
          className="w-full"
          onError={(e) => { e.currentTarget.parentElement!.style.display = 'none' }}
        />
      </div>
    </>
  )
}
