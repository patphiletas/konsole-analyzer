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

function formatList(values: string[], limit = 4): string {
  return values.slice(0, limit).join(', ')
}

export function generateExplanation(
  breakdown: ScoreBreakdown,
  input?: ScoringInput,
): string {
  if (input) {
    return [
      input.industry !== 'Unknown'
        ? `Secteur : ${input.industry} (${breakdown.industryScore}/30)`
        : `Secteur peu identifiable (${breakdown.industryScore}/30)`,
      input.techStack.length > 0
        ? `Stack : ${formatList(input.techStack)} (${breakdown.techStackScore}/25)`
        : `Stack non concluante (${breakdown.techStackScore}/25)`,
      input.gtmSignals.length > 0
        ? `Signaux : ${formatList(input.gtmSignals)} (${breakdown.gtmScore}/20)`
        : `Peu de signaux commerciaux (${breakdown.gtmScore}/20)`,
      input.estimatedSize !== 'Unknown'
        ? `Taille : ${input.estimatedSize} (${breakdown.sizeScore}/30)`
        : `Taille difficile à estimer (${breakdown.sizeScore}/30)`,
    ].join('\n')
  }

  const lines: string[] = [`Score ${breakdown.fitScore}/100 · ${scoreLevel(breakdown.fitScore)}`]
  const qualifiers: string[] = []
  if (breakdown.sizeScore >= 25) qualifiers.push('taille intéressante')
  if (breakdown.industryScore >= 30) qualifiers.push('secteur très proche SaaS/tech')
  if (breakdown.techStackScore >= 20) qualifiers.push('stack moderne')
  if (breakdown.gtmScore >= 15) qualifiers.push('signaux GTM forts')
  if (qualifiers.length > 0) lines.push(qualifiers.join(', '))

  return lines.join('\n')
}
