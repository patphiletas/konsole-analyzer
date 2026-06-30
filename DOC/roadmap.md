# Feuille de route — Kpratik

## Fait

### Jour 1 — Setup
- Initialisation Next.js 16 App Router + TypeScript
- Structure de projet : `app/`, `lib/`, `__tests__/`
- Configuration Vitest, gestion d'erreurs applicatives (`AppError`, `ErrorType`)
- Middleware API (format de réponse unifié `success/error`)
- Schémas Zod pour les payloads request/response

### Jour 2-3 — MVP scraping + LLM + scoring
- `scraper.ts` : fetch HTML, extraction title, meta description, keywords, scripts, liens, favicon
- `llm.ts` : enrichissement optionnel via OpenRouter (GPT-3.5-turbo)
- `scoring.ts` : score SaaS B2B /100 — taille (30), secteur (30), stack (25), GTM (20)
- `route.ts` : endpoint POST `/api/analyze`
- UI de base : formulaire, affichage du score et des signaux
- 34 tests initiaux

### Jour 4 — Enrichissement et qualité

**Heuristiques locales (sans API)**
- `heuristics.ts` : détection stack (20+ patterns), signaux GTM (10 patterns), secteur (8 patterns), taille estimée
- LLM rétrogradé en enrichissement optionnel — l'app fonctionne à coût zéro sans clé

**Analyse DNS**
- `dns.ts` : lookup TXT/MX via Google DoH (sans clé)
- SPF record → 30+ outils marketing/sales détectés (HubSpot, Salesforce, Klaviyo, Braze, Outreach…)
- MX record → provider email (Google Workspace, Microsoft 365, ProtonMail…)

**Confiance sur la stack technique**
- `TechSignal` : niveau `high` (script src) / `medium` (HTML) / `indicatif` (texte)
- Légende et dots colorés dans l'UI

**Enrichissement Wikipedia/Wikidata**
- `wiki.ts` : pipeline Wikipedia search → summary → Wikidata entity → labels
- Fondateur (P112), CEO (P169), année de création (P571)
- Filtre anti-faux-positif : le titre Wikipedia doit contenir le nom de la boîte
- Logo : favicon scrapé en priorité, Google favicon API en fallback

**UI**
- Composant `analyzer-app.tsx` extrait de `page.tsx`
- Breakdown du score par dimension (barres de progression)
- Section "Outils détectés via DNS" (violet)
- Section "Stack technique estimée" avec curseur de confiance
- Section "Données publiques" (logo, fondateur, CEO, année, résumé, lien Wikipedia)

**Qualité**
- 52 tests Vitest (7 fichiers)
- Corrections d'accentuation complètes (UI, scoring, README)
- Section "Signaux analysés" dans le README (tableau source → détection)

---

## Prévisionnel

### Court terme
- [ ] Crawl contrôlé sur pages clés : `/pricing`, `/about`, `/customers`, `/docs`
- [ ] Cache par domaine avec revalidation (éviter de re-scraper à chaque démo)
- [ ] Analyse `robots.txt` et `sitemap.xml` (signal taille et structure)
- [ ] Score configurable selon l'ICP de l'utilisateur

### Moyen terme
- [ ] Batch CSV : analyser une liste de comptes en une fois
- [ ] Export CRM (webhook HubSpot/Salesforce)
- [ ] Mode "evidence" : extraits exacts justifiant chaque signal détecté
- [ ] GitHub API : détecter langages, activité, nombre de repos publics

### Long terme / intégration Konsole
- [ ] Brique d'enrichissement compte au moment de l'import dans une liste cible
- [ ] Vue "account intelligence" pour SDR/AE
- [ ] Signal de routing pour plays GTM selon le score
- [ ] Personnalisation des messages outbound depuis les signaux détectés
