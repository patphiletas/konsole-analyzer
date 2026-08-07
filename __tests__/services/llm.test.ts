import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrubHtmlForLlm, analyzeWebsiteWithLLM } from '@/lib/services/llm'
import { fetchPageText } from '@/lib/services/scraper'

vi.mock('@/lib/services/scraper', () => ({
  fetchPageText: vi.fn(),
}))

describe('scrubHtmlForLlm — S8 PII et surface d\'attaque', () => {
  it('supprime les commentaires HTML', () => {
    const result = scrubHtmlForLlm('<!-- secret token: abc123 --><p>Hello</p>')
    expect(result).not.toContain('secret token')
    expect(result).toContain('<p>Hello</p>')
  })

  it('supprime les scripts inline', () => {
    const result = scrubHtmlForLlm('<script>var key="sk-123"</script><p>Content</p>')
    expect(result).not.toContain('sk-123')
    expect(result).toContain('<p>Content</p>')
  })

  it('redacte les adresses email', () => {
    const result = scrubHtmlForLlm('<p>Contact: john.doe@company.com for support</p>')
    expect(result).not.toContain('john.doe@company.com')
    expect(result).toContain('[email]')
  })

  it('redacte les numéros de téléphone', () => {
    const result = scrubHtmlForLlm('<p>Call us: +33 1 23 45 67 89</p>')
    expect(result).not.toContain('+33 1 23 45 67 89')
    expect(result).toContain('[phone]')
  })

  it('tronque à 5000 caractères', () => {
    const result = scrubHtmlForLlm('x'.repeat(10_000))
    expect(result.length).toBeLessThanOrEqual(5000)
  })

  it('préserve le texte marketing sans PII', () => {
    const result = scrubHtmlForLlm('<h1>The best CRM for sales teams</h1>')
    expect(result).toContain('The best CRM for sales teams')
  })
})

// ─── S15 — boucle agentique (tool-use fetch_page) ─────────────────────────────

function groqMessage(body: object): Response {
  return new Response(JSON.stringify({ choices: [{ message: body }] }), { status: 200 })
}

const FINAL_JSON = {
  companyName: 'Acme',
  industry: 'SaaS',
  estimatedSize: 'startup',
  techStack: ['React'],
  gtmSignals: ['Pricing page'],
  description: 'Acme sells widgets.',
}

describe('analyzeWebsiteWithLLM — agent loop', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.mocked(fetchPageText).mockReset()
  })

  afterEach(() => {
    delete process.env.GROQ_API_KEY
    vi.restoreAllMocks()
  })

  it("répond directement sans appeler fetch_page quand la homepage suffit", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      groqMessage({ role: 'assistant', content: JSON.stringify(FINAL_JSON) }),
    ))

    const result = await analyzeWebsiteWithLLM('<html></html>', 'Acme', 'desc', [], 'https://acme.com')

    expect(fetchPageText).not.toHaveBeenCalled()
    expect(result.companyName).toBe('Acme')
    expect(result.pagesExplored).toBeUndefined()
  })

  it('appelle fetch_page puis produit le JSON final avec pagesExplored', async () => {
    vi.mocked(fetchPageText).mockResolvedValueOnce({ path: '/pricing', text: 'Plans start at $99/mo' })

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(groqMessage({
        role: 'assistant',
        content: null,
        tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_page', arguments: JSON.stringify({ path: '/pricing' }) } }],
      }))
      .mockResolvedValueOnce(groqMessage({ role: 'assistant', content: JSON.stringify(FINAL_JSON) })),
    )

    const result = await analyzeWebsiteWithLLM('<html></html>', 'Acme', 'desc', [], 'https://acme.com')

    expect(fetchPageText).toHaveBeenCalledWith('https://acme.com', '/pricing')
    expect(result.pagesExplored).toEqual(['/pricing'])
  })

  it("plafonne à 2 appels d'outil même si le modèle en redemande", async () => {
    vi.mocked(fetchPageText)
      .mockResolvedValueOnce({ path: '/pricing', text: 'a' })
      .mockResolvedValueOnce({ path: '/about', text: 'b' })

    const toolCall = (id: string, path: string) => groqMessage({
      role: 'assistant',
      content: null,
      tool_calls: [{ id, type: 'function', function: { name: 'fetch_page', arguments: JSON.stringify({ path }) } }],
    })

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(toolCall('call_1', '/pricing'))
      .mockResolvedValueOnce(toolCall('call_2', '/about'))
      .mockResolvedValueOnce(groqMessage({ role: 'assistant', content: JSON.stringify(FINAL_JSON) })),
    )

    const result = await analyzeWebsiteWithLLM('<html></html>', 'Acme', 'desc', [], 'https://acme.com')

    expect(fetchPageText).toHaveBeenCalledTimes(2)
    expect(result.pagesExplored).toEqual(['/pricing', '/about'])
  })

  it("inclut le contexte ICP dans le prompt envoyé au LLM quand fourni", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce(
      groqMessage({ role: 'assistant', content: JSON.stringify(FINAL_JSON) }),
    )
    vi.stubGlobal('fetch', mockFetch)

    await analyzeWebsiteWithLLM('<html></html>', 'Acme', 'desc', [], 'https://acme.com', 'je vends du CRM à des agences')

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain('je vends du CRM à des agences')
  })
})
