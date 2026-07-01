# Kpratik

Application web d'intelligence commerciale B2B : analyse le site public d'une entreprise et produit des insights actionnables pour une équipe Revenue Engineering — stack technique, signaux GTM, données publiques enrichies et score de fit SaaS B2B /100.

Application déployée : https://kpratik.vercel.app/

---

## Fonctionnalités

### Analyse sans clé API (coût zéro)
- Scraping serveur de la page d'accueil : title, meta description, keywords, scripts, liens, favicon.
- Détection heuristique de 20+ technologies (Next.js, React, HubSpot, Stripe, Segment, Shopify, Cloudflare…) avec niveau de confiance : **Confirmé** (script src) / **Probable** (HTML) / **Indicatif** (texte).
- Détection de 10 signaux GTM : pricing, demo, free trial, docs, API, blog, case studies, intégrations, newsletter, PLG signup.
- Intelligence DNS via Google DoH (sans clé) : 30+ outils marketing/sales depuis le SPF record, provider email depuis les MX records.
- Signaux footer : année de copyright, réseaux sociaux (avec URL), certifications (SOC 2, ISO 27001, GDPR…), forme juridique, siège social.
- Logo : favicon scrapé en priorité, Google Favicons API en fallback.
- Screenshot : aperçu visuel via Thum.io, scrollable dans son cadre.
- Score de fit SaaS B2B /100 avec explication textuelle et breakdown par dimension.

### Enrichissement Wikipedia / Wikidata (gratuit)
- Recherche automatique de la page Wikipedia de l'entreprise avec filtre anti-faux-positif.
- Résumé (400 car. max), fondateur, CEO, année de création, lien Wikipedia.
- Données économiques Wikidata : nombre de salariés, siège social, cotation boursière, groupe parent, chiffre d'affaires, bénéfice net — valeur la plus récente (rang `preferred` ou dernière entrée).

### Intelligence commerciale IA (optionnel)
Activé si `GROQ_API_KEY` ou `OPENROUTER_API_KEY` est configurée. Groq (Llama 3.3 70B) est le primaire, OpenRouter `:free` est le fallback automatique.

Champs extraits par le LLM, impossibles à obtenir par regex :
- **Segment cible** : startup / SMB / mid-market / enterprise
- **Modèle de vente** : PLG / SLG / hybrid
- **Persona principal** : developer / RevOps / IT / finance / marketing…
- **Signaux de traction** : chiffres quantifiés ("10 000+ customers", "processing $1B+")
- **Concurrents mentionnés** : alternatives citées sur le site
- **Signaux de financement** : YC, Series A/B, investisseurs

---

## Stack technique

- **Next.js 16 App Router + React 19** — frontend et API serverless dans le même projet, déployé sur Vercel
- **TypeScript** — typage strict des contrats d'analyse et des services
- **Tailwind CSS 4** — UI responsive orientée usage sales/marketing
- **Zod 4** — validation des payloads API
- **Vitest** — 60 tests unitaires sur tous les services

---

## Architecture

```
app/
  api/analyze/route.ts        Endpoint principal — orchestre tous les services
  components/
    analyzer-app.tsx          Shell UI (state, form, composition des cartes)
    CompanyCard.tsx            Nom, secteur, taille, logo, source d'analyse
    EnrichmentCard.tsx         Données Wikipedia/Wikidata
    LLMIntelCard.tsx           Intelligence commerciale IA
    ScoreCard.tsx              Score /100, breakdown, explication
    TechStackCard.tsx          Stack avec dots de confiance
    GtmCard.tsx                Signaux GTM
    DnsCard.tsx                Provider email + outils DNS
    FooterCard.tsx             Signaux footer
lib/
  services/
    scraper.ts                Fetch HTML + extraction title/meta/scripts/links/footer
    heuristics.ts             Analyse locale — stack, GTM, secteur, taille
    dns.ts                    Lookup TXT/MX via Google DoH
    wiki.ts                   Enrichissement Wikipedia + Wikidata
    llm.ts                    Groq (primaire) + OpenRouter :free (fallback)
    scoring.ts                Score SaaS B2B et explication textuelle
  types.ts                    Interfaces TypeScript partagées
  utils.ts                    buildFaviconUrl, buildScreenshotUrl, resolveFaviconUrl
  validation.ts               Schémas Zod
  api-middleware.ts           Format de réponse API unifié
  errors.ts                   Erreurs applicatives typées
__tests__/                    60 tests Vitest (8 fichiers)
.github/workflows/ci.yml      CI : TypeScript + tests à chaque push/PR
```

