import { describe, expect, it } from 'vitest'
import { analyzeWebsiteWithHeuristics, estimateCompanyName } from '@/lib/services/heuristics'

const makeScraped = (title: string) => ({
  title,
  description: '',
  keywords: [],
  scripts: [],
  links: [],
  html: '',
  footerSignals: { socialLinks: [], notableLinks: [], certifications: [] },
})

describe('estimateCompanyName', () => {
  it('extrait le nom avant le séparateur pipe', () => {
    expect(estimateCompanyName(makeScraped('Stripe | Financial Infrastructure'), 'https://stripe.com'))
      .toBe('Stripe')
  })
  it('extrait le nom avant le tiret', () => {
    expect(estimateCompanyName(makeScraped('Linear – Plan and build great products'), 'https://linear.app'))
      .toBe('Linear')
  })
  it('extrait le nom avant les deux-points', () => {
    expect(estimateCompanyName(makeScraped('HubSpot: CRM, Marketing & Sales Software'), 'https://hubspot.com'))
      .toBe('HubSpot')
  })
  it('utilise le hostname si le titre est absent', () => {
    expect(estimateCompanyName(makeScraped(''), 'https://notion.so'))
      .toBe('Notion')
  })
  it('évite les sous-domaines — app.hubspot.com donne Hubspot', () => {
    expect(estimateCompanyName(makeScraped(''), 'https://app.hubspot.com'))
      .toBe('Hubspot')
  })
})

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
        footerSignals: { socialLinks: [], notableLinks: [], certifications: [] },
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
      expect.arrayContaining(['Page de tarifs', 'Réservation démo', 'Essai gratuit']),
    )
  })
})
