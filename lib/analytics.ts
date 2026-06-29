export interface AnalyticsEvent {
  type: 'analyze_request' | 'analyze_success' | 'analyze_error'
  url?: string
  duration?: number
  error?: string
  timestamp: string
}

class Analytics {
  private events: AnalyticsEvent[] = []

  track(event: Omit<AnalyticsEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
    })
  }

  getEvents(): AnalyticsEvent[] {
    return this.events
  }

  getStats() {
    const total = this.events.length
    const success = this.events.filter((e) => e.type === 'analyze_success').length
    const errors = this.events.filter((e) => e.type === 'analyze_error').length
    const avgDuration =
      this.events
        .filter((e) => e.duration !== undefined)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / (total || 1)

    return {
      total,
      success,
      errors,
      avgDuration: Math.round(avgDuration),
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    }
  }

  clear() {
    this.events = []
  }
}

export const analytics = new Analytics()
