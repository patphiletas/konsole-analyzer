import type { ScrapedData } from './scraper'
import type { LLMAnalysis } from './llm'

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
  ['Integrations', /integration|marketplace|apps/i],
  ['Newsletter capture', /newsletter|subscribe/i],
]

function uniq(values: string[]): string[] {
  return Array.from(new Set(values)).slice(0, 12)
}

function pageText(scraped: ScrapedData): string {
  return [
    scraped.title,
    scraped.description,
    scraped.keywords.join(' '),
    scraped.links.join(' '),
    scraped.scripts.join(' '),
    scraped.html.replace(/<script[\s\S]*?<\/script>/gi, ' '),
  ].join(' ')
}

function detectByPatterns(
  source: string,
  patterns: Array<[string, RegExp]>,
): string[] {
  return patterns
    .filter(([, pattern]) => pattern.test(source))
    .map(([label]) => label)
}

function estimateCompanyName(scraped: ScrapedData, url: string): string {
  const titleName = scraped.title
    .split(/\s[|-]\s|:|·/)
    .map((part) => part.trim())
    .find((part) => part.length > 1 && part.length < 50)

  if (titleName) return titleName

  const host = new URL(url).hostname.replace(/^www\./, '')
  return host.split('.')[0].replace(/^\w/, (letter) => letter.toUpperCase())
}

function estimateSize(source: string): string {
  const normalized = source.toLowerCase()

  if (/enterprise|global|fortune 500|large companies|contact sales/.test(normalized)) {
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
  heuristic: LLMAnalysis,
  llmAnalysis?: LLMAnalysis,
): LLMAnalysis {
  if (!llmAnalysis) return heuristic

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
    techStack: uniq([...llmAnalysis.techStack, ...heuristic.techStack]),
    gtmSignals: uniq([...llmAnalysis.gtmSignals, ...heuristic.gtmSignals]),
    description: llmAnalysis.description || heuristic.description,
  }
}

export function analyzeWebsiteWithHeuristics(
  scraped: ScrapedData,
  url: string,
  llmAnalysis?: LLMAnalysis,
): LLMAnalysis {
  const source = pageText(scraped)
  const industries = detectByPatterns(source, INDUSTRY_PATTERNS)
  const techStack = detectByPatterns(source, TECH_PATTERNS)
  const gtmSignals = detectByPatterns(source, GTM_PATTERNS)

  const heuristic: LLMAnalysis = {
    companyName: estimateCompanyName(scraped, url),
    industry: industries[0] || 'Unknown',
    estimatedSize: estimateSize(source),
    techStack,
    gtmSignals,
    description:
      scraped.description ||
      `Website analysis for ${new URL(url).hostname.replace(/^www\./, '')}.`,
  }

  return mergeAnalyses(heuristic, llmAnalysis)
}
