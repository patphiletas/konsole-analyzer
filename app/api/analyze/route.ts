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
import { analyzeWebsiteWithHeuristics } from '@/lib/services/heuristics'
import { lookupDns } from '@/lib/services/dns'
import { calculateFitScore, generateExplanation } from '@/lib/services/scoring'
import { analytics } from '@/lib/analytics'

export const maxDuration = 20

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const validated = analyzeRequestSchema.parse(body)
    const url = /^https?:\/\//i.test(validated.url)
      ? validated.url
      : `https://${validated.url}`

    analytics.track({
      type: 'analyze_request',
      url,
    })

    if (!isValidUrl(url)) {
      throw new AppError(ErrorType.INVALID_URL, 'Invalid URL format', 400)
    }

    const hostname = new URL(url).hostname.replace(/^www\./, '')
    const [scraped, dnsIntel] = await Promise.all([
      scrapeWebsite(url),
      lookupDns(hostname).catch(() => ({ emailProvider: 'Unknown', toolsFromDns: [] })),
    ])
    const llmEnabled = Boolean(process.env.OPENROUTER_API_KEY)
    const llmAnalysis = llmEnabled
      ? await analyzeWebsiteWithLLM(
          scraped.html,
          scraped.title,
          scraped.description,
          scraped.scripts,
        ).catch((error) => {
          analytics.track({
            type: 'analyze_error',
            url,
            duration: Date.now() - startTime,
            error: error instanceof Error ? error.message : String(error),
          })
          return undefined
        })
      : undefined
    const analysis = analyzeWebsiteWithHeuristics(scraped, url, llmAnalysis)

    const scoringInput = {
      estimatedSize: analysis.estimatedSize,
      industry: analysis.industry,
      techStack: analysis.techStack,
      gtmSignals: analysis.gtmSignals,
    }
    const breakdown = calculateFitScore(scoringInput)

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
        industry: analysis.industry,
        estimatedSize: analysis.estimatedSize,
        techStack: analysis.techStack,
        gtmSignals: analysis.gtmSignals,
        fitScore: breakdown.fitScore,
        scoreBreakdown: {
          size: breakdown.sizeScore,
          industry: breakdown.industryScore,
          techStack: breakdown.techStackScore,
          gtm: breakdown.gtmScore,
        },
        explanation: generateExplanation(breakdown, scoringInput),
        analysisSource: llmAnalysis ? 'LLM + heuristics' : 'Heuristics',
        emailProvider: dnsIntel.emailProvider,
        dnsTools: dnsIntel.toolsFromDns,
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
