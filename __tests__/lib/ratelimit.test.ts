import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: vi.fn(() => ({})) },
}))

vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    limit() { return Promise.resolve({ success: true, limit: 10, remaining: 9, reset: 0 }) }
    static slidingWindow() { return 'config' }
  }
  return { Ratelimit: MockRatelimit }
})

describe('lib/ratelimit — S6 rate limiting', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exporte null quand UPSTASH_REDIS_REST_URL est absent', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    const { ratelimit } = await import('@/lib/ratelimit')
    expect(ratelimit).toBeNull()
  })

  it('instancie un Ratelimit quand les vars Upstash sont présentes', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'
    const { ratelimit } = await import('@/lib/ratelimit')
    expect(ratelimit).not.toBeNull()
    expect(typeof ratelimit?.limit).toBe('function')
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })
})
