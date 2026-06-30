# Kpratik

Application web MVP pour analyser le site public d'une entreprise et produire des insights utiles à une équipe Revenue Engineering : description, secteur, taille estimée, stack technique, signaux GTM et score de fit SaaS B2B.

Application déployée : https://kpratik.vercel.app/

## Fonctionnalités

- Analyse d'une URL unique, avec ou sans protocole (`stripe.com` ou `https://stripe.com`).
- Scraping serveur des données publiques : title, meta description, keywords, scripts et liens.
- Détection heuristique de stack technique : Next.js, React, HubSpot, Stripe, Segment, Shopify, WordPress, etc.
- Détection de signaux GTM : pricing, demo, free trial, docs, API, blog, case studies, intégrations.
- Analyse DNS (TXT/MX) via Google DoH : outils marketing/sales depuis le SPF record, provider email depuis les MX.
- Scoring automatique sur 100 pour évaluer le fit d'une entreprise SaaS B2B.
- Explication du score obtenu avec le détail taille, secteur, stack et signaux GTM.
- Fallback 100% gratuit : l'application fonctionne sans clé API externe.
- Enrichissement optionnel par LLM via OpenRouter si `OPENROUTER_API_KEY` est configurée.
- UI responsive orientée usage sales/marketing, avec détail du score et preuves détectées.

## Stack technique

- Next.js 16 App Router + React 19 : frontend et API dans le même projet, simple à déployer sur Vercel.
- TypeScript : typage des contrats d'analyse et des services.
- Tailwind CSS 4 : itération rapide sur une UI propre et responsive.
- Zod 4 : validation de payload API.
- Vitest : tests unitaires sur validation, erreurs, scoring et heuristiques.

## Architecture

```txt
app/
  api/analyze/route.ts      Endpoint d'analyse
  api/analytics/route.ts    Stats simples in-memory
  page.tsx                  Interface principale
  dashboard/page.tsx        Vue stats technique
lib/
  services/scraper.ts       Fetch HTML + extraction title/meta/scripts/links
  services/heuristics.ts    Analyse locale sans API payante
  services/dns.ts           Lookup TXT/MX via Google DoH (outils SPF, provider email)
  services/llm.ts           Enrichissement OpenRouter optionnel
  services/scoring.ts       Score SaaS B2B et explication
  validation.ts             Schémas Zod
  api-middleware.ts         Format de réponse API
  errors.ts                 Erreurs applicatives
__tests__/                  Tests Vitest
```

## Lancement local

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Variables d'environnement

L'app fonctionne sans variable obligatoire.

Pour activer l'enrichissement LLM optionnel :

```bash
OPENROUTER_API_KEY=your_openrouter_key
```

Sans cette clé, le endpoint utilise uniquement l'analyse heuristique locale.

## Tests et build

```bash
npm test
npm run build
```

État actuel :

- `npm test` : 45 tests passent.
- `npm run build` : build production Next.js OK.

## Signaux analysés

Ce tableau recense ce que l'application cherche à détecter et comment elle le fait. À mettre à jour à chaque nouveau signal ou source ajoutée.

| Ce qu'on cherche | Comment on le trouve |
|---|---|
| **Nom de la boîte** | Balise `<title>` — partie avant le `\|` ou `-` |
| **Description** | `<meta name="description">` ou `<meta property="og:description">` |
| **Secteur** | Regex sur title, meta, liens et HTML — ex. `saas\|workflow\|crm` → SaaS |
| **Taille estimée** | Regex sur le texte — ex. `enterprise\|fortune 500` → Enterprise, `series [abcde]` → Scale-up |
| **Stack technique** | Trois niveaux de confiance : **Confirmé** (trouvé dans un `<script src>`) / **Probable** (dans le HTML) / **Indicatif** (mentionné dans le texte) |
| **Pricing page** | Regex liens + texte — `pricing\|plans\|tarifs` |
| **Demo booking** | Regex — `demo\|book a call\|contact sales` |
| **Free trial** | Regex — `free trial\|start free\|try for free` |
| **Sign up / PLG** | Regex — `sign up\|get started\|create account` |
| **Docs / API** | Regex — `docs\|documentation\|api reference` |
| **Blog / Content** | Regex — `blog\|resources\|guides\|academy` |
| **Case studies** | Regex — `case stud\|customers\|success stor` |
| **Intégrations** | Regex — `integration\|marketplace\|apps` |
| **Outils marketing/sales** | DNS TXT (SPF) via Google DoH — `include:hubspot.com` → HubSpot, `include:salesforce.com` → Salesforce, etc. (30+ outils mappés) |
| **Provider email** | DNS MX via Google DoH — ex. `aspmx.l.google.com` → Google Workspace, `protection.outlook.com` → Microsoft 365 |

