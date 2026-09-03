# Features — Kpratik

Toutes les fonctionnalités du projet, avec explication simple et extrait de code représentatif.

---

## 1. Scraping HTML

**Ce que ça fait :** Récupère la page d'accueil d'un site et en extrait les données utiles : titre, description meta, scripts chargés, liens href, favicon. Tout se fait côté serveur, sans navigateur headless.

**Fichier :** `lib/services/scraper.ts`

```typescript
export interface ScrapedData {
  title: string
  description: string
  keywords: string[]
  scripts: string[]
  links: string[]
  favicon?: string
  html: string
  footerSignals: FooterSignals
}

// Extraction de la meta description (supporte name= et og:description)
function getMetaContent(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
  ]
  // ...
}
```

---

## 2. Analyse heuristique

**Ce que ça fait :** Sans LLM, détecte la stack technique, le secteur, la taille estimée et les signaux GTM (go-to-market) en parcourant le HTML avec des patterns regex. Chaque techno détectée reçoit un niveau de confiance : `high` (trouvée dans un script src), `medium` (présente dans le HTML), `low` (texte seul).

**Fichier :** `lib/services/heuristics.ts`

```typescript
const TECH_PATTERNS: Array<[string, RegExp]> = [
  ['Next.js', /next(?:\.js|js|\/static|\/data|\/image)|__next|_next/i],
  ['React',   /react|react-dom|jsx/i],
  ['Stripe',  /stripe/i],
  ['Segment', /segment\.com|analytics\.js/i],
  ['HubSpot', /hubspot|hs-scripts|hsforms/i],
  // 20 patterns au total
]

const GTM_PATTERNS: Array<[string, RegExp]> = [
  ['Pricing page',       /pricing|plans|tarifs/i],
  ['Demo booking',       /demo|book.?a.?call|contact.?sales/i],
  ['Free trial',         /free.?trial|start.?free|try.?for.?free/i],
  ['Product-led signup', /sign.?up|get.?started|create.?account/i],
  // 10 patterns au total
]
```

```typescript
// Déduplication des signaux : si un même outil est détecté plusieurs fois,
// on garde la confiance la plus haute (high > medium > low)
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
```

---

## 3. Intelligence DNS

**Ce que ça fait :** Interroge les enregistrements DNS publics (TXT et MX) via l'API Google DoH (DNS over HTTPS), sans clé API. Le record SPF révèle les outils marketing/CRM utilisés ; le record MX révèle le provider email.

**Fichier :** `lib/services/dns.ts`

```typescript
// 30+ outils détectables via le SPF
const SPF_TOOL_MAP: Array<[string, string]> = [
  ['hubspot.com',      'HubSpot'],
  ['salesforce.com',   'Salesforce'],
  ['marketo.com',      'Marketo'],
  ['klaviyo.com',      'Klaviyo'],
  ['sendgrid.net',     'SendGrid'],
  ['outreach.io',      'Outreach'],
  ['salesloft.com',    'SalesLoft'],
  ['braze.com',        'Braze'],
  // ...
]

// Provider email via enregistrements MX
const MX_PROVIDER_MAP: Array<[string, string]> = [
  ['google',    'Google Workspace'],
  ['outlook',   'Microsoft 365'],
  ['protonmail','ProtonMail'],
  // ...
]

// Requête DNS sans clé, via l'API publique Google
async function fetchDnsRecords(name: string, type: string): Promise<string[]> {
  const res = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    { signal: AbortSignal.timeout(5000) },
  )
  // ...
}
```

---

## 4. Enrichissement Wikipedia / Wikidata

**Ce que ça fait :** Cherche l'entreprise sur Wikipedia, récupère son résumé (tronqué à 400 car.), puis interroge Wikidata pour extraire fondateur, CEO et année de création. Un filtre anti-faux-positif valide que le titre trouvé contient bien le nom de l'entreprise.

**Fichier :** `lib/services/wiki.ts`

