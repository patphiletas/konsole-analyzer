import { describe, it, expect } from 'vitest'
import {
  createSuccessResponse,
  createErrorResponse,
  ApiResponse,
} from '@/lib/api-middleware'
import { AppError, ErrorType } from '@/lib/errors'
import { ZodError, z } from 'zod'

describe('API Middleware', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'test' }
      const response = createSuccessResponse(data)

      expect(response.success).toBe(true)
      expect(response.data).toEqual(data)
      expect(response.error).toBeUndefined()
      expect(response.timestamp).toBeDefined()
    })

    it('should include ISO timestamp', () => {
      const response = createSuccessResponse({ test: true })
      const timestamp = new Date(response.timestamp)

      expect(timestamp instanceof Date).toBe(true)
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('createErrorResponse', () => {
    it('should handle AppError', () => {
      const error = new AppError(
        ErrorType.FETCH_FAILED,
        'Network error',
        500,
      )
      const response = createErrorResponse(error)

      expect(response.success).toBe(false)
      expect(response.data).toBeUndefined()
      expect(response.error?.type).toBe(ErrorType.FETCH_FAILED)
      expect(response.error?.message).toBe('Network error')
    })

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong')
      const response = createErrorResponse(error)

      expect(response.success).toBe(false)
      expect(response.error?.type).toBe(ErrorType.INTERNAL_ERROR)
      expect(response.error?.message).toBe('Something went wrong')
    })

    it('should handle ZodError with VALIDATION type', () => {
      const schema = z.object({ name: z.string() })
      const zodError = schema.safeParse({ name: 123 })

      if (!zodError.success) {
        const response = createErrorResponse(zodError.error)

        expect(response.success).toBe(false)
        expect(response.error?.type).toBe('VALIDATION')
      }
    })

    it('should include timestamp', () => {
      const error = new Error('Test')
      const response = createErrorResponse(error)

      expect(response.timestamp).toBeDefined()
      const timestamp = new Date(response.timestamp)
      expect(timestamp instanceof Date).toBe(true)
    })
  })
})
