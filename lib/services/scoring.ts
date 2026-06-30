export interface ScoringInput {
  estimatedSize: string
  industry: string
  techStack: string[]
  gtmSignals: string[]
}

interface ScoreBreakdown {
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
  'pricing page',
  'free trial',
  'demo booking',
  'newsletter',
  'blog',
  'documentation',
  'webinar',
  'case study',
  'integration',
  'api documentation',
  'rest api',
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

export function generateExplanation(breakdown: ScoreBreakdown): string {
  const reasons = []

  if (breakdown.sizeScore >= 25) {
    reasons.push('Enterprise target detected')
  }
  if (breakdown.industryScore >= 30) {
    reasons.push('High-value industry (SaaS/fintech/etc)')
  }
  if (breakdown.techStackScore >= 20) {
    reasons.push('Modern tech stack indicates growth-stage company')
  }
  if (breakdown.gtmScore >= 15) {
    reasons.push('Strong GTM signals (pricing, demo, etc)')
  }

  if (reasons.length === 0) {
    return 'Limited GTM signals detected. Company may be early-stage or B2C focused.'
  }

  return reasons.join('. ') + '.'
}
