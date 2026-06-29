import { z } from 'zod'

export const analyzeRequestSchema = z.object({
  url: z.string().url('Invalid URL format').trim(),
})

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>

export const analyzeResponseSchema = z.object({
  url: z.string(),
  companyName: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  gtmSignals: z.array(z.string()),
  fitScore: z.number().min(0).max(100),
  explanation: z.string(),
  analyzedAt: z.string().datetime(),
})

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>
