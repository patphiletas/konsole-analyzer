import { describe, it, expect } from 'vitest'
import { buildFaviconUrl, buildScreenshotUrl, resolveFaviconUrl } from '@/lib/utils'

describe('buildFaviconUrl', () => {
  it('construit l\'URL Google favicon avec le domaine', () => {
    expect(buildFaviconUrl('stripe.com')).toBe(
      'https://www.google.com/s2/favicons?domain=stripe.com&sz=128',
    )
  })
})

describe('buildScreenshotUrl', () => {
  it('construit l\'URL Thum.io sans encoder le domaine', () => {
    expect(buildScreenshotUrl('stripe.com')).toBe(
      'https://image.thum.io/get/width/1280/crop/800/https://stripe.com',
    )
  })

  it('ne encode pas les slashes (regression bug #7)', () => {
    const url = buildScreenshotUrl('stripe.com')
    expect(url).not.toContain('%3A')
    expect(url).not.toContain('%2F')
  })
})

describe('resolveFaviconUrl', () => {
  it('retourne le fallback si favicon absent', () => {
    expect(resolveFaviconUrl(undefined, 'stripe.com', 'https://fallback.com/icon.png'))
      .toBe('https://fallback.com/icon.png')
  })

  it('résout un favicon relatif en URL absolue', () => {
    expect(resolveFaviconUrl('/favicon.ico', 'stripe.com', 'fallback'))
      .toBe('https://stripe.com/favicon.ico')
  })

  it('retourne un favicon absolu tel quel', () => {
    expect(resolveFaviconUrl('https://cdn.stripe.com/favicon.ico', 'stripe.com', 'fallback'))
      .toBe('https://cdn.stripe.com/favicon.ico')
  })

  it('retourne le fallback si le protocole n\'est pas http/https', () => {
    expect(resolveFaviconUrl('javascript:alert(1)', 'stripe.com', 'https://fallback.com/icon.png'))
      .toBe('https://fallback.com/icon.png')
  })
})