---

## Lancement local

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

---

## Variables d'environnement

L'application fonctionne sans aucune variable obligatoire.

```bash
# Enrichissement LLM (optionnel) — un seul suffit
GROQ_API_KEY=gsk_...           # groq.com — gratuit, Llama 3.3 70B (primaire)
OPENROUTER_API_KEY=sk-or-...   # openrouter.ai — fallback sur modèle :free
```

Sans ces clés, l'app utilise uniquement les heuristiques locales et Wikidata — l'expérience reste complète et fonctionnelle.

---

## Tests et build

```bash
npm test        # 60 tests Vitest
npm run build   # build production Next.js
```

---

## Signaux analysés

| Ce qu'on cherche | Source | Comment |
|---|---|---|
| Nom de la boîte | HTML | Balise `<title>` — partie avant le `\|` ou `-` |
| Description | HTML | `<meta name="description">` ou `og:description` |
| Secteur | HTML (heuristiques) | Regex sur title, meta, liens — ex. `saas\|workflow\|crm` |
| Taille estimée | HTML (heuristiques) | Regex — `enterprise\|fortune 500` / `series [abcde]` |
| Stack technique | HTML (heuristiques) | 3 niveaux de confiance selon la source (script src / HTML / texte) |
| Signaux GTM | HTML (heuristiques) | Pricing, demo, free trial, docs, blog, case studies… |
| Outils marketing/sales | DNS SPF | `include:hubspot.com` → HubSpot (30+ outils mappés) |
| Provider email | DNS MX | `aspmx.l.google.com` → Google Workspace |
| Réseaux sociaux | Footer HTML | Extraction sur `href` — retourne le nom + l'URL |
| Certifications | Footer HTML | SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, FedRAMP |
| Fondateur / CEO / Année | Wikidata | Claims P112, P169, P571 — rang `preferred` ou dernière valeur |
| Salariés / CA / Bénéfice | Wikidata | Claims P1128, P2139, P2295 — rang `preferred` ou dernière valeur |
| Siège social / Cotation | Wikidata | Claims P159, P414 → labels FR/EN |
| Screenshot | Thum.io | URL directe, pas de clé requise |
| Logo | Favicon scrapé + Google Favicons API | Fallback si absent ou protocole invalide |
| Segment / Persona / Modèle | LLM (optionnel) | Groq Llama 3.3 70B ou OpenRouter :free |
| Traction / Concurrents / Financement | LLM (optionnel) | Extraction depuis le HTML complet |

---

## Logique de scoring

Score pensé pour une entreprise qui vend à des SaaS B2B :

| Dimension | Points max | Signal fort |
|---|---|---|
| Taille estimée | 30 | Scale-up ou enterprise |
| Secteur | 30 | SaaS, fintech, martech |
| Stack technique | 25 | React, Stripe, Segment, HubSpot |
| Signaux GTM | 20 | Pricing + demo + free trial |

Total plafonné à 100. Niveaux : **excellent fit** (≥75) / **bon fit** (≥55) / **compte à qualifier** (≥35) / **fit faible**.

---

## Choix techniques

Priorité à un MVP robuste sans dépendance critique à des APIs payantes. Les heuristiques locales + Wikidata (gratuit) + DNS public donnent déjà des signaux utiles à coût zéro. Le LLM est une couche optionnelle qui enrichit sans bloquer si la clé est absente.

La décomposition en 8 composants UI (vs un god component) et en services indépendants facilite les tests et l'évolution feature par feature.

---

## Limites actuelles

- Analyse uniquement la page d'accueil — pas de crawl multi-pages.
- Les estimations heuristiques (taille, secteur) restent approximatives.
- Pas de cache persistant : chaque analyse re-scrappe le site.
- Certaines stacks masquées par CDN ou bundling ne sont pas détectables.
- Wikidata est bien couvert pour les grandes entreprises cotées, moins pour les SaaS early-stage.

---

## Déploiement

Compatible Vercel (serverless, `maxDuration: 20s` sur le endpoint d'analyse).

```
1. Pousser le repo sur GitHub
2. Importer dans Vercel
3. Ajouter GROQ_API_KEY (optionnel) dans les variables d'environnement Vercel
4. Deploy
```

URL de production : https://kpratik.vercel.app/
