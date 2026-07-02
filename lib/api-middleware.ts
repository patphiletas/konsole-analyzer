import { NextRequest, NextResponse } from 'next/server'
import { AppError, ErrorType, handleError } from './errors'
import { ZodError } from 'zod'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    type: ErrorType | 'VALIDATION'
    message: string
  }
  timestamp: string
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(error: unknown): ApiResponse<null> {
  if (error instanceof ZodError) {
    const firstError = error.issues[0]
    return {
      success: false,
      error: {
        type: 'VALIDATION',
        message: firstError?.message || 'Validation error',
      },
      timestamp: new Date().toISOString(),
    }
  }

  const appError = handleError(error)

  return {
    success: false,
    error: {
      type: appError.type,
      message: appError.message,
    },
    timestamp: new Date().toISOString(),
  }
}

export function toJsonResponse<T>(
  response: ApiResponse<T>,
  statusCode: number = 200,
  headers?: Record<string, string>,
): NextResponse {
  return NextResponse.json(response, { status: statusCode, headers })
}
