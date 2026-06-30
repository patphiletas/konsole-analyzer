import { describe, it, expect } from 'vitest'
import {
  AppError,
  ErrorType,
  handleError,
  isValidUrl,
} from '@/lib/errors'

describe('Error Handling', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(
        ErrorType.INVALID_URL,
        'Bad URL',
        400,
      )

      expect(error.type).toBe(ErrorType.INVALID_URL)
      expect(error.message).toBe('Bad URL')
      expect(error.statusCode).toBe(400)
    })

    it('should default to 500 status code', () => {
      const error = new AppError(
        ErrorType.INTERNAL_ERROR,
        'Something went wrong',
      )

      expect(error.statusCode).toBe(500)
    })
  })

  describe('handleError', () => {
    it('should return AppError as-is', () => {
      const appError = new AppError(
        ErrorType.FETCH_FAILED,
        'Network error',
        500,
      )

      const result = handleError(appError)

      expect(result).toBe(appError)
    })

    it('should wrap Error in AppError', () => {
      const error = new Error('Generic error')

      const result = handleError(error)

      expect(result instanceof AppError).toBe(true)
      expect(result.type).toBe(ErrorType.INTERNAL_ERROR)
      expect(result.message).toBe('Generic error')
    })

    it('should handle unknown errors', () => {
      const result = handleError('Unknown')

      expect(result instanceof AppError).toBe(true)
      expect(result.type).toBe(ErrorType.INTERNAL_ERROR)
    })
  })

  describe('isValidUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should accept valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('should accept URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(true)
    })

    it('should accept URLs with paths', () => {
      expect(isValidUrl('https://example.com/path')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
    })

    it('should reject empty strings', () => {
      expect(isValidUrl('')).toBe(false)
    })
  })
})