Sources utilisées : **HTML public** (scraping), **DNS** (Google DoH, sans clé). Le **LLM** (OpenRouter) est optionnel et enrichit les champs companyName, description, industry, estimatedSize si une clé est configurée.

## Logique de scoring

Le score est pensé pour une entreprise qui vend à des SaaS B2B :

- Taille estimée : jusqu'à 30 points.
- Secteur : jusqu'à 30 points.
- Stack technique : jusqu'à 25 points.
- Signaux GTM : jusqu'à 20 points.

Le total est borné à 100. L'objectif n'est pas de donner une vérité absolue, mais un premier tri actionnable pour prioriser des comptes.

L'explication affichée reprend le total, les points obtenus par catégorie et les indices qui ont influencé la note : secteur détecté, taille estimée, technologies observées et signaux GTM visibles.

## Choix techniques

J'ai privilégié un MVP robuste et testable plutôt qu'une dépendance forte à une API d'enrichissement. Les APIs type Clearbit/Hunter peuvent être puissantes, mais elles ajoutent vite des limites de quota, de coût ou de disponibilité. Ici, le scraping public donne déjà des signaux utiles et l'app reste testable live à coût zéro.

Le LLM est branché comme couche optionnelle : si une clé OpenRouter existe, il enrichit le résultat ; sinon l'expérience produit reste fonctionnelle. C'est volontaire pour éviter le cas "demo qui plante parce qu'une clé manque".

## Limites actuelles

- Analyse uniquement la page d'accueil et ses liens visibles, pas un crawl complet.
- Les estimations de taille restent heuristiques.
- Pas de cache persistant ni historique utilisateur.
- Certaines stacks masquées par CDN ou bundling ne sont pas détectables depuis le HTML public.
- Pas encore de screenshots, d'analyse LinkedIn ou d'enrichissement domaine/email.

## Améliorations avec plus de temps

- Crawl contrôlé sur quelques pages clés : `/pricing`, `/customers`, `/docs`, `/about`.
- Cache par domaine avec revalidation pour accélérer les démos et réduire les fetchs externes.
- Batch CSV pour analyser une liste de comptes.
- Score configurable selon l'ICP de l'utilisateur.
- Export CRM ou webhook vers HubSpot/Salesforce.
- Ajout d'un mode "evidence" avec extraits exacts justifiant chaque signal.

## Intégration dans Konsole

Dans un produit comme Konsole, ce module pourrait devenir une brique d'enrichissement compte :

- au moment de l'import d'un compte dans une liste cible ;
- dans une vue "account intelligence" pour aider les SDR/AE à prioriser ;
- comme signal de routing pour lancer des plays GTM différents selon le score ;
- comme source d'explication pour personnaliser les messages outbound.

## Déploiement

Le projet est compatible Vercel.

URL de production actuelle : https://kpratik.vercel.app/

1. Pousser le repo sur GitHub.
2. Importer le repo dans Vercel.
3. Ajouter `OPENROUTER_API_KEY` seulement si l'enrichissement LLM est souhaité.
4. Deploy.

Commande locale de vérification avant deploy :

```bash
npm test
npm run build
```
