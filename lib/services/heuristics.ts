import type { ScrapedData } from './scraper'
import type { LLMAnalysis } from './llm'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface TechSignal {
  name: string
  confidence: ConfidenceLevel
}

export interface WebsiteAnalysis {
  companyName: string
  industry: string
  estimatedSize: string
  techStack: TechSignal[]
  gtmSignals: string[]
  description: string
}

const TECH_PATTERNS: Array<[string, RegExp]> = [
  ['Next.js', /next(?:\.js|js|\/static|\/data|\/image)|__next|_next/i],
  ['React', /react|react-dom|jsx/i],
  ['Vue', /vue(?:\.runtime|\.global|js)?/i],
  ['Angular', /angular/i],
  ['Svelte', /svelte/i],
  ['TypeScript', /typescript|\.tsx?/i],
  ['Node.js', /node\.js|nodejs|npm/i],
  ['Shopify', /shopify|cdn\.shopify/i],
  ['Webflow', /webflow/i],
  ['WordPress', /wp-content|wordpress/i],
  ['Framer', /framer/i],
  ['Segment', /segment\.com|analytics\.js/i],
  ['HubSpot', /hubspot|hs-scripts|hsforms/i],
  ['Intercom', /intercom/i],
  ['Stripe', /stripe/i],
  ['Google Analytics', /googletagmanager|google-analytics|gtag/i],
  ['Amplitude', /amplitude/i],
  ['Mixpanel', /mixpanel/i],
  ['Vercel', /vercel/i],
  ['Cloudflare', /cloudflare/i],
]

const INDUSTRY_PATTERNS: Array<[string, RegExp]> = [
  ['SaaS / Software', /saas|software|platform|workflow|automation|crm|sales/i],
  ['Fintech', /payment|banking|finance|fintech|invoice|billing|card/i],
  ['Martech / RevTech', /marketing|revenue|sales|gtm|lead|pipeline|campaign/i],
  ['E-commerce', /ecommerce|e-commerce|shop|cart|checkout|retail/i],
  ['Data / Analytics', /data|analytics|dashboard|metrics|insight|warehouse/i],
  ['Developer Tools', /api|developer|docs|sdk|webhook|infrastructure/i],
  ['HR Tech', /hiring|recruit|payroll|employee|talent|hr/i],
  ['Cybersecurity', /security|compliance|soc 2|risk|identity|authentication/i],
]

const GTM_PATTERNS: Array<[string, RegExp]> = [
  ['Pricing page', /pricing|plans|tarifs/i],
  ['Demo booking', /demo|book.?a.?call|contact.?sales|talk.?to.?sales/i],
  ['Free trial', /free.?trial|start.?free|try.?for.?free/i],
  ['Product-led signup', /sign.?up|get.?started|create.?account/i],
  ['Documentation', /docs|documentation|developers|api reference/i],
  ['API / Webhooks', /api|webhook|sdk|developers/i],
  ['Blog / Resources', /blog|resources|guides|learn|academy/i],
  ['Case studies', /case.?stud|customers|success.?stor/i],
  ['Intégrations', /integration|marketplace|apps/i],
  ['Newsletter capture', /newsletter|subscribe/i],
]

function uniqStrings(values: string[]): string[] {
  return Array.from(new Set(values)).slice(0, 12)
}

function uniqTechSignals(signals: TechSignal[]): TechSignal[] {
  const seen = new Map<string, TechSignal>()
  const order: ConfidenceLevel[] = ['high', 'medium', 'low']
  for (const signal of signals) {
    const existing = seen.get(signal.name)
    if (!existing || order.indexOf(signal.confidence) < order.indexOf(existing.confidence)) {
      seen.set(signal.name, signal)
    }
  }
  return Array.from(seen.values()).slice(0, 12)
}

function detectByPatterns(
  source: string,
  patterns: Array<[string, RegExp]>,
): string[] {
  return patterns
    .filter(([, pattern]) => pattern.test(source))
    .map(([label]) => label)
}