```typescript
// Pipeline : search → summary → Wikidata claims
export async function lookupCompanyWiki(
  companyName: string,
  hostname: string,
): Promise<WikiIntelligence> {
  const logoUrl = buildFaviconUrl(hostname)
  const screenshotUrl = buildScreenshotUrl(hostname)

  const title = await searchWikipediaTitle(companyName, companyName)
  if (!title) return { found: false, logoUrl, screenshotUrl }

  const summary = await fetchWikipediaSummary(title)
  if (!summary) return { found: false, logoUrl, screenshotUrl }

  const wikidataId = await fetchWikidataId(title)
  const claims = wikidataId ? await fetchWikidataClaims(wikidataId) : null

  return {
    found: true,
    logoUrl,
    screenshotUrl,
    wikiUrl: summary.pageUrl,
    summary: summary.extract.slice(0, 400),
    thumbnail: summary.thumbnailUrl,
    founder: claims?.founder,
    ceo: claims?.ceo,
    founded: claims?.founded,
  }
}
```

---

## 5. Screenshot Thum.io

**Ce que ça fait :** Génère une URL d'aperçu visuel du site cible sans aucune clé API. Thum.io capture une screenshot de 1280px de large, rognée à 800px de hauteur. L'image est affichée dans un cadre scrollable.

**Fichier :** `lib/utils.ts`

```typescript
export function buildScreenshotUrl(domain: string): string {
  // Attention : ne pas utiliser encodeURIComponent ici (bug #7)
  // Thum.io attend l'URL cible non-encodée dans le path
  return `https://image.thum.io/get/width/1280/crop/800/https://${domain}`
}
```

```tsx
// Dans EnrichmentCard.tsx — cadre scrollable de hauteur fixe
<div className="h-48 overflow-y-auto rounded border border-zinc-200">
  <img src={enrichment.screenshotUrl} alt="Screenshot" className="w-full" />
</div>
```

---

## 6. Logo / Favicon

**Ce que ça fait :** Tente d'utiliser le favicon scrapé sur la page. Si absent ou si son protocole n'est pas `http`/`https` (protection contre les `javascript:` injectés), bascule sur l'API Google Favicons (128×128px).

**Fichier :** `lib/utils.ts`

```typescript
export function buildFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

