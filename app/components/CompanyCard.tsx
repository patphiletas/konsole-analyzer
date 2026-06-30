import type { Enrichment } from '@/lib/types'

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
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={enrichment.logoUrl}
              alt={companyName}
              className="mt-1 h-10 w-10 shrink-0 rounded-lg border border-zinc-100 object-contain p-0.5"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div>
              <p className="break-all text-sm text-zinc-500">{url}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{companyName}</h2>
              <p className="mt-3 max-w-3xl leading-7 text-zinc-600">{description}</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600">
            {analysisSource}
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">Secteur</p>
            <p className="mt-1 font-medium text-zinc-950">{industry}</p>
          </div>
          <div className="rounded-md bg-zinc-50 p-4">
            <p className="text-sm text-zinc-500">Taille estimée</p>
            <p className="mt-1 font-medium text-zinc-950">{estimatedSize}</p>
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
