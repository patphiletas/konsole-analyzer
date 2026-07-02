import { describe, it, expect } from 'vitest'
import { calculateFitScore, generateExplanation } from '@/lib/services/scoring'

describe('Scoring', () => {
  it('should calculate high fit score for enterprise SaaS', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'enterprise',
      industry: 'SaaS',
      techStack: ['React', 'TypeScript', 'Next.js', 'Stripe'],
      gtmSignals: ['pricing page', 'free trial', 'documentation'],
    })

    expect(breakdown.fitScore).toBeGreaterThan(50)
    expect(breakdown.sizeScore).toBe(25)
  })

  it('should calculate low fit score for B2C early-stage', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'startup',
      industry: 'Consumer',
      techStack: [],
      gtmSignals: [],
    })

    expect(breakdown.fitScore).toBeLessThanOrEqual(40)
  })

  it('should recognize high-value industries', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'scale-up',
      industry: 'fintech',
      techStack: ['Python', 'PostgreSQL'],
      gtmSignals: ['api documentation'],
    })

    expect(breakdown.industryScore).toBeGreaterThanOrEqual(10)
  })

  it('should recognize high-value tech stack', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'startup',
      industry: 'Unknown',
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
      gtmSignals: [],
    })

    expect(breakdown.techStackScore).toBeGreaterThanOrEqual(15)
  })

  it('should recognize GTM signals', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'startup',
      industry: 'Unknown',
      techStack: [],
      gtmSignals: [
        'pricing page',
        'free trial',
        'demo booking',
        'webhook',
      ],
    })

    expect(breakdown.gtmScore).toBeGreaterThan(10)
  })

  it('should generate appropriate explanation for high score', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'enterprise',
      industry: 'SaaS',
      techStack: ['React', 'Next.js'],
      gtmSignals: ['pricing page', 'demo booking'],
    })

    const explanation = generateExplanation(breakdown)
    expect(explanation).toContain('·')
    expect(explanation.length).toBeGreaterThan(10)
  })

  it('should explain score with detected business context', () => {
    const input = {
      estimatedSize: 'scale-up',
      industry: 'SaaS / Software',
      techStack: ['Next.js', 'Stripe'],
      gtmSignals: ['Page de tarifs', 'Réservation démo'],
    }
    const breakdown = calculateFitScore(input)

    const explanation = generateExplanation(breakdown, input)

    expect(explanation).toContain('SaaS / Software')
    expect(explanation).toContain('Next.js, Stripe')
    expect(explanation).toContain('Page de tarifs, Réservation démo')
  })

  it('should cap score at 100', () => {
    const breakdown = calculateFitScore({
      estimatedSize: 'enterprise',
      industry: 'SaaS',
      techStack: [
        'React',
        'Vue',
        'Angular',
        'Node.js',
        'Python',
        'PostgreSQL',
        'MongoDB',
      ],
      gtmSignals: [
        'pricing',
        'trial',
        'demo',
        'newsletter',
        'blog',
        'api',
      ],
    })

    expect(breakdown.fitScore).toBeLessThanOrEqual(100)
  })
})
