export enum ErrorType {
  INVALID_URL = 'INVALID_URL',
  FETCH_FAILED = 'FETCH_FAILED',
  PARSE_FAILED = 'PARSE_FAILED',
  LLM_ERROR = 'LLM_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (
    error instanceof Error &&
    error.name === 'ZodError'
  ) {
    return new AppError(
      ErrorType.VALIDATION_ERROR,
      error.message,
      400,
    )
  }

  if (error instanceof Error) {
    return new AppError(
      ErrorType.INTERNAL_ERROR,
      error.message,
      500,
    )
  }

  return new AppError(
    ErrorType.INTERNAL_ERROR,
    'Unknown error occurred',
    500,
  )
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
