export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface TechSignal {
  name: string
  confidence: ConfidenceLevel
}

export interface ScoreBreakdown {
  size: number
  industry: number
  techStack: number
  gtm: number
}

export interface Enrichment {
  found: boolean
  logoUrl: string
  screenshotUrl: string
  wikiUrl?: string
  summary?: string
  thumbnail?: string
  founder?: string
  ceo?: string
  founded?: string
  employees?: string
  headquarters?: string
  stockExchange?: string
  parentOrg?: string
  revenue?: string
  netIncome?: string
}

export interface FooterLink {
  name: string
  url: string
}

export interface FooterSignals {
  copyrightYear?: string
  socialLinks: FooterLink[]
  notableLinks: FooterLink[]
  certifications: string[]
  legalForm?: string
  headquarters?: string
}

export interface AnalysisResult {
  url: string
  companyName: string
  description: string
  industry: string
  estimatedSize: string
  techStack: TechSignal[]
  gtmSignals: string[]
  fitScore: number
  scoreBreakdown: ScoreBreakdown
  explanation: string
  analysisSource: string
  emailProvider: string
  dnsTools: string[]
  footerSignals: FooterSignals
  enrichment: Enrichment
  analyzedAt: string
}
