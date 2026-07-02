import { AppError, ErrorType } from '../errors'

export interface FooterLink {
  name: string
  url: string
}

export interface FooterSignals {
  copyrightYear?: string
  foundedYear?: string
  socialLinks: FooterLink[]
  notableLinks: FooterLink[]
  certifications: string[]
  legalForm?: string
  headquarters?: string
}

export interface ScrapedData {
  title: string
  description: string
  keywords: string[]
  scripts: string[]
  links: string[]
  favicon?: string
  favicon64?: string
  html: string
  footerSignals: FooterSignals
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function getMetaContent(html: string, name: string): string {
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["'][^>]*>`,
      'i',
    ),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtml(match[1].trim())
  }

  return ''
}

function extractFooterHtml(html: string): string {
  const footerTag = html.match(/<footer[\s\S]*?<\/footer>/i)
  if (footerTag) return footerTag[0]
  const divFooter = html.match(/<(?:div|section)[^>]+(?:id|class)=["'][^"']*footer[^"']*["'][^>]*>[\s\S]{0,3000}/i)
  if (divFooter) return divFooter[0]
  return html.slice(Math.floor(html.length * 0.85))
}

const SOCIAL_PATTERNS: Array<[string, RegExp]> = [
  ['LinkedIn', /linkedin\.com/i],
  ['Twitter / X', /twitter\.com|x\.com/i],
  ['YouTube', /youtube\.com/i],
  ['GitHub', /github\.com/i],
  ['Facebook', /facebook\.com/i],
  ['Instagram', /instagram\.com/i],
]

const NOTABLE_PATTERNS: Array<[string, RegExp]> = [
  ['Carrières', /careers\.|jobs\.|\/careers|\/jobs/i],
  ['Presse', /\/press|\/media|\/newsroom/i],
  ['App Store', /apps\.apple\.com/i],
  ['Google Play', /play\.google\.com/i],
  ['Status', /status\./i],
]

const CERT_PATTERNS: Array<[string, RegExp]> = [
  ['SOC 2', /soc\s*2/i],
  ['ISO 27001', /iso\s*27001/i],
  ['GDPR', /gdpr/i],
  ['HIPAA', /hipaa/i],
  ['PCI DSS', /pci[\s-]?dss/i],
  ['FedRAMP', /fedramp/i],
]

function extractLinksFromHtml(html: string): Array<{ href: string }> {
  const matches = html.match(/<a[^>]+href=["']([^"'#][^"']*)["'][^>]*>/gi) || []
  return matches.flatMap((tag) => {
    const m = tag.match(/href=["']([^"']+)["']/i)
    return m ? [{ href: decodeHtml(m[1]) }] : []
  })
}

function parseFooterSignals(html: string): FooterSignals {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const anchors = extractLinksFromHtml(html)

  const rangeMatch = text.match(/©\s*(\d{4})\s*[–\-]\s*(\d{4})/)
  const singleMatch = !rangeMatch ? text.match(/©\s*(\d{4})/) : null
  const foundedYear    = rangeMatch?.[1]
  const copyrightYear  = rangeMatch ? rangeMatch[2] : singleMatch?.[1]

  const socialLinks: FooterLink[] = []
  for (const [name, regex] of SOCIAL_PATTERNS) {
    const found = anchors.find((a) => regex.test(a.href))
    if (found) socialLinks.push({ name, url: found.href })
  }

  const notableLinks: FooterLink[] = []
  for (const [name, regex] of NOTABLE_PATTERNS) {
    const found = anchors.find((a) => regex.test(a.href))
    if (found) notableLinks.push({ name, url: found.href })
  }

  const certifications = CERT_PATTERNS.filter(([, r]) => r.test(text)).map(([name]) => name)

  const legalMatch = text.match(/\b(inc\.?|s\.a\.s\.?|sarl|ltd\.?|llc|gmbh|b\.v\.?|s\.r\.l\.?)\b/i)
  const legalForm = legalMatch?.[1]

  const hqMatch = text.match(/(?:headquartered in|headquarters[:\s]+|based in)\s+([A-Z][a-z]+(?:[\s,]+[A-Z][a-z]+)*)/i)
  const headquarters = hqMatch?.[1]?.trim()

  return { copyrightYear, foundedYear, socialLinks, notableLinks, certifications, legalForm, headquarters }
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new AppError(
        ErrorType.FETCH_FAILED,
        `Failed to fetch ${url}: ${response.status}`,
        response.status,
      )
    }

    const html = await response.text()

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const description = getMetaContent(html, 'description')

    const keywords = getMetaContent(html, 'keywords')
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)

    const scriptMatches =
      html.match(/<script[^>]*src=["'][^"']+["'][^>]*>/gi) || []
    const scripts = scriptMatches
      .map((script) => {
        const match = script.match(/src=["']([^"']+)["']/i)
        return match ? match[1] : ''
      })
      .filter(Boolean)

    const linkMatches = html.match(/<a[^>]*href=["'][^"']+["'][^>]*>/gi) || []
    const links = Array.from(
      new Set(
        linkMatches
          .map((link) => {
            const match = link.match(/href=["']([^"']+)["']/i)
            return match ? decodeHtml(match[1].trim()) : ''
          })
          .filter(Boolean),
      ),
    ).slice(0, 80)

    const faviconMatch = html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*href=["']([^"']+)["']/i,
    )
    const favicon = faviconMatch ? faviconMatch[1] : undefined

    const footerSignals = parseFooterSignals(extractFooterHtml(html))

    return {
      title,
      description,
      keywords,
      scripts,
      links,
      favicon,
      html: html.substring(0, 50000),
      footerSignals,
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(
      ErrorType.FETCH_FAILED,
      `Failed to scrape ${url}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
