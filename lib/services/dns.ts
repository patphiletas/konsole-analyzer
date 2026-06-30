export interface DnsIntelligence {
  emailProvider: string
  toolsFromDns: string[]
}

const SPF_TOOL_MAP: Array<[string, string]> = [
  ['hubspot.com', 'HubSpot'],
  ['salesforce.com', 'Salesforce'],
  ['exacttarget.com', 'Salesforce Marketing Cloud'],
  ['pardot.com', 'Pardot'],
  ['marketo.com', 'Marketo'],
  ['mailchimp.com', 'Mailchimp'],
  ['mandrillapp.com', 'Mandrill'],
  ['klaviyo.com', 'Klaviyo'],
  ['sendgrid.net', 'SendGrid'],
  ['sparkpostmail.com', 'SparkPost'],
  ['mailgun.org', 'Mailgun'],
  ['postmarkapp.com', 'Postmark'],
  ['customer.io', 'Customer.io'],
  ['iterable.com', 'Iterable'],
  ['braze.com', 'Braze'],
  ['activecampaign.com', 'ActiveCampaign'],
  ['drip.com', 'Drip'],
  ['convertkit.com', 'ConvertKit'],
  ['brevo.com', 'Brevo'],
  ['sendinblue.com', 'Brevo'],
  ['intercom.io', 'Intercom'],
  ['zendesk.com', 'Zendesk'],
  ['freshdesk.com', 'Freshworks'],
  ['pipedrive.com', 'Pipedrive'],
  ['outreach.io', 'Outreach'],
  ['salesloft.com', 'SalesLoft'],
  ['apollo.io', 'Apollo'],
  ['reply.io', 'Reply.io'],
  ['lemlist.com', 'Lemlist'],
  ['drift.com', 'Drift'],
  ['zoho.com', 'Zoho'],
]

const MX_PROVIDER_MAP: Array<[string, string]> = [
  ['google', 'Google Workspace'],
  ['googlemail', 'Google Workspace'],
  ['outlook', 'Microsoft 365'],
  ['protection.microsoft', 'Microsoft 365'],
  ['protonmail', 'ProtonMail'],
  ['zoho', 'Zoho Mail'],
  ['fastmail', 'Fastmail'],
  ['amazonses', 'Amazon SES'],
  ['mailgun', 'Mailgun'],
  ['sendgrid', 'SendGrid'],
]

async function fetchDnsRecords(name: string, type: string): Promise<string[]> {
  const res = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    { signal: AbortSignal.timeout(5000) },
  )
  if (!res.ok) return []
  const data = (await res.json()) as {
    Status: number
    Answer?: Array<{ data: string }>
  }
  if (data.Status !== 0 || !data.Answer) return []
  return data.Answer.map((record) => record.data)
}

export async function lookupDns(domain: string): Promise<DnsIntelligence> {
  const [txtRecords, mxRecords] = await Promise.all([
    fetchDnsRecords(domain, 'TXT'),
    fetchDnsRecords(domain, 'MX'),
  ])

  const spfRecord = txtRecords
    .map((r) => r.replace(/"/g, ''))
    .find((r) => r.startsWith('v=spf1'))

  const toolsFromDns: string[] = []
  if (spfRecord) {
    for (const [match, tool] of SPF_TOOL_MAP) {
      if (spfRecord.includes(match)) {
        toolsFromDns.push(tool)
      }
    }
  }

  let emailProvider = 'Unknown'
  for (const mx of mxRecords) {
    const mxLower = mx.toLowerCase()
    for (const [pattern, provider] of MX_PROVIDER_MAP) {
      if (mxLower.includes(pattern)) {
        emailProvider = provider
        break
      }
    }
    if (emailProvider !== 'Unknown') break
  }

  return { emailProvider, toolsFromDns }
}
