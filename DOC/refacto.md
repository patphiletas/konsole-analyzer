# Pistes de refactorisation — Kpratik

Chaque point est indépendant. À traiter un par un selon la priorité.

---

## R1 — `analyzer-app.tsx` : god component à découper

**Problème :** 492 lignes dans un seul fichier — interfaces, utilitaires, sous-composants et logique de fetch mélangés.

**Candidats à l'extraction :**
- `app/components/BreakdownBar.tsx`
- `app/components/EnrichmentCard.tsx`
- `app/components/DnsCard.tsx`
- `app/components/TechStackCard.tsx`
- `lib/types.ts` pour les interfaces (`TechSignal`, `Enrichment`, `ScoreBreakdown`, `AnalysisResult`)

**Impact :** lisibilité, testabilité des sous-composants, facilité d'ajout de features.

- [x] Fait — `lib/types.ts` + 7 composants extraits (`BreakdownBar`, `ScoreCard`, `CompanyCard`, `EnrichmentCard`, `GtmCard`, `DnsCard`, `FooterCard`, `TechStackCard`). `analyzer-app.tsx` : 574 → 148 lignes.

---

## R2 — `route.ts` : IIFE favicon et orchestration trop dense

**Problème :** La route fait trop de choses. L'IIFE inline pour résoudre le favicon est illisible et non testable :
```ts
(() => { try { return new URL(scraped.favicon, `https://${hostname}`).href } catch { return wikiIntel.logoUrl } })()
```

**Solution :** Extraire une fonction nommée dans `lib/utils.ts` :
```ts
function resolveFaviconUrl(favicon: string, hostname: string, fallback: string): string
```

**Impact :** la route devient plus lisible, la fonction devient testable unitairement.

- [x] Fait — `lib/utils.ts` : `buildFaviconUrl`, `buildScreenshotUrl`, `resolveFaviconUrl` (+ validation protocole http/https). IIFE supprimée dans `route.ts`. 6 tests dans `__tests__/lib/utils.test.ts`.

---

## R3 — `roughName` : heuristique fragile pour Wikipedia

**Problème :** Le nom de la boîte envoyé à Wikipedia est dérivé du hostname :
```ts
hostname.split('.')[0].replace(/^\w/, (l) => l.toUpperCase())
```
`app.hubspot.com` → `"App"`, `go.stripe.com` → `"Go"` — résultats incorrects sur les sous-domaines.

**Solution :** Utiliser le titre HTML scrapé (`scraped.title`) en priorité, avec le hostname comme fallback. Plus fiable et déjà disponible sans appel supplémentaire.

**Impact :** réduction des faux positifs Wikipedia, meilleur enrichissement.

- [x] Fait — `estimateCompanyName` exportée depuis `heuristics.ts`. Dans `route.ts` : scrape + DNS en parallèle, puis `lookupCompanyWiki` avec le titre scrapé. Regex étendue aux tirets longs (en-dash `–`, em-dash `—`). Fallback hostname corrigé pour les sous-domaines (`app.hubspot.com` → `hubspot`). 5 tests dans `heuristics.test.ts`.

---

## R4 — `heuristics.ts` : patterns sans structure de poids

**Problème :** `TECH_PATTERNS`, `INDUSTRY_PATTERNS`, `GTM_PATTERNS` sont des `Array<[string, RegExp]>`. La logique de scoring (`scriptSource` / `htmlSource` / `textSource`) est dupliquée en boucle pour chaque niveau.

**Solution :** Typer les patterns explicitement :
```ts
interface Pattern {
  name: string
  regex: RegExp
  source: 'script' | 'html' | 'text'
}
```
Ou regrouper les trois niveaux dans un seul tableau avec un champ `confidence` natif.

**Impact :** plus facile d'ajouter des patterns, logique de détection centralisée.

- [x] Fait — `type PatternEntry = { name: string; regex: RegExp }` introduit. Les trois tableaux (`TECH_PATTERNS`, `INDUSTRY_PATTERNS`, `GTM_PATTERNS`) migrent des tuples `[string, RegExp]` vers des objets nommés. `detectByPatterns` et `detectTechStack` utilisent la destructuration objet `{ name, regex }`. 65 tests — aucune régression.

---

## R5 — URLs Thum.io et Google favicon dupliquées

**Problème :** Les mêmes chaînes templates apparaissent à plusieurs endroits (`wiki.ts`, fallback `.catch()` dans `route.ts`). Source du bug #7 (`encodeURIComponent`).

**Solution :** Centraliser dans `lib/utils.ts` :
```ts
export const buildScreenshotUrl = (domain: string) =>
  `https://image.thum.io/get/width/1280/crop/800/https://${domain}`

export const buildFaviconUrl = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
```

**Impact :** un seul endroit à modifier si l'URL du service change.

- [x] Fait — centralisé dans `lib/utils.ts` (R2/R5 traités ensemble).

---

## R6 — Interfaces TypeScript dupliquées entre Zod et le composant

**Problème :** `AnalyzeResponse` est inférée depuis Zod dans `validation.ts`, mais `TechSignal`, `Enrichment`, `ScoreBreakdown`, `AnalysisResult` sont redéfinies manuellement dans `analyzer-app.tsx`. Un changement de schéma oblige à mettre à jour les deux.

**Solution :** Importer directement le type inféré :
```ts
import type { AnalyzeResponse } from '@/lib/validation'
```
Et supprimer les interfaces redondantes dans le composant.

**Impact :** source unique de vérité pour les types, cohérence garantie à la compilation.

- [x] Fait — `lib/types.ts` réécrit : toutes les interfaces manuelles (`AnalysisResult`, `Enrichment`, `FooterSignals`, `ScoreBreakdown`, `TechSignal`, `ConfidenceLevel`, `FooterLink`, `LLMIntel`) remplacées par des types dérivés de `AnalyzeResponse` via indexed access types (`AnalyzeResponse['enrichment']`, etc.). Aucun composant modifié — les noms exportés sont identiques. 65 tests, 0 erreur TypeScript.
