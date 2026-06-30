import { describe, it, expect } from 'vitest'
import { analyzeRequestSchema, analyzeResponseSchema } from '@/lib/validation'
import { ZodError } from 'zod'

describe('Validation', () => {
  describe('analyzeRequestSchema', () => {
    it('should accept valid URL with http', () => {
      const result = analyzeRequestSchema.safeParse({
        url: 'https://example.com',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.url).toBe('https://example.com')
      }
    })

    it('should accept URL without protocol', () => {
      const result = analyzeRequestSchema.safeParse({
        url: 'example.com',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.url).toBe('example.com')
      }
    })

    it('should reject invalid URL', () => {
      const result = analyzeRequestSchema.safeParse({
        url: 'not a url',
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty URL', () => {
      const result = analyzeRequestSchema.safeParse({
        url: '',
      })
      expect(result.success).toBe(false)
    })

    it('should trim whitespace', () => {
      const result = analyzeRequestSchema.safeParse({
        url: '  https://example.com  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.url).toBe('https://example.com')
      }
    })
  })

  describe('analyzeResponseSchema', () => {
    it('should accept valid response', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        industry: 'SaaS',
        estimatedSize: 'scale-up',
        techStack: ['React', 'Node.js'],
        gtmSignals: ['pricing'],
        fitScore: 75,
        scoreBreakdown: {
          size: 30,
          industry: 20,
          techStack: 15,
          gtm: 10,
        },
        explanation: 'High fit',
        analysisSource: 'Heuristics',
        emailProvider: 'Google Workspace',
        dnsTools: ['HubSpot', 'Salesforce'],
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid fitScore (over 100)', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        industry: 'SaaS',
        estimatedSize: 'scale-up',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: 101,
        scoreBreakdown: {
          size: 30,
          industry: 20,
          techStack: 15,
          gtm: 10,
        },
        explanation: 'High fit',
        analysisSource: 'Heuristics',
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid fitScore (negative)', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        industry: 'SaaS',
        estimatedSize: 'scale-up',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: -1,
        scoreBreakdown: {
          size: 30,
          industry: 20,
          techStack: 15,
          gtm: 10,
        },
        explanation: 'High fit',
        analysisSource: 'Heuristics',
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid date', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        industry: 'SaaS',
        estimatedSize: 'scale-up',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: 75,
        scoreBreakdown: {
          size: 30,
          industry: 20,
          techStack: 15,
          gtm: 10,
        },
        explanation: 'High fit',
        analysisSource: 'Heuristics',
        analyzedAt: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })
  })
})