function detectTechStack(scraped: ScrapedData): TechSignal[] {
  const scriptSource = scraped.scripts.join(' ')
  const htmlSource = scraped.html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  const textSource = [
    scraped.title,
    scraped.description,
    scraped.keywords.join(' '),
    scraped.links.join(' '),
  ].join(' ')

  const signals: TechSignal[] = []
  for (const [name, pattern] of TECH_PATTERNS) {
    if (pattern.test(scriptSource)) {
      signals.push({ name, confidence: 'high' })
    } else if (pattern.test(htmlSource)) {
      signals.push({ name, confidence: 'medium' })
    } else if (pattern.test(textSource)) {
      signals.push({ name, confidence: 'low' })
    }
  }
  return signals.slice(0, 12)
}

export function estimateCompanyName(scraped: ScrapedData, url: string): string {
  const titleName = scraped.title
    .split(/\s[|–—-]\s|:|·/)
    .map((part) => part.trim())
    .find((part) => part.length > 1 && part.length < 50)

  if (titleName) return titleName

  const host = new URL(url).hostname.replace(/^www\./, '')
  const parts = host.split('.')
  const name = parts.length >= 3 ? parts[parts.length - 2] : parts[0]
  return name.replace(/^\w/, (letter) => letter.toUpperCase())
}

function estimateSize(source: string, certifications: string[]): string {
  const normalized = source.toLowerCase()

  if (
    /enterprise|global|fortune 500|large companies|contact sales/.test(normalized) ||
    certifications.some((c) => ['SOC 2', 'ISO 27001', 'FedRAMP', 'HIPAA'].includes(c))
  ) {
    return 'enterprise'
  }

  if (/series [abcde]|scale|mid-market|1,000\+|500\+|customers worldwide/.test(normalized)) {
    return 'scale-up'
  }

  if (/startup|small business|founder|early-stage|teams of all sizes/.test(normalized)) {
    return 'startup / SMB'
  }

  return 'unknown'
}

function mergeAnalyses(
  heuristic: WebsiteAnalysis,
  llmAnalysis?: LLMAnalysis,
): WebsiteAnalysis {
  if (!llmAnalysis) return heuristic

  const llmTechSignals: TechSignal[] = llmAnalysis.techStack.map((name) => ({
    name,
    confidence: 'medium' as ConfidenceLevel,
  }))

  return {
    companyName:
      llmAnalysis.companyName !== 'Unknown'
        ? llmAnalysis.companyName
        : heuristic.companyName,
    industry:
      llmAnalysis.industry !== 'Unknown'
        ? llmAnalysis.industry
        : heuristic.industry,
    estimatedSize:
      llmAnalysis.estimatedSize !== 'Unknown'
        ? llmAnalysis.estimatedSize
        : heuristic.estimatedSize,
    techStack: uniqTechSignals([...heuristic.techStack, ...llmTechSignals]),
    gtmSignals: uniqStrings([...llmAnalysis.gtmSignals, ...heuristic.gtmSignals]),
    description: llmAnalysis.description || heuristic.description,
  }
}

export function analyzeWebsiteWithHeuristics(
  scraped: ScrapedData,
  url: string,
  llmAnalysis?: LLMAnalysis,
): WebsiteAnalysis {
  const fullText = [
    scraped.title,
    scraped.description,
    scraped.keywords.join(' '),
    scraped.links.join(' '),
    scraped.html.replace(/<script[\s\S]*?<\/script>/gi, ' '),
  ].join(' ')

  const industries = detectByPatterns(fullText, INDUSTRY_PATTERNS)
  const gtmSignals = detectByPatterns(fullText, GTM_PATTERNS)
  const techStack = detectTechStack(scraped)

  const { socialLinks, certifications } = scraped.footerSignals
  const gtmFromFooter = socialLinks.some((l) => l.name === 'LinkedIn') ? ['Présence LinkedIn'] : []

  const heuristic: WebsiteAnalysis = {
    companyName: estimateCompanyName(scraped, url),
    industry: industries[0] || 'Unknown',
    estimatedSize: estimateSize(fullText, certifications),
    techStack,
    gtmSignals: uniqStrings([...gtmSignals, ...gtmFromFooter]),
    description:
      scraped.description ||
      `Website analysis for ${new URL(url).hostname.replace(/^www\./, '')}.`,
  }

  return mergeAnalyses(heuristic, llmAnalysis)
}
