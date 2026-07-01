import type { LLMIntel } from '@/lib/types'

const SEGMENT_LABELS: Record<string, { label: string; description: string; color: string }> = {
  startup:      { label: 'Startup',                   description: 'Jeunes entreprises en phase de lancement',         color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SMB:          { label: 'PME',                        description: 'Petites et moyennes entreprises',                  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'mid-market': { label: 'Entreprises en croissance',  description: 'Entre la PME et le grand compte (100–1 000 pers.)', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  enterprise:   { label: 'Grands comptes',             description: 'Grandes organisations, contrats complexes',        color: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const SALES_MODEL_LABELS: Record<string, { label: string; description: string; color: string }> = {
  PLG:    { label: 'Produit en avant',    description: 'L\'utilisateur s\'inscrit seul et découvre le produit',             color: 'bg-sky-50 text-sky-700 border-sky-200' },
  SLG:    { label: 'Vente commerciale',   description: 'Un commercial accompagne la vente (démo, contrat, négociation)',     color: 'bg-orange-50 text-orange-700 border-orange-200' },
  hybrid: { label: 'Modèle mixte',        description: 'Inscription libre + option vente directe pour les grands comptes',  color: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const PERSONA_LABELS: Record<string, string> = {
  developer:  'Développeurs',
  RevOps:     'Opérations commerciales',
  IT:         'Équipes IT',
  finance:    'Finance',
  marketing:  'Marketing',
  HR:         'Ressources humaines',
  sales:      'Équipe commerciale',
  other:      'Profil mixte',
}

function InfoBadge({ label, description, color }: { label: string; description: string; color: string }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${color}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs opacity-75">{description}</p>
    </div>
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

  const segmentInfo = targetSegment ? (SEGMENT_LABELS[targetSegment] ?? { label: targetSegment, description: '', color: 'bg-zinc-50 text-zinc-700 border-zinc-200' }) : null
  const salesInfo   = salesModel    ? (SALES_MODEL_LABELS[salesModel] ?? { label: salesModel,    description: '', color: 'bg-zinc-50 text-zinc-700 border-zinc-200' }) : null
  const personaLabel = targetPersona ? (PERSONA_LABELS[targetPersona] ?? targetPersona) : null

  const hasBadges = segmentInfo || salesInfo || personaLabel
  const hasLists  = tractionSignals?.length || competitors?.length || fundingSignals?.length

  if (!hasBadges && !hasLists) return null

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-zinc-950">Analyse IA</h3>
      <p className="mt-1 text-sm text-zinc-500">Déduit par lecture du site — à croiser avec d'autres sources.</p>

      {hasBadges && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {segmentInfo && (
            <InfoBadge
              label={`Cible : ${segmentInfo.label}`}
              description={segmentInfo.description}
              color={segmentInfo.color}
            />
          )}
          {salesInfo && (
            <InfoBadge
              label={salesInfo.label}
              description={salesInfo.description}
              color={salesInfo.color}
            />
          )}
          {personaLabel && (
            <InfoBadge
              label={`Acheteur : ${personaLabel}`}
              description="Profil principal visé par le site"
              color="bg-zinc-50 text-zinc-700 border-zinc-200"
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
