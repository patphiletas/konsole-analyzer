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

    it('should reject URL without protocol (strict mode)', () => {
      const result = analyzeRequestSchema.safeParse({
        url: 'example.com',
      })
      expect(result.success).toBe(false)
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
        techStack: ['React', 'Node.js'],
        gtmSignals: ['pricing'],
        fitScore: 75,
        explanation: 'High fit',
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid fitScore (over 100)', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: 101,
        explanation: 'High fit',
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid fitScore (negative)', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: -1,
        explanation: 'High fit',
        analyzedAt: new Date().toISOString(),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid date', () => {
      const result = analyzeResponseSchema.safeParse({
        url: 'https://example.com',
        companyName: 'Example Inc',
        description: 'A great company',
        techStack: ['React'],
        gtmSignals: ['pricing'],
        fitScore: 75,
        explanation: 'High fit',
        analyzedAt: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })
  })
})
