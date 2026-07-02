'use client'

import { useEffect, useState } from 'react'
import type { ScoreBreakdown } from '@/lib/types'
import { BreakdownBar } from './BreakdownBar'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function scoreLabel(score: number): string {
  if (score >= 75) return 'Profil excellent'
  if (score >= 55) return 'Bon profil'
  if (score >= 35) return 'À qualifier'
  return 'Profil faible'
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10b981'
  if (score >= 55) return '#3b82f6'
  if (score >= 35) return '#f59e0b'
  return '#ef4444'
}

export function ScoreCard({
  fitScore,
  explanation,
  scoreBreakdown,
  analyzedAt,
}: {
  fitScore: number
  explanation: string
  scoreBreakdown: ScoreBreakdown
  analyzedAt: string
}) {
  const [offset, setOffset] = useState(CIRCUMFERENCE)

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(CIRCUMFERENCE * (1 - fitScore / 100))
    }, 50)
    return () => clearTimeout(t)
  }, [fitScore])

  const color = scoreColor(fitScore)
  const bullets = explanation.split('\n').filter(Boolean)

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-500">Score SaaS B2B</p>

        <div className="mt-4 flex flex-col items-center">
          <div className="relative">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
              <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e4e4e7" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-semibold text-zinc-950">{fitScore}</span>
              <span className="text-sm text-zinc-400">/100</span>
            </div>
          </div>
          <span
            className="mt-3 rounded-full px-3 py-1 text-sm font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {scoreLabel(fitScore)}
          </span>
        </div>

        {bullets.length > 0 && (
          <ul className="mt-5 space-y-2">
            {bullets.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                {line}
              </li>
            ))}
          </ul>
        )}
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
