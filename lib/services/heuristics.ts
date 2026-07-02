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

type PatternEntry = { name: string; regex: RegExp }

const TECH_PATTERNS: PatternEntry[] = [
  { name: 'Next.js', regex: /next(?:\.js|js|\/static|\/data|\/image)|__next|_next/i },
  { name: 'React', regex: /react|react-dom|jsx/i },
  { name: 'Vue', regex: /vue(?:\.runtime|\.global|js)?/i },
  { name: 'Angular', regex: /angular/i },
  { name: 'Svelte', regex: /svelte/i },
  { name: 'TypeScript', regex: /typescript|\.tsx?/i },
  { name: 'Node.js', regex: /node\.js|nodejs|npm/i },
  { name: 'Shopify', regex: /shopify|cdn\.shopify/i },
  { name: 'Webflow', regex: /webflow/i },
  { name: 'WordPress', regex: /wp-content|wordpress/i },
  { name: 'Framer', regex: /framer/i },
  { name: 'Segment', regex: /segment\.com|analytics\.js/i },
  { name: 'HubSpot', regex: /hubspot|hs-scripts|hsforms/i },
  { name: 'Intercom', regex: /intercom/i },
  { name: 'Stripe', regex: /stripe/i },
  { name: 'Google Analytics', regex: /googletagmanager|google-analytics|gtag/i },
  { name: 'Amplitude', regex: /amplitude/i },
  { name: 'Mixpanel', regex: /mixpanel/i },
  { name: 'Vercel', regex: /vercel/i },
  { name: 'Cloudflare', regex: /cloudflare/i },
]

const INDUSTRY_PATTERNS: PatternEntry[] = [
  { name: 'SaaS / Software', regex: /saas|software|platform|workflow|automation|crm|sales/i },
  { name: 'Fintech', regex: /payment|banking|finance|fintech|invoice|billing|card/i },
  { name: 'Martech / RevTech', regex: /marketing|revenue|sales|gtm|lead|pipeline|campaign/i },
  { name: 'E-commerce', regex: /ecommerce|e-commerce|shop|cart|checkout|retail/i },
  { name: 'Data / Analytics', regex: /data|analytics|dashboard|metrics|insight|warehouse/i },
  { name: 'Developer Tools', regex: /api|developer|docs|sdk|webhook|infrastructure/i },
  { name: 'HR Tech', regex: /hiring|recruit|payroll|employee|talent|hr/i },
  { name: 'Cybersecurity', regex: /security|compliance|soc 2|risk|identity|authentication/i },
]

const GTM_PATTERNS: PatternEntry[] = [
  { name: 'Page de tarifs',    regex: /pricing|plans|tarifs/i },
  { name: 'Réservation démo',  regex: /demo|book.?a.?call|contact.?sales|talk.?to.?sales/i },
  { name: 'Essai gratuit',     regex: /free.?trial|start.?free|try.?for.?free/i },
  { name: 'Inscription produit', regex: /sign.?up|get.?started|create.?account/i },
  { name: 'Documentation',     regex: /docs|documentation|developers|api reference/i },
  { name: 'API / Webhooks',    regex: /api|webhook|sdk|developers/i },
  { name: 'Blog / Ressources', regex: /blog|resources|guides|learn|academy/i },
  { name: 'Études de cas',     regex: /case.?stud|customers|success.?stor/i },
  { name: 'Intégrations',      regex: /integration|marketplace|apps/i },
  { name: 'Newsletter',        regex: /newsletter|subscribe/i },
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

function detectByPatterns(source: string, patterns: PatternEntry[]): string[] {
  return patterns
    .filter(({ regex }) => regex.test(source))
    .map(({ name }) => name)
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
  for (const { name, regex } of TECH_PATTERNS) {
    if (regex.test(scriptSource)) {
      signals.push({ name, confidence: 'high' })
    } else if (regex.test(htmlSource)) {
      signals.push({ name, confidence: 'medium' })
    } else if (regex.test(textSource)) {
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
    gtmSignals: uniqStrings([
      ...llmAnalysis.gtmSignals,
      // ignore les signaux heuristiques dont le pattern couvre déjà un signal LLM
      ...heuristic.gtmSignals.filter((name) => {
        const pattern = GTM_PATTERNS.find((p) => p.name === name)
        return !pattern || !llmAnalysis.gtmSignals.some((s) => pattern.regex.test(s))
      }),
    ]),
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