export function resolveFaviconUrl(
  favicon: string | undefined,
  hostname: string,
  fallback: string,
): string {
  if (!favicon) return fallback
  try {
    const resolved = new URL(favicon, `https://${hostname}`)
    // Rejette javascript:, data:, etc.
    if (!['http:', 'https:'].includes(resolved.protocol)) return fallback
    return resolved.href
  } catch {
    return fallback
  }
}
```

---

## 7. Signaux footer

**Ce que ça fait :** Extrait la balise `<footer>` (ou un div/section dont la classe contient "footer") et y cherche : année de copyright, réseaux sociaux avec leur URL, liens notables (carrières, app store, status page…), certifications de conformité (SOC 2, ISO 27001, GDPR…), forme juridique et siège social.

**Fichier :** `lib/services/scraper.ts`

```typescript
// Localisation du footer dans le HTML
function extractFooterHtml(html: string): string {
  const footerTag = html.match(/<footer[\s\S]*?<\/footer>/i)
  if (footerTag) return footerTag[0]
  const divFooter = html.match(
    /<(?:div|section)[^>]+(?:id|class)=["'][^"']*footer[^"']*["'][^>]*>[\s\S]{0,3000}/i,
  )
  if (divFooter) return divFooter[0]
  // Fallback : 15% bas de page
  return html.slice(Math.floor(html.length * 0.85))
}
```

```typescript
// Détection des réseaux sociaux sur l'URL du lien (href), pas le texte
const SOCIAL_PATTERNS: Array<[string, RegExp]> = [
  ['LinkedIn',     /linkedin\.com/i],
  ['Twitter / X',  /twitter\.com|x\.com/i],
  ['GitHub',       /github\.com/i],
  ['YouTube',      /youtube\.com/i],
  // ...
]

// Exemple de signal extrait :
// { name: 'LinkedIn', url: 'https://linkedin.com/company/stripe' }
```

```typescript
// Certifications de conformité
const CERT_PATTERNS: RegExp[] = [
  /soc\s*2/i,
  /iso\s*27001/i,
  /gdpr/i,
  /hipaa/i,
  /pci\s*dss/i,
  /fedramp/i,
]
```

---

## 8. Score de fit SaaS B2B

**Ce que ça fait :** Calcule un score /100 sur 4 dimensions pondérées, puis génère une explication textuelle. Permet de prioriser les comptes à contacter.

**Fichier :** `lib/services/scoring.ts`

```
Taille estimée   → 30 pts max  (scale-up ou enterprise = idéal)
Secteur          → 30 pts max  (SaaS, fintech, martech = high value)
Stack technique  → 25 pts max  (React, Stripe, Segment = stack cible)
Signaux GTM      → 20 pts max  (pricing, demo, free trial = traction)
Total plafonné à 100
```

```typescript
export function calculateFitScore(input: ScoringInput): ScoreBreakdown {
  const sizeScore     = scoreSizeEstimate(input.estimatedSize)
  const industryScore = scoreIndustry(input.industry)
  const techStackScore = scoreTechStack(input.techStack)
  const gtmScore      = scoreGTMSignals(input.gtmSignals)

  return {
    fitScore: Math.min(100, sizeScore + industryScore + techStackScore + gtmScore),
    sizeScore,
    industryScore,
    techStackScore,
    gtmScore,
  }
}
```

```typescript
// Niveaux de qualification générés automatiquement
function scoreLevel(score: number): string {
  if (score >= 75) return 'excellent fit'
  if (score >= 55) return 'bon fit'
  if (score >= 35) return 'compte à qualifier'
  return 'fit faible'
}
```

---

## 9. Enrichissement LLM agentique (optionnel)

**Ce que ça fait :** Si `GROQ_API_KEY` est présente, envoie le HTML scrapé à Groq (`openai/gpt-oss-120b`) pour enrichir la détection et extraire des signaux commerciaux impossibles à obtenir par regex. L'app fonctionne sans aucune clé (heuristiques locales).

Ce n'est plus un simple aller-retour prompt → JSON : le modèle a accès à un outil `fetch_page(path)` et décide **lui-même** s'il a besoin d'aller lire une autre page du site (`/pricing`, `/about`, `/customers`, `/docs`…) quand la homepage ne suffit pas — par exemple si aucun signal de prix ou de traction n'y apparaît. Remplace le crawl codé en dur envisagé dans le roadmap par une décision de l'agent, bornée à 2 appels par analyse pour protéger le quota Groq gratuit.

**Nouveaux champs extraits par le LLM :** segment cible, modèle de vente (PLG/SLG/hybrid), persona, signaux de traction quantifiés, concurrents mentionnés, signaux de financement, et `pagesExplored` (chemins effectivement fetchés par l'agent, affichés dans l'UI).

**Personnalisation ICP (optionnelle) :** un champ repliable dans le formulaire ("Personnaliser pour mon ICP") permet de décrire en une phrase son ICP (max 300 car.). S'il est renseigné, il est injecté dans le prompt entre délimiteurs explicites (même logique anti-injection que le contenu scrapé, S12) pour que le modèle priorise les `gtmSignals` et la description pertinents pour cet ICP — sans boucle de chat ni nouvelle route, un simple paramètre optionnel de plus dans l'appel existant.

**Mode lazy :** par défaut, l'appel LLM a lieu pendant l'analyse principale (`POST /api/analyze`). En mode lazy (`LAZY_LLM=true` ou bouton "IA lazy" dans le formulaire), il est différé à un second appel `POST /api/analyze-llm`, déclenché uniquement au clic sur l'onglet "Analyse IA". Permet d'économiser le quota journalier Groq (100 000 tokens/jour sur le tier gratuit).

**Fichiers :** `lib/services/llm.ts` · `lib/services/scraper.ts` (`fetchPageText`) · `app/api/analyze/route.ts` · `app/api/analyze-llm/route.ts`

```typescript
// Dans llm.ts — boucle agent : le modèle peut appeler fetch_page avant de répondre
for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
  const allowTools = toolCallCount < MAX_TOOL_CALLS
  const message = await callLLM(messages, allowTools ? [FETCH_PAGE_TOOL] : undefined)

  if (allowTools && message.tool_calls?.length) {
    messages.push(message)
    for (const call of message.tool_calls) {
      const { path } = JSON.parse(call.function.arguments)
      const page = await fetchPageText(baseUrl, path)   // S15 — même hostname, SSRF-safe
      if (page) pagesExplored.push(page.path)
      messages.push({ role: 'tool', tool_call_id: call.id, content: page ? redactPii(page.text) : `Page ${path} indisponible.` })
    }
    continue
  }
  finalContent = message.content ?? ''
  break
}
```

```typescript
// Dans analyze/route.ts — saut du LLM en mode lazy
const lazy = validated.lazyLlm ?? process.env.LAZY_LLM === 'true'
const llmEnabled = !lazy && Boolean(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY)

