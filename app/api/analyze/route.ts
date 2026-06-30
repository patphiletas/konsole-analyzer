import { NextRequest } from 'next/server'
import { analyzeRequestSchema } from '@/lib/validation'
import {
  createSuccessResponse,
  createErrorResponse,
  toJsonResponse,
} from '@/lib/api-middleware'
import { handleError, AppError, isValidUrl, ErrorType } from '@/lib/errors'
import { scrapeWebsite } from '@/lib/services/scraper'
import { analyzeWebsiteWithLLM } from '@/lib/services/llm'
import { calculateFitScore, generateExplanation } from '@/lib/services/scoring'
import { analytics } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const validated = analyzeRequestSchema.parse(body)
    const url = validated.url.startsWith('http')
      ? validated.url
      : `https://${validated.url}`

    analytics.track({
      type: 'analyze_request',
      url,
    })

    if (!isValidUrl(url)) {
      throw new AppError(ErrorType.INVALID_URL, 'Invalid URL format', 400)
    }

    const scraped = await scrapeWebsite(url)
    const analysis = await analyzeWebsiteWithLLM(
      scraped.html,
      scraped.title,
      scraped.description,
      scraped.scripts,
    )

    const breakdown = calculateFitScore({
      estimatedSize: analysis.estimatedSize,
      industry: analysis.industry,
      techStack: analysis.techStack,
      gtmSignals: analysis.gtmSignals,
    })

    const duration = Date.now() - startTime

    analytics.track({
      type: 'analyze_success',
      url,
      duration,
    })

    return toJsonResponse(
      createSuccessResponse({
        url,
        companyName: analysis.companyName,
        description: analysis.description,
        techStack: analysis.techStack,
        gtmSignals: analysis.gtmSignals,
        fitScore: breakdown.fitScore,
        explanation: generateExplanation(breakdown),
        analyzedAt: new Date().toISOString(),
      }),
      200,
    )
  } catch (error) {
    const appError = handleError(error)
    const duration = Date.now() - startTime

    analytics.track({
      type: 'analyze_error',
      duration,
      error: appError.message,
    })

    return toJsonResponse(
      createErrorResponse(error),
      appError.statusCode,
    )
  }
}
