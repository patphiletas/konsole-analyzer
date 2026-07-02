export interface ScoringInput {
  estimatedSize: string
  industry: string
  techStack: string[]
  gtmSignals: string[]
}

export interface ScoreBreakdown {
  fitScore: number
  sizeScore: number
  industryScore: number
  techStackScore: number
  gtmScore: number
}

const HIGH_VALUE_TECH = [
  'react',
  'vue',
  'angular',
  'next.js',
  'svelte',
  'typescript',
  'node.js',
  'python',
  'django',
  'fastapi',
  'golang',
  'rust',
  'kubernetes',
  'docker',
  'graphql',
  'postgresql',
  'mongodb',
  'firebase',
  'aws',
  'gcp',
  'stripe',
  'segment',
  'mixpanel',
  'amplitude',
]

const HIGH_VALUE_INDUSTRIES = [
  'saas',
  'software',
  'fintech',
  'edtech',
  'healthtech',
  'proptech',
  'martech',
  'adtech',
  'analytics',
  'api',
]

const HIGH_VALUE_GTM = [
  'page de tarifs',
  'essai gratuit',
  'réservation démo',
  'inscription produit',
  'newsletter',
  'blog / ressources',
  'études de cas',
  'documentation',
  'intégrations',
  'api / webhooks',
  'webinar',
  'webhook',
]

function scoreSizeEstimate(size: string): number {
  const normalized = size.toLowerCase()
  if (normalized.includes('enterprise')) return 25
  if (normalized.includes('scale-up') || normalized.includes('growth')) return 30
  if (normalized.includes('startup') || normalized.includes('small')) return 20
  return 15
}

function scoreIndustry(industry: string): number {
  const normalized = industry.toLowerCase()
  const matches = HIGH_VALUE_INDUSTRIES.filter(ind =>
    normalized.includes(ind),
  ).length
  return Math.min(30, matches * 10)
}

function scoreTechStack(stack: string[]): number {
  if (!stack || stack.length === 0) return 10
  const normalized = stack.map(t => t.toLowerCase())
  const matches = HIGH_VALUE_TECH.filter(tech =>
    normalized.some(t => t.includes(tech.split('.')[0])),
  ).length
  return Math.min(25, 5 + matches * 2)
}

function scoreGTMSignals(signals: string[]): number {
  if (!signals || signals.length === 0) return 10
  const normalized = signals.map(s => s.toLowerCase())
  const matches = HIGH_VALUE_GTM.filter(gtm =>
    normalized.some(s => s.includes(gtm.split(' ')[0])),
  ).length
  return Math.min(20, 5 + matches * 3)
}

export function calculateFitScore(input: ScoringInput): ScoreBreakdown {
  const sizeScore = scoreSizeEstimate(input.estimatedSize)
  const industryScore = scoreIndustry(input.industry)
  const techStackScore = scoreTechStack(input.techStack)
  const gtmScore = scoreGTMSignals(input.gtmSignals)

  const fitScore = sizeScore + industryScore + techStackScore + gtmScore

  return {
    fitScore: Math.min(100, fitScore),
    sizeScore,
    industryScore,
    techStackScore,
    gtmScore,
  }
}

function scoreLevel(score: number): string {
  if (score >= 75) return 'profil excellent'
  if (score >= 55) return 'bon profil'
  if (score >= 35) return 'compte à qualifier'
  return 'profil faible'
}

function formatList(values: string[], fallback: string): string {
  if (!values.length) return fallback
  return values.slice(0, 4).join(', ')
}

export function generateExplanation(
  breakdown: ScoreBreakdown,
  input?: ScoringInput,
): string {
  const reasons = [
    `Score ${breakdown.fitScore}/100 (${scoreLevel(breakdown.fitScore)})`,
    `taille ${breakdown.sizeScore}/30`,
    `secteur ${breakdown.industryScore}/30`,
    `stack ${breakdown.techStackScore}/25`,
    `GTM ${breakdown.gtmScore}/20`,
  ]

  if (input) {
    const details = [
      input.industry !== 'Unknown'
        ? `secteur détecté: ${input.industry}`
        : 'secteur peu explicite',
      input.estimatedSize !== 'Unknown'
        ? `taille estimée: ${input.estimatedSize}`
        : 'taille difficile à estimer',
      `stack observée: ${formatList(input.techStack, 'aucune stack forte')}`,
      `signaux GTM: ${formatList(input.gtmSignals, 'peu de signaux visibles')}`,
    ]

    return `${reasons.join(' | ')}. ${details.join('. ')}.`
  }

  if (breakdown.sizeScore >= 25) {
    reasons.push('taille intéressante')
  }
  if (breakdown.industryScore >= 30) {
    reasons.push('secteur très proche SaaS/tech')
  }
  if (breakdown.techStackScore >= 20) {
    reasons.push('stack moderne')
  }
  if (breakdown.gtmScore >= 15) {
    reasons.push('signaux GTM forts')
  }

  return reasons.join('. ') + '.'
}
