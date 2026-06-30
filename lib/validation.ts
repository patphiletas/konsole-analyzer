import { z } from 'zod'

const domainLikePattern =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(?::\d{2,5})?(\/[^\s]*)?$/i

export const analyzeRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .refine((value) => domainLikePattern.test(value), {
      message: 'Enter a valid website URL, for example stripe.com',
    }),
})

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>

export const analyzeResponseSchema = z.object({
  url: z.string(),
  companyName: z.string(),
  description: z.string(),
  industry: z.string(),
  estimatedSize: z.string(),
  techStack: z.array(z.object({
    name: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
  })),
  gtmSignals: z.array(z.string()),
  fitScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    size: z.number(),
    industry: z.number(),
    techStack: z.number(),
    gtm: z.number(),
  }),
  explanation: z.string(),
  analysisSource: z.string(),
  emailProvider: z.string(),
  dnsTools: z.array(z.string()),
  enrichment: z.object({
    found: z.boolean(),
    logoUrl: z.string(),
    wikiUrl: z.string().optional(),
    summary: z.string().optional(),
    thumbnail: z.string().optional(),
    founder: z.string().optional(),
    ceo: z.string().optional(),
    founded: z.string().optional(),
  }),
  analyzedAt: z.string().datetime(),
})

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>
