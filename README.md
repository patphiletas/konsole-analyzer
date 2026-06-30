# Kpratik

Application web MVP pour analyser le site public d'une entreprise et produire des insights utiles a une equipe Revenue Engineering : description, secteur, taille estimee, stack technique, signaux GTM et score de fit SaaS B2B.

Application deployee : https://kpratik.vercel.app/

## Fonctionnalites

- Analyse d'une URL unique, avec ou sans protocole (`stripe.com` ou `https://stripe.com`).
- Scraping serveur des donnees publiques : title, meta description, keywords, scripts et liens.
- Detection heuristique de stack technique : Next.js, React, HubSpot, Stripe, Segment, Shopify, WordPress, etc.
- Detection de signaux GTM : pricing, demo, free trial, docs, API, blog, case studies, integrations.
- Scoring automatique sur 100 pour evaluer le fit d'une entreprise SaaS B2B.
- Explication du score obtenu avec le detail taille, secteur, stack et signaux GTM.
- Fallback 100% gratuit : l'application fonctionne sans cle API externe.
- Enrichissement optionnel par LLM via OpenRouter si `OPENROUTER_API_KEY` est configuree.
- UI responsive orientee usage sales/marketing, avec detail du score et preuves detectees.

## Stack technique

- Next.js 16 App Router + React 19 : frontend et API dans le meme projet, simple a deployer sur Vercel.
- TypeScript : typage des contrats d'analyse et des services.
- Tailwind CSS 4 : iteration rapide sur une UI propre et responsive.
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
  services/llm.ts           Enrichissement OpenRouter optionnel
  services/scoring.ts       Score SaaS B2B et explication
  validation.ts             Schemas Zod
  api-middleware.ts         Format de reponse API
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

Sans cette cle, le endpoint utilise uniquement l'analyse heuristique locale.

## Tests et build

```bash
npm test
npm run build
```

Etat actuel :

- `npm test` : 34 tests passent.
- `npm run build` : build production Next.js OK.

## Logique de scoring

Le score est pense pour une entreprise qui vend a des SaaS B2B :

- Taille estimee : jusqu'a 30 points.
- Secteur : jusqu'a 30 points.
- Stack technique : jusqu'a 25 points.
- Signaux GTM : jusqu'a 20 points.

Le total est borne a 100. L'objectif n'est pas de donner une verite absolue, mais un premier tri actionnable pour prioriser des comptes.

L'explication affichee reprend le total, les points obtenus par categorie et les indices qui ont influence la note : secteur detecte, taille estimee, technologies observees et signaux GTM visibles.

## Choix techniques

J'ai privilegie un MVP robuste et testable plutot qu'une dependance forte a une API d'enrichissement. Les APIs type Clearbit/Hunter peuvent etre puissantes, mais elles ajoutent vite des limites de quota, de cout ou de disponibilite. Ici, le scraping public donne deja des signaux utiles et l'app reste testable live a cout zero.

Le LLM est branche comme couche optionnelle : si une cle OpenRouter existe, il enrichit le resultat ; sinon l'experience produit reste fonctionnelle. C'est volontaire pour eviter le cas "demo qui plante parce qu'une cle manque".

## Limites actuelles

- Analyse uniquement la page d'accueil et ses liens visibles, pas un crawl complet.
- Les estimations de taille restent heuristiques.
- Pas de cache persistant ni historique utilisateur.
- Certaines stacks masquees par CDN ou bundling ne sont pas detectables depuis le HTML public.
- Pas encore de screenshots, d'analyse LinkedIn ou d'enrichissement domaine/email.

## Ameliorations avec plus de temps

- Crawl controle sur quelques pages clefs : `/pricing`, `/customers`, `/docs`, `/about`.
- Cache par domaine avec revalidation pour accelerer les demos et reduire les fetchs externes.
- Batch CSV pour analyser une liste de comptes.
- Score configurable selon l'ICP de l'utilisateur.
- Export CRM ou webhook vers HubSpot/Salesforce.
- Ajout d'un mode "evidence" avec extraits exacts justifiant chaque signal.

## Integration dans Konsole

Dans un produit comme Konsole, ce module pourrait devenir une brique d'enrichissement compte :

- au moment de l'import d'un compte dans une liste cible ;
- dans une vue "account intelligence" pour aider les SDR/AE a prioriser ;
- comme signal de routing pour lancer des plays GTM differents selon le score ;
- comme source d'explication pour personnaliser les messages outbound.

## Deploiement

Le projet est compatible Vercel.

URL de production actuelle : https://kpratik.vercel.app/

1. Pousser le repo sur GitHub.
2. Importer le repo dans Vercel.
3. Ajouter `OPENROUTER_API_KEY` seulement si l'enrichissement LLM est souhaite.
4. Deploy.

Commande locale de verification avant deploy :

```bash
npm test
npm run build
```
