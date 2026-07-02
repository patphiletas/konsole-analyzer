# Kpratik

Application web d'intelligence commerciale B2B : analyse le site public d'une entreprise et produit des informations actionnables pour une équipe sales ou marketing — stack technique, signaux commerciaux, données publiques enrichies et score de fit /100.

Application déployée : https://kpratik.vercel.app/

---

## Ce que ça fait

Tu entres un domaine (`stripe.com`, `hubspot.com`…). L'app analyse le site sans aucune API payante et te retourne :

- qui est cette entreprise (nom, secteur, taille estimée, description)
- quels outils techniques elle utilise (React, Stripe, Segment, Shopify…)
- comment elle vend (page pricing, démo, essai gratuit, documentation publique…)
- quels outils email/marketing elle a déployés, détectés via ses DNS
- des données publiques enrichies (Wikipedia, Wikidata)
- un score /100 indiquant à quel point elle correspond à une cible SaaS B2B

---

## Fonctionnalités

### Analyse gratuite, sans clé API
- Scraping de la page d'accueil : titre, description, scripts, liens, favicon.
- Détection de 20+ technologies avec niveau de confiance : **Confirmé** (présent dans un script chargé) / **Probable** (dans le HTML) / **Indicatif** (mentionné dans le texte).
- Détection de signaux commerciaux : page de prix, demande de démo, essai gratuit, documentation, blog, études de cas, intégrations, newsletter, inscription produit.
- Analyse des enregistrements DNS : 30+ outils marketing et commerciaux détectés via l'enregistrement d'envoi d'email (HubSpot, Salesforce, Klaviyo, Outreach, Braze…), provider email détecté via les enregistrements de routage (Google Workspace, Microsoft 365…).
- Signaux dans le footer : année de création, réseaux sociaux (avec lien), certifications de conformité (SOC 2, ISO 27001, RGPD…), forme juridique, siège social.
- Logo : favicon du site en priorité, Google Favicons en fallback.
- Screenshot : aperçu visuel de la page d'accueil via Thum.io, scrollable dans son cadre.
- Score /100 avec explication textuelle et détail par dimension.

### Enrichissement Wikipedia / Wikidata (gratuit)
- Recherche automatique de la page Wikipedia de l'entreprise, avec filtre pour éviter les faux positifs.
- Résumé, fondateur, dirigeant actuel, année de création, lien Wikipedia.
- Données économiques issues de Wikidata : nombre de salariés, siège social, place boursière, groupe parent, chiffre d'affaires, bénéfice net — toujours la valeur la plus récente disponible.

### Analyse par intelligence artificielle (optionnel)
Activée si une clé API est configurée. L'IA lit le site et en déduit des informations que les patterns textuels ne peuvent pas capturer :

- **À qui s'adresse le produit** : startups, petites entreprises, mid-market ou grands comptes
- **Comment l'entreprise vend** : autonomie utilisateur (le produit se vend lui-même via un essai) ou vente commerciale (demo, contact sales), ou les deux
- **Qui est l'acheteur principal** : développeur, équipe commerciale, IT, finance, marketing…
- **Signaux de traction** : chiffres quantifiés trouvés sur le site ("10 000+ clients", "1 milliard de transactions traités")
- **Concurrents mentionnés** : alternatives citées explicitement sur le site
- **Signaux de financement** : accélérateurs, tours de table, investisseurs mentionnés

---

## Stack technique

- **Next.js 16 App Router + React 19** — frontend et API dans le même projet, déployé sur Vercel
- **TypeScript** — typage strict des contrats de données et des services
- **Tailwind CSS 4** — interface responsive orientée usage commercial
- **Zod 4** — validation des données échangées avec l'API
- **Vitest** — 88 tests unitaires couvrant tous les services

---

## Architecture

