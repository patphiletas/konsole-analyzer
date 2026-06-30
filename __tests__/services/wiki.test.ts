import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupCompanyWiki } from '@/lib/services/wiki'

const SUMMARY_RESPONSE = {
  extract: 'Stripe, Inc. is an American financial services company founded in 2010.',
  thumbnail: { source: 'https://upload.wikimedia.org/stripe.png' },
  content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Stripe_(company)' } },
}

const WIKIDATA_CLAIMS = {
  entities: {
    Q1283921: {
      claims: {
        P112: [{ mainsnak: { datavalue: { type: 'wikibase-entityid', value: { id: 'Q100' } } } }],
        P169: [{ mainsnak: { datavalue: { type: 'wikibase-entityid', value: { id: 'Q101' } } } }],
        P571: [{ mainsnak: { datavalue: { type: 'time', value: { time: '+2010-09-01T00:00:00Z' } } } }],
      },
    },
  },
}

const WIKIDATA_LABELS = {
  entities: {
    Q100: { labels: { en: { value: 'Patrick Collison' }, fr: { value: 'Patrick Collison' } } },
    Q101: { labels: { en: { value: 'Patrick Collison' } } },
  },
}

function buildMockFetch(responses: Record<string, unknown>) {
  return vi.fn().mockImplementation((url: string) => {
    const urlStr = url.toString()
    for (const [pattern, body] of Object.entries(responses)) {
      if (urlStr.includes(pattern)) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
      }
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve(null) })
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('lookupCompanyWiki', () => {
  it('retourne always un logoUrl Clearbit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(null) }))
    const result = await lookupCompanyWiki('Unknown Corp', 'unknowncorp.io')
    expect(result.logoUrl).toBe('https://www.google.com/s2/favicons?domain=unknowncorp.io&sz=128')
  })

  it('retourne found: false si Wikipedia ne trouve rien', async () => {
    vi.stubGlobal(
      'fetch',
      buildMockFetch({
        'list=search': { query: { search: [] } },
      }),
    )
    const result = await lookupCompanyWiki('Unknown Corp', 'unknowncorp.io')
    expect(result.found).toBe(false)
    expect(result.wikiUrl).toBeUndefined()
  })

  it('retourne les données Wikipedia si Wikidata absent', async () => {
    vi.stubGlobal(
      'fetch',
      buildMockFetch({
        'list=search': { query: { search: [{ title: 'Stripe (company)' }] } },
        'rest_v1/page/summary': SUMMARY_RESPONSE,
        'prop=pageprops': { query: { pages: { '1': { pageprops: {} } } } },
      }),
    )
    const result = await lookupCompanyWiki('Stripe', 'stripe.com')
    expect(result.found).toBe(true)
    expect(result.wikiUrl).toBe('https://en.wikipedia.org/wiki/Stripe_(company)')
    expect(result.summary).toContain('Stripe')
    expect(result.thumbnail).toBe('https://upload.wikimedia.org/stripe.png')
    expect(result.founder).toBeUndefined()
  })

  it('retourne fondateur, CEO et année de création depuis Wikidata', async () => {
    vi.stubGlobal(
      'fetch',
      buildMockFetch({
        'list=search': { query: { search: [{ title: 'Stripe (company)' }] } },
        'rest_v1/page/summary': SUMMARY_RESPONSE,
        'prop=pageprops': { query: { pages: { '1': { pageprops: { wikibase_item: 'Q1283921' } } } } },
        'wbgetentities&ids=Q1283921': WIKIDATA_CLAIMS,
        'wbgetentities&ids=Q100': WIKIDATA_LABELS,
      }),
    )
    const result = await lookupCompanyWiki('Stripe', 'stripe.com')
    expect(result.found).toBe(true)
    expect(result.founded).toBe('2010')
    expect(result.founder).toBe('Patrick Collison')
    expect(result.ceo).toBe('Patrick Collison')
  })

  it('tronque le résumé à 400 caractères', async () => {
    const longSummary = { ...SUMMARY_RESPONSE, extract: 'A'.repeat(600) }
    vi.stubGlobal(
      'fetch',
      buildMockFetch({
        'list=search': { query: { search: [{ title: 'AcmeCorp' }] } },
        'rest_v1/page/summary': longSummary,
        'prop=pageprops': { query: { pages: { '1': { pageprops: {} } } } },
      }),
    )
    const result = await lookupCompanyWiki('AcmeCorp', 'acmecorp.com')
    expect(result.summary?.length).toBeLessThanOrEqual(400)
  })

  it('gère les erreurs réseau sans planter', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
    const result = await lookupCompanyWiki('Stripe', 'stripe.com')
    expect(result.found).toBe(false)
    expect(result.logoUrl).toBe('https://www.google.com/s2/favicons?domain=stripe.com&sz=128')
  })

  it('extrait l\'année depuis un timestamp Wikidata avec précision mois', async () => {
    const claimsWithMonth = {
      entities: {
        Q999: {
          claims: {
            P571: [{ mainsnak: { datavalue: { type: 'time', value: { time: '+2015-03-01T00:00:00Z' } } } }],
          },
        },
      },
    }
    vi.stubGlobal(
      'fetch',
      buildMockFetch({
        'list=search': { query: { search: [{ title: 'Linear (software)' }] } },
        'rest_v1/page/summary': SUMMARY_RESPONSE,
        'prop=pageprops': { query: { pages: { '1': { pageprops: { wikibase_item: 'Q999' } } } } },
        'wbgetentities&ids=Q999': claimsWithMonth,
        'wbgetentities&ids=': { entities: {} },
      }),
    )
    const result = await lookupCompanyWiki('Linear', 'linear.app')
    expect(result.founded).toBe('2015')
  })
})
