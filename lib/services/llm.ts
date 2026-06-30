import { AppError, ErrorType } from '../errors'

export interface LLMAnalysis {
  companyName: string
  industry: string
  estimatedSize: string
  techStack: string[]
  gtmSignals: string[]
  description: string
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

async function callOpenRouter(
  prompt: string,
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new AppError(
      ErrorType.INTERNAL_ERROR,
      'OpenRouter API key not configured',
      500,
    )
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new AppError(
        ErrorType.LLM_ERROR,
        `OpenRouter error: ${JSON.stringify(error)}`,
        response.status,
      )
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(
      ErrorType.LLM_ERROR,
      `Failed to call OpenRouter: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function analyzeWebsiteWithLLM(
  html: string,
  title: string,
  description: string,
  scripts: string[],
): Promise<LLMAnalysis> {
  const prompt = `Analyze this website and extract information in JSON format.

Title: ${title}
Description: ${description}
Scripts detected: ${scripts.slice(0, 10).join(', ')}

HTML snippet (first 5000 chars):
${html.substring(0, 5000)}

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "companyName": "Company name",
  "industry": "Industry/sector",
  "estimatedSize": "Size estimate (startup/scale-up/enterprise)",
  "techStack": ["tech1", "tech2", "tech3"],
  "gtmSignals": ["signal1", "signal2", "signal3"],
  "description": "Brief company description"
}

Focus on:
- Tech stack clues (frameworks, libraries in scripts)
- GTM signals: newsletter signup, pricing page, blog, documentation, free trial, demo booking, webinar
- Company size indicators
- Industry/business model hints`

  try {
    const result = await callOpenRouter(prompt)
    const cleaned = result
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    return {
      companyName: parsed.companyName || 'Unknown',
      industry: parsed.industry || 'Unknown',
      estimatedSize: parsed.estimatedSize || 'Unknown',
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
      gtmSignals: Array.isArray(parsed.gtmSignals) ? parsed.gtmSignals : [],
      description: parsed.description || '',
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(
      ErrorType.PARSE_FAILED,
      `Failed to parse LLM response: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
