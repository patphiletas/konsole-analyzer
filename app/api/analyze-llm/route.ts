import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createSuccessResponse, createErrorResponse, toJsonResponse } from '@/lib/api-middleware'
import { handleError, AppError, isValidUrl, ErrorType } from '@/lib/errors'
import { ratelimit } from '@/lib/ratelimit'
import { scrapeWebsite } from '@/lib/services/scraper'
import { analyzeWebsiteWithLLM } from '@/lib/services/llm'
import { analytics } from '@/lib/analytics'

export const maxDuration = 20

const requestSchema = z.object({
  url: z.string().min(1),
  icp: z.string().trim().max(300).optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  if (ratelimit) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
    const { success, reset } = await ratelimit.limit(ip)
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return toJsonResponse(
        createErrorResponse(new AppError(ErrorType.RATE_LIMITED, 'Too many requests. Please retry later.', 429)),
        429,
        { 'Retry-After': String(retryAfter) },
      )
    }
  }

  try {
    const body = await request.json()
    const { url, icp } = requestSchema.parse(body)

    if (!isValidUrl(url)) {
      throw new AppError(ErrorType.INVALID_URL, 'Invalid URL format', 400)
    }

    if (!process.env.GROQ_API_KEY && !process.env.OPENROUTER_API_KEY) {
      throw new AppError(ErrorType.INTERNAL_ERROR, 'No LLM API key configured', 503)
    }

    analytics.track({ type: 'analyze_request', url })

    const scraped = await scrapeWebsite(url)
    const llmAnalysis = await analyzeWebsiteWithLLM(
      scraped.html,
      scraped.title,
      scraped.description,
      scraped.scripts,
      url,
      icp,
    )

    analytics.track({ type: 'analyze_success', url, duration: Date.now() - startTime })

    return toJsonResponse(
      createSuccessResponse({
        llmIntel: {
          targetSegment: llmAnalysis.targetSegment,
          salesModel: llmAnalysis.salesModel,
          targetPersona: llmAnalysis.targetPersona,
          tractionSignals: llmAnalysis.tractionSignals,
          competitors: llmAnalysis.competitors,
          fundingSignals: llmAnalysis.fundingSignals,
          pagesExplored: llmAnalysis.pagesExplored,
        },
        analysisSource: process.env.GROQ_API_KEY ? 'Groq + heuristiques' : 'LLM + heuristiques',
      }),
      200,
    )
  } catch (error) {
    const appError = handleError(error)
    analytics.track({
      type: 'analyze_error',
      duration: Date.now() - startTime,
      error: appError.message,
    })
    return toJsonResponse(createErrorResponse(error), appError.statusCode)
  }
}
