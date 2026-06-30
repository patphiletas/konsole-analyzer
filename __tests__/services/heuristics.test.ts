import { describe, expect, it } from 'vitest'
import { analyzeWebsiteWithHeuristics } from '@/lib/services/heuristics'

describe('Heuristic website analysis', () => {
  it('detects company, GTM signals, stack, industry and size from public HTML', () => {
    const analysis = analyzeWebsiteWithHeuristics(
      {
        title: 'Acme Revenue Platform | Modern sales automation',
        description:
          'SaaS platform for sales teams with API, integrations and enterprise plans.',
        keywords: ['sales', 'automation', 'saas'],
        scripts: [
          '/_next/static/chunks/app.js',
          'https://js.stripe.com/v3',
          'https://js.hsforms.net/forms/embed.js',
        ],
        links: ['/pricing', '/book-a-demo', '/docs/api', '/customers'],
        html: '<main>Start free trial and contact sales for enterprise teams.</main>',
      },
      'https://acme.example',
    )

    expect(analysis.companyName).toBe('Acme Revenue Platform')
    expect(analysis.industry).toBe('SaaS / Software')
    expect(analysis.estimatedSize).toBe('enterprise')
    expect(analysis.techStack).toEqual(
      expect.arrayContaining([
        { name: 'Next.js', confidence: 'high' },
        { name: 'Stripe', confidence: 'high' },
        { name: 'HubSpot', confidence: 'high' },
      ]),
    )
    expect(analysis.gtmSignals).toEqual(
      expect.arrayContaining(['Pricing page', 'Demo booking', 'Free trial']),
    )
  })
})