```
app/
  api/analyze/route.ts        Point d'entrée API — orchestre tous les services
  components/
    analyzer-app.tsx          Interface principale (formulaire + composition)
    CompanyCard.tsx            Identité de l'entreprise
    EnrichmentCard.tsx         Données Wikipedia / Wikidata
    LLMIntelCard.tsx           Analyse par intelligence artificielle
    ScoreCard.tsx              Score et explication
    TechStackCard.tsx          Stack technique avec niveaux de confiance
    GtmCard.tsx                Signaux commerciaux détectés
    DnsCard.tsx                Outils et provider email (DNS)
    FooterCard.tsx             Signaux extraits du footer
lib/
  services/
    scraper.ts                Récupération et extraction du HTML public
    heuristics.ts             Analyse locale — stack, signaux, secteur, taille
    dns.ts                    Lecture des enregistrements DNS via l'API Google
    wiki.ts                   Enrichissement Wikipedia + Wikidata
    llm.ts                    Analyse IA — Groq en primaire, OpenRouter en fallback
    scoring.ts                Calcul du score et génération de l'explication
  types.ts                    Interfaces TypeScript partagées
  utils.ts                    Construction des URLs (favicon, screenshot)
  validation.ts               Schémas de validation Zod
  api-middleware.ts           Format de réponse API unifié
  errors.ts                   Gestion des erreurs applicatives
  ratelimit.ts                Rate limiting Upstash (10 req/60s par IP)
__tests__/                    88 tests Vitest (11 fichiers)
.github/workflows/ci.yml      Intégration continue : audit, typage + tests à chaque push
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
# Analyse par IA (optionnel) — une seule clé suffit
GROQ_API_KEY=gsk_...                          # groq.com — gratuit, Llama 3.3 70B (recommandé)
OPENROUTER_API_KEY=sk-or-...                  # openrouter.ai — fallback automatique si Groq échoue

# Rate limiting (optionnel) — console.upstash.com, tier gratuit
UPSTASH_REDIS_REST_URL=https://...            # URL REST de la base Upstash
UPSTASH_REDIS_REST_TOKEN=...                  # Token d'accès Upstash
```

Sans ces clés, l'application fonctionne entièrement : heuristiques locales + Wikipedia/Wikidata, sans LLM ni rate limiting. Le rate limiting est recommandé en production pour protéger le quota LLM.

---

## Tests et build

```bash
npm test        # 88 tests
npm run build   # build production
```

---

## Logique de scoring

Le score est pensé pour qualifier une entreprise comme cible commerciale d'un éditeur SaaS B2B :

| Dimension | Points max | Ce qui donne un score élevé |
|---|---|---|
| Taille estimée | 30 | Scale-up ou grande entreprise |
| Secteur | 30 | Logiciel, fintech, marketing tech |
| Stack technique | 25 | Outils modernes (React, Stripe, Segment…) |
| Signaux commerciaux | 20 | Page de prix + démo + essai gratuit |

Total plafonné à 100. Niveaux de qualification : **excellent fit** (≥75) / **bon fit** (≥55) / **compte à qualifier** (≥35) / **fit faible**.

---

## Limites actuelles

- Analyse uniquement la page d'accueil — pas de navigation sur les sous-pages.
- Les estimations de taille et de secteur restent approximatives.
- Pas de cache : chaque analyse refait une requête vers le site.
- Certaines stacks masquées par du bundling ou un CDN ne sont pas détectables.
- Les données Wikidata sont fiables pour les grandes entreprises connues, moins pour les startups récentes.

---

## Déploiement

Compatible Vercel (fonctions serverless, délai d'analyse limité à 20 secondes).

```
1. Pousser le repo sur GitHub
2. Importer dans Vercel
3. Ajouter GROQ_API_KEY dans les variables d'environnement (optionnel)
4. Deploy
```

URL de production : https://kpratik.vercel.app/

---

## Intégration dans Konsole

Dans un produit comme Konsole, ce module pourrait devenir une brique d'enrichissement compte :

- au moment de l'import d'une liste de cibles commerciales
- dans une vue de qualification pour aider les commerciaux à prioriser
- comme déclencheur pour orienter les actions selon le score obtenu
- comme source d'informations pour personnaliser les messages de prospection
