import { buildFaviconUrl, buildScreenshotUrl } from '../utils'

export interface WikiIntelligence {
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

const TIMEOUT_MS = 5000

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

async function searchWikipediaTitle(query: string, companyName: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&srprop=`
  const data = await fetchJson<{
    query?: { search?: Array<{ title: string }> }
  }>(url)
  const results = data?.query?.search ?? []
  const name = companyName.toLowerCase()
  const match = results.find((r) => r.title.toLowerCase().includes(name))
  return match?.title ?? null
}

async function fetchWikipediaSummary(title: string): Promise<{
  extract: string
  thumbnailUrl?: string
  pageUrl: string
} | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const data = await fetchJson<{
    extract?: string
    thumbnail?: { source: string }
    content_urls?: { desktop?: { page?: string } }
  }>(url)
  if (!data?.extract) return null
  return {
    extract: data.extract,
    thumbnailUrl: data.thumbnail?.source,
    pageUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  }
}

async function fetchWikidataId(wikipediaTitle: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikipediaTitle)}&prop=pageprops&format=json`
  const data = await fetchJson<{
    query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> }
  }>(url)
  const pages = data?.query?.pages ?? {}
  const page = Object.values(pages)[0]
  return page?.pageprops?.wikibase_item ?? null
}

type WikidataClaimValue =
  | { type: 'wikibase-entityid'; value: { id: string } }
  | { type: 'time'; value: { time: string } }
  | { type: 'string'; value: string }
  | { type: 'quantity'; value: { amount: string; unit: string } }

type WikidataClaims = Record<
  string,
  Array<{ rank: string; mainsnak: { datavalue?: WikidataClaimValue } }>
>

function getBestClaim(claims: WikidataClaims, property: string) {
  const entries = (claims[property] ?? []).filter((e) => e.rank !== 'deprecated')
  return entries.find((e) => e.rank === 'preferred') ?? entries[entries.length - 1] ?? null
}

function extractEntityId(claims: WikidataClaims, property: string): string | null {
  const val = getBestClaim(claims, property)?.mainsnak.datavalue
  if (val?.type === 'wikibase-entityid') return val.value.id
  return null
}

function extractQuantity(claims: WikidataClaims, property: string): string | null {
  const snak = getBestClaim(claims, property)?.mainsnak.datavalue
  if (snak?.type !== 'quantity') return null
  const raw = parseFloat(snak.value.amount)
  if (isNaN(raw)) return null
  if (raw >= 1_000_000) return `${(raw / 1_000_000).toFixed(1)} M`
  if (raw >= 1_000) return `${Math.round(raw / 1_000)} k`
  return Math.round(raw).toLocaleString('fr-FR')
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  Q4917: '$', Q25224: '€', Q4916: '£', Q8374: '¥',
}

function extractFinancial(claims: WikidataClaims, property: string): string | null {
  const snak = getBestClaim(claims, property)?.mainsnak.datavalue
  if (snak?.type !== 'quantity') return null
  const raw = parseFloat(snak.value.amount)
  if (isNaN(raw)) return null
  const unitId = snak.value.unit?.split('/entity/')[1] ?? ''
  const symbol = CURRENCY_SYMBOLS[unitId] ?? ''
  if (raw >= 1_000_000_000) return `${symbol}${(raw / 1_000_000_000).toFixed(1)} Md`
  if (raw >= 1_000_000) return `${symbol}${(raw / 1_000_000).toFixed(0)} M`
  return `${symbol}${Math.round(raw).toLocaleString('fr-FR')}`
}

function extractYear(claims: WikidataClaims, property: string): string | null {
  const val = getBestClaim(claims, property)?.mainsnak.datavalue
  if (val?.type === 'time') {
    const match = val.value.time.match(/\+(\d{4})/)
    return match?.[1] ?? null
  }
  return null
}

async function fetchWikidataClaims(entityId: string): Promise<WikidataClaims | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims&format=json`
  const data = await fetchJson<{
    entities?: Record<string, { claims?: WikidataClaims }>
  }>(url)
  return data?.entities?.[entityId]?.claims ?? null
}

async function fetchWikidataLabels(ids: string[]): Promise<Record<string, string>> {
  if (!ids.length) return {}
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels&format=json&languages=fr%7Cen`
  const data = await fetchJson<{
    entities?: Record<string, { labels?: Record<string, { value: string }> }>
  }>(url)
  if (!data?.entities) return {}

  const result: Record<string, string> = {}
  for (const [id, entity] of Object.entries(data.entities)) {
    const label = entity.labels?.fr?.value ?? entity.labels?.en?.value
    if (label) result[id] = label
  }
  return result
}

export async function lookupCompanyWiki(
  companyName: string,
  domain: string,
): Promise<WikiIntelligence> {
  const logoUrl = buildFaviconUrl(domain)
  const screenshotUrl = buildScreenshotUrl(domain)

  const title = await searchWikipediaTitle(`${companyName} company`, companyName)
  if (!title) return { found: false, logoUrl, screenshotUrl }

  const [summary, wikidataId] = await Promise.all([
    fetchWikipediaSummary(title),
    fetchWikidataId(title),
  ])

  if (!summary) return { found: false, logoUrl, screenshotUrl }

  const result: WikiIntelligence = {
    found: true,
    logoUrl,
    screenshotUrl,
    wikiUrl: summary.pageUrl,
    summary: summary.extract.slice(0, 400),
    thumbnail: summary.thumbnailUrl,
  }

  if (!wikidataId) return result

  const claims = await fetchWikidataClaims(wikidataId)
  if (!claims) return result

  const founderId = extractEntityId(claims, 'P112')
  const ceoId = extractEntityId(claims, 'P169')
  const headquartersId = extractEntityId(claims, 'P159')
  const stockExchangeId = extractEntityId(claims, 'P414')
  const parentOrgId = extractEntityId(claims, 'P127')
  const founded = extractYear(claims, 'P571')
  const employees = extractQuantity(claims, 'P1128')
  const revenue = extractFinancial(claims, 'P2139')
  const netIncome = extractFinancial(claims, 'P2295')

  if (founded) result.founded = founded
  if (employees) result.employees = employees
  if (revenue) result.revenue = revenue
  if (netIncome) result.netIncome = netIncome

  const entityIds = [founderId, ceoId, headquartersId, stockExchangeId, parentOrgId]
    .filter((id): id is string => id !== null)
  const labels = await fetchWikidataLabels(entityIds)

  if (founderId && labels[founderId]) result.founder = labels[founderId]
  if (ceoId && labels[ceoId]) result.ceo = labels[ceoId]
  if (headquartersId && labels[headquartersId]) result.headquarters = labels[headquartersId]
  if (stockExchangeId && labels[stockExchangeId]) result.stockExchange = labels[stockExchangeId]
  if (parentOrgId && labels[parentOrgId]) result.parentOrg = labels[parentOrgId]

  return result
}