// analyze-llm/route.ts — appelé au clic sur l'onglet, retourne uniquement llmIntel
const scraped = await scrapeWebsite(url)
const llmAnalysis = await analyzeWebsiteWithLLM(scraped.html, scraped.title, scraped.description, scraped.scripts, url)
return toJsonResponse(createSuccessResponse({ llmIntel: { ..., pagesExplored: llmAnalysis.pagesExplored }, analysisSource: '...' }), 200)
```

---

## 10. Pipeline d'analyse (orchestration)

**Ce que ça fait :** La route API lance scraping et DNS en parallèle, puis Wikipedia après le scraping (nécessite le nom de l'entreprise). Le LLM (si activé et non lazy) tourne séquentiellement après le scraping car il en dépend. En mode lazy, un second appel à `POST /api/analyze-llm` est déclenché à la demande.

**Fichier :** `app/api/analyze/route.ts`

```typescript
// Scraping + DNS en parallèle
const [scraped, dnsIntel] = await Promise.all([
  scrapeWebsite(url),
  lookupDns(hostname).catch(() => ({ emailProvider: 'Unknown', toolsFromDns: [] })),
])

// Wikipedia après scraping (nécessite le nom de l'entreprise)
const companyName = estimateCompanyName(scraped, url)
const wikiIntel = await lookupCompanyWiki(companyName, hostname).catch(...)

// LLM séquentiel, sauté en mode lazy
const lazy = validated.lazyLlm ?? process.env.LAZY_LLM === 'true'
const llmAnalysis = !lazy && llmEnabled ? await analyzeWebsiteWithLLM(...) : undefined
```

---

## 11. Validation des entrées/sorties (Zod)

**Ce que ça fait :** Chaque requête est validée à l'entrée (URL normalisée, espaces supprimés) et chaque réponse peut être validée (fitScore borné entre 0 et 100, `analyzedAt` au format ISO).

**Fichier :** `lib/validation.ts`

```typescript
export const analyzeRequestSchema = z.object({
  url: z.string().trim().min(1).refine(isValidUrl, { message: 'Invalid URL' }),
})

export const analyzeResponseSchema = z.object({
  fitScore: z.number().min(0).max(100),
  analyzedAt: z.string().datetime(),
  techStack: z.array(z.object({
    name: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
  })),
  footerSignals: z.object({
    socialLinks: z.array(z.object({ name: z.string(), url: z.string() })),
    // ...
  }),
  // ...
})
```

---

## 12. Interface utilisateur (composants)

**Ce que ça fait :** L'UI est découpée en 7 cartes indépendantes, chacune responsable d'un bloc d'information. Elles partagent les types via `lib/types.ts`.

**Fichiers :** `app/components/`

| Composant | Contenu affiché |
|---|---|
| `CompanyCard` | Nom, URL, description, secteur, taille, logo, source d'analyse |
| `EnrichmentCard` | Screenshot, résumé Wikipedia, fondateur, CEO, année, lien wiki |
| `ScoreCard` | Score /100, niveau de fit, breakdown barres, explication, timestamp |
| `TechStackCard` | Stack détectée avec dots de confiance (vert/jaune/rouge) |
| `GtmCard` | Signaux GTM (pricing, demo, free trial…) sous forme de badges |
| `DnsCard` | Provider email, outils détectés via SPF |
| `FooterCard` | Année copyright, réseaux sociaux cliquables, certifications, siège |
| `LLMIntelCard` | Segment cible, modèle de vente, persona, traction, concurrents, financement |
| `Footer` | Copyright, stack technique, liens GitHub / LinkedIn |

```tsx
// Dans analyzer-app.tsx — composition des cartes
{result && (
  <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
    <div className="space-y-5">
      <CompanyCard {...} />
      <EnrichmentCard enrichment={result.enrichment} />
      <GtmCard gtmSignals={result.gtmSignals} />
      <DnsCard emailProvider={result.emailProvider} dnsTools={result.dnsTools} />
      <FooterCard footerSignals={result.footerSignals} />
      <TechStackCard techStack={result.techStack} />
    </div>
    <aside>
      <ScoreCard {...} />
    </aside>
  </div>
)}
```
