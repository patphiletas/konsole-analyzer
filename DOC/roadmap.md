# Feuille de route — Kpratik

## Fait

- [x] **Setup projet** — Next.js 16 App Router + TypeScript, Vitest, gestion d'erreurs (`AppError`), middleware API (format réponse unifié), schémas Zod *(setup initial)*
- [x] **Scraping HTML** — fetch page d'accueil, extraction title, meta, scripts, liens, favicon *(MVP)*
- [x] **Score de fit SaaS B2B /100** — taille (30pts), secteur (30pts), stack (25pts), GTM (20pts), explication textuelle *(MVP)*
- [x] **Enrichissement LLM optionnel** — Groq (Llama 3.3 70B) en primaire, OpenRouter `:free` en fallback — activé si clé présente, sinon heuristiques locales *(MVP)*
- [x] **Intelligence commerciale IA** — segment cible, modèle de vente (PLG/SLG/hybrid), persona, signaux de traction, concurrents mentionnés, financement — carte dédiée dans l'UI *(enrichissement)*
- [x] **Heuristiques locales** — détection stack (20+ patterns), signaux GTM (10 patterns), secteur, taille estimée — app fonctionnelle à coût zéro *(enrichissement)*
- [x] **Intelligence DNS** — lookup TXT/MX via Google DoH (sans clé), SPF → 30+ outils détectés (HubSpot, Salesforce, Klaviyo…), MX → provider email *(enrichissement)*
- [x] **Curseur de confiance sur la stack** — `high` (script src) / `medium` (HTML) / `low` (texte), dots colorés dans l'UI *(enrichissement)*
- [x] **Enrichissement Wikipedia/Wikidata** — fondateur, CEO, année de création, résumé, lien — filtre anti-faux-positif sur le titre *(enrichissement)*
- [x] **Données économiques Wikidata** — salariés, siège social, cotation boursière, groupe parent, chiffre d'affaires, bénéfice net — sélection du rang `preferred` ou de la valeur la plus récente *(enrichissement)*
- [x] **Logo** — favicon scrapé en priorité, Google favicon API en fallback *(enrichissement)*
- [x] **Screenshot** — aperçu visuel via Thum.io, scrollable dans son cadre, masqué si indisponible *(enrichissement)*
- [x] **Signaux footer** — extraction `<footer>` : année de copyright, réseaux sociaux, certifications (SOC 2, ISO 27001…), forme juridique, siège social *(enrichissement)*
- [x] **UI** — composant `analyzer-app.tsx`, breakdown score, section DNS (violet), stack avec confiance, données publiques *(enrichissement)*
- [x] **Dossier DOC** — roadmap, sujet, tests, pitch vidéo *(documentation)*
- [x] **60 tests Vitest** — 8 fichiers couvrant tous les services (errors, validation, middleware, utils, heuristics, scoring, DNS, wiki) *(qualité)*
- [x] **CI/CD GitHub Actions** — TypeScript + tests à chaque push/PR sur `main` *(qualité)*

---

## À faire

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
