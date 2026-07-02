import type { ScoreBreakdown } from '@/lib/types'
import { BreakdownBar } from './BreakdownBar'

function scoreLabel(score: number): string {
  if (score >= 75) return 'Profil excellent'
  if (score >= 55) return 'Bon profil'
  if (score >= 35) return 'À qualifier'
  return 'Profil faible'
}

function scoreTone(score: number): string {
  if (score >= 75) return 'bg-emerald-600'
  if (score >= 55) return 'bg-blue-600'
  if (score >= 35) return 'bg-amber-500'
  return 'bg-rose-600'
}

export function ScoreCard({ fitScore, explanation, scoreBreakdown, analyzedAt }: {
  fitScore: number
  explanation: string
  scoreBreakdown: ScoreBreakdown
  analyzedAt: string
}) {
  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-500">Score SaaS B2B</p>
          <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${scoreTone(fitScore)}`}>
            {scoreLabel(fitScore)}
          </span>
        </div>
        <p className="mt-4 text-6xl font-semibold tracking-tight text-zinc-950">
          {fitScore}
          <span className="text-2xl text-zinc-400">/100</span>
        </p>
        <p className="mt-4 leading-6 text-zinc-600">{explanation}</p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-zinc-950">Détail du score</h3>
        <div className="mt-5 space-y-4">
          <BreakdownBar label="Taille" value={scoreBreakdown.size} max={30} />
          <BreakdownBar label="Secteur" value={scoreBreakdown.industry} max={30} />
          <BreakdownBar label="Stack" value={scoreBreakdown.techStack} max={25} />
          <BreakdownBar label="Signaux GTM" value={scoreBreakdown.gtm} max={20} />
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Analyse le{' '}
        {new Date(analyzedAt).toLocaleString('fr-FR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
    </>
  )
}
