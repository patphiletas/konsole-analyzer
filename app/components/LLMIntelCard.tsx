import type { LLMIntel } from '@/lib/types'

const SEGMENT_COLORS: Record<string, string> = {
  startup:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  SMB:         'bg-blue-50 text-blue-700 border-blue-200',
  'mid-market':'bg-violet-50 text-violet-700 border-violet-200',
  enterprise:  'bg-amber-50 text-amber-700 border-amber-200',
}

const MODEL_COLORS: Record<string, string> = {
  PLG:    'bg-sky-50 text-sky-700 border-sky-200',
  SLG:    'bg-orange-50 text-orange-700 border-orange-200',
  hybrid: 'bg-teal-50 text-teal-700 border-teal-200',
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</dt>
      <dd className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-sm text-zinc-700">
            {item}
          </span>
        ))}
      </dd>
    </div>
  )
}

export function LLMIntelCard({ llmIntel }: { llmIntel: LLMIntel }) {
  const { targetSegment, salesModel, targetPersona, tractionSignals, competitors, fundingSignals } = llmIntel

  const hasBadges = targetSegment || salesModel || targetPersona
  const hasLists = tractionSignals?.length || competitors?.length || fundingSignals?.length

  if (!hasBadges && !hasLists) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">Analyse IA</h3>

      {hasBadges && (
        <div className="mt-3 flex flex-wrap gap-2">
          {targetSegment && (
            <Badge
              label={`Segment : ${targetSegment}`}
              colorClass={SEGMENT_COLORS[targetSegment] ?? 'bg-zinc-50 text-zinc-700 border-zinc-200'}
            />
          )}
          {salesModel && (
            <Badge
              label={`Vente : ${salesModel}`}
              colorClass={MODEL_COLORS[salesModel] ?? 'bg-zinc-50 text-zinc-700 border-zinc-200'}
            />
          )}
          {targetPersona && (
            <Badge
              label={`Persona : ${targetPersona}`}
              colorClass="bg-zinc-100 text-zinc-700 border-zinc-200"
            />
          )}
        </div>
      )}

      {hasLists && (
        <dl className="mt-4 space-y-3">
          <Section title="Signaux de traction" items={tractionSignals ?? []} />
          <Section title="Concurrents mentionnés" items={competitors ?? []} />
          <Section title="Financement" items={fundingSignals ?? []} />
        </dl>
      )}
    </div>
  )
}
