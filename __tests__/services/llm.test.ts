import { describe, it, expect } from 'vitest'
import { scrubHtmlForLlm } from '@/lib/services/llm'

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
