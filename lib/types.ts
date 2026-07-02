import type { AnalyzeResponse } from '@/lib/validation'

export type AnalysisResult  = AnalyzeResponse
export type Enrichment      = AnalyzeResponse['enrichment']
export type FooterSignals   = AnalyzeResponse['footerSignals']
export type ScoreBreakdown  = AnalyzeResponse['scoreBreakdown']
export type TechSignal      = AnalyzeResponse['techStack'][number]
export type ConfidenceLevel = TechSignal['confidence']
export type FooterLink      = FooterSignals['socialLinks'][number]
export type LLMIntel        = NonNullable<AnalyzeResponse['llmIntel']>
