import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrapeWebsite, isPrivateIp } from '@/lib/services/scraper'

const HTML_MINIMAL = '<html><head><title>Example</title></head><body>ok</body></html>'

function makeResponse(body: string): Response {
  return new Response(body, { status: 200 })
}

// ─── isPrivateIp — couverture des plages (S7) ─────────────────────────────────

describe('isPrivateIp', () => {
  it.each([
    ['127.0.0.1', true],
    ['10.0.0.1', true],
    ['192.168.1.1', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['169.254.169.254', true],
    ['::1', true],
    ['fc00::1', true],
    ['93.184.216.34', false],
    ['172.32.0.1', false],
  ])('%s → %s', (ip, expected) => {
    expect(isPrivateIp(ip)).toBe(expected)
  })
})

// ─── S7 pré-check sans DNS ────────────────────────────────────────────────────

describe('S7 — SSRF : pré-check hostname (sans DNS)', () => {
  it('bloque localhost', async () => {
    await expect(scrapeWebsite('http://localhost/admin'))
      .rejects.toMatchObject({ type: 'INVALID_URL' })
  })

  it('bloque 0.0.0.0', async () => {
    await expect(scrapeWebsite('http://0.0.0.0/'))
      .rejects.toMatchObject({ type: 'INVALID_URL' })
  })

  it('bloque ::1 (IPv6 loopback)', async () => {
    await expect(scrapeWebsite('http://[::1]/'))
      .rejects.toMatchObject({ type: 'INVALID_URL' })
  })
})

// ─── S14 — Body borné à 500 KB ────────────────────────────────────────────────
// IP littérale (93.184.216.34 = example.com) : dns.lookup résout sans appel réseau.

describe('S14 — Body borné à 500 KB', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse(HTML_MINIMAL)))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('retourne le contenu complet sous la limite', async () => {
    const result = await scrapeWebsite('https://93.184.216.34')
    expect(result.title).toBe('Example')
  })

  it('tronque un body supérieur à 500 KB', async () => {
    const bigHtml = '<html><head><title>Big</title></head><body>' + 'x'.repeat(600_000) + '</body></html>'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse(bigHtml)))
    const result = await scrapeWebsite('https://93.184.216.34')
    expect(result.html.length).toBeLessThanOrEqual(500_000)
  })
})
