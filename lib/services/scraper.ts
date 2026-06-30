import { AppError, ErrorType } from '../errors'

export interface ScrapedData {
  title: string
  description: string
  keywords: string[]
  scripts: string[]
  favicon?: string
  favicon64?: string
  html: string
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

    const descMatch = html.match(
      /<meta\s+name="description"\s+content="([^"]+)"/i,
    )
    const description = descMatch ? descMatch[1] : ''

    const keywordsMatch = html.match(
      /<meta\s+name="keywords"\s+content="([^"]+)"/i,
    )
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : []

    const scriptMatches = html.match(/<script[^>]*src="([^"]+)"[^>]*>/gi) || []
    const scripts = scriptMatches
      .map(s => {
        const match = s.match(/src="([^"]+)"/i)
        return match ? match[1] : ''
      })
      .filter(Boolean)

    const faviconMatch = html.match(
      /<link[^>]*rel="(?:icon|shortcut icon)"[^>]*href="([^"]+)"/i,
    )
    const favicon = faviconMatch ? faviconMatch[1] : undefined

    return {
      title,
      description,
      keywords,
      scripts,
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
