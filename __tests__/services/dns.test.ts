import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupDns } from '@/lib/services/dns'

function mockFetch(txtData: string[], mxData: string[]) {
  return vi.fn().mockImplementation((url: string) => {
    const u = url.toString()
    const records = u.includes('type=TXT') ? txtData : mxData
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          Status: 0,
          Answer: records.map((data) => ({ data })),
        }),
    })
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('lookupDns', () => {
  describe('toolsFromDns (SPF)', () => {
    it('extracts tools from SPF include directives', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch(
          ['"v=spf1 include:hubspot.com include:salesforce.com include:sendgrid.net ~all"'],
          [],
        ),
      )
      const result = await lookupDns('example.com')
      expect(result.toolsFromDns).toContain('HubSpot')
      expect(result.toolsFromDns).toContain('Salesforce')
      expect(result.toolsFromDns).toContain('SendGrid')
    })

    it('returns empty toolsFromDns when no SPF record', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch(['"v=dkim1 ....."'], []),
      )
      const result = await lookupDns('example.com')
      expect(result.toolsFromDns).toEqual([])
    })

    it('strips quotes from TXT records before matching', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch(['"v=spf1 include:klaviyo.com ~all"'], []),
      )
      const result = await lookupDns('example.com')
      expect(result.toolsFromDns).toContain('Klaviyo')
    })

    it('returns empty toolsFromDns when no TXT records', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch([], []),
      )
      const result = await lookupDns('example.com')
      expect(result.toolsFromDns).toEqual([])
    })
  })

  describe('emailProvider (MX)', () => {
    it('detects Google Workspace from MX records', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch([], ['10 aspmx.l.google.com.']),
      )
      const result = await lookupDns('example.com')
      expect(result.emailProvider).toBe('Google Workspace')
    })

    it('detects Microsoft 365 from MX records', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch([], ['10 example-com.mail.protection.outlook.com.']),
      )
      const result = await lookupDns('example.com')
      expect(result.emailProvider).toBe('Microsoft 365')
    })

    it('returns Unknown when no MX records match', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch([], ['10 mail.custom-provider.io.']),
      )
      const result = await lookupDns('example.com')
      expect(result.emailProvider).toBe('Unknown')
    })

    it('returns Unknown when no MX records at all', async () => {
      vi.stubGlobal(
        'fetch',
        mockFetch([], []),
      )
      const result = await lookupDns('example.com')
      expect(result.emailProvider).toBe('Unknown')
    })
  })

  describe('resilience', () => {
    it('returns empty result when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))
      const result = await lookupDns('example.com').catch(() => ({
        emailProvider: 'Unknown',
        toolsFromDns: [],
      }))
      expect(result.emailProvider).toBe('Unknown')
      expect(result.toolsFromDns).toEqual([])
    })

    it('handles DNS NXDOMAIN (Status != 0)', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ Status: 3 }),
        }),
      )
      const result = await lookupDns('notexist.example')
      expect(result.toolsFromDns).toEqual([])
      expect(result.emailProvider).toBe('Unknown')
    })
  })
})
