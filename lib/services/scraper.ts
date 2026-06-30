import { AppError, ErrorType } from '../errors'

export interface ScrapedData {
  title: string
  description: string
  keywords: string[]
  scripts: string[]
  links: string[]
  favicon?: string
  favicon64?: string
  html: string
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

    return {
      title,
      description,
      keywords,
      scripts,
      links,
      favicon,
      html: html.substring(0, 50000),
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(
      ErrorType.FETCH_FAILED,
      `Failed to scrape ${url}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
