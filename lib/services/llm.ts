import { AppError, ErrorType } from '../errors'

export interface LLMAnalysis {
  companyName: string
  industry: string
  estimatedSize: string
  techStack: string[]
  gtmSignals: string[]
  description: string
  targetSegment?: string
  salesModel?: string
  targetPersona?: string
  tractionSignals?: string[]
  competitors?: string[]
  fundingSignals?: string[]
}

const PROMPT_TEMPLATE = (title: string, description: string, scripts: string[], html: string) => `Analyze this B2B website and extract information in JSON format.

Title: ${title}
Description: ${description}
Scripts detected: ${scripts.slice(0, 10).join(', ')}

HTML snippet (first 5000 chars):
${html.substring(0, 5000)}

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "companyName": "Company name",
  "industry": "Industry/sector",
  "estimatedSize": "startup|scale-up|enterprise",
  "techStack": ["tech1", "tech2"],
  "gtmSignals": ["signal1", "signal2"],
  "description": "Brief company description (1-2 sentences)",
  "targetSegment": "startup|SMB|mid-market|enterprise",
  "salesModel": "PLG|SLG|hybrid",
  "targetPersona": "developer|RevOps|IT|finance|marketing|HR|other",
  "tractionSignals": ["e.g. 10,000+ customers", "processing $1B+"],
  "competitors": ["Competitor A mentioned on site", "Alternative B"],
  "fundingSignals": ["YC S21", "Series B", "backed by a16z"]
}

Focus on:
- Tech stack clues from scripts and HTML
- GTM signals: pricing page, free trial, demo, documentation, blog
- targetSegment: who the product is sold to (not the company's own size)
- salesModel: PLG = signup-first, SLG = demo/sales-first, hybrid = both
- targetPersona: main buyer/user role implied by the site's language and features
- tractionSignals: any quantified claims (customers, revenue, transactions)
- competitors: alternatives explicitly mentioned (e.g. "vs X", "switch from Y")
- fundingSignals: investors, accelerators, funding rounds mentioned`

async function callGroq(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new AppError(ErrorType.LLM_ERROR, `Groq error: ${JSON.stringify(error)}`, response.status)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callOpenRouter(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new AppError(ErrorType.LLM_ERROR, `OpenRouter error: ${JSON.stringify(error)}`, response.status)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callLLM(prompt: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt)
    } catch (err) {
      if (!process.env.OPENROUTER_API_KEY) throw err
      return await callOpenRouter(prompt)
    }
  }
  if (process.env.OPENROUTER_API_KEY) {
    return await callOpenRouter(prompt)
  }
  throw new AppError(ErrorType.INTERNAL_ERROR, 'No LLM API key configured', 500)
}

export async function analyzeWebsiteWithLLM(
  html: string,
  title: string,
  description: string,
  scripts: string[],
): Promise<LLMAnalysis> {
  const prompt = PROMPT_TEMPLATE(title, description, scripts, html)

  try {
    const result = await callLLM(prompt)
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      companyName: parsed.companyName || 'Unknown',
      industry: parsed.industry || 'Unknown',
      estimatedSize: parsed.estimatedSize || 'Unknown',
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
      gtmSignals: Array.isArray(parsed.gtmSignals) ? parsed.gtmSignals : [],
      description: parsed.description || '',
      targetSegment: parsed.targetSegment || undefined,
      salesModel: parsed.salesModel || undefined,
      targetPersona: parsed.targetPersona || undefined,
      tractionSignals: Array.isArray(parsed.tractionSignals) && parsed.tractionSignals.length ? parsed.tractionSignals : undefined,
      competitors: Array.isArray(parsed.competitors) && parsed.competitors.length ? parsed.competitors : undefined,
      fundingSignals: Array.isArray(parsed.fundingSignals) && parsed.fundingSignals.length ? parsed.fundingSignals : undefined,
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(
      ErrorType.PARSE_FAILED,
      `Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
