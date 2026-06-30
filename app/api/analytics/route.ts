import { NextResponse } from 'next/server'
import { analytics } from '@/lib/analytics'
import { createSuccessResponse, toJsonResponse } from '@/lib/api-middleware'

export function GET() {
  const stats = analytics.getStats()

  return toJsonResponse(
    createSuccessResponse({
      stats,
      events: analytics.getEvents(),
    }),
    200,
  )
}
