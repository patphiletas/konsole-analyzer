# Konsole Analyzer

Analyse automatique de sites web pour extraire insights GTM et scorer le fit "SaaS B2B".

## Architecture

```
Frontend: Next.js 14 + React + Tailwind
Backend: Next.js API Routes
LLM: OpenRouter (gratuit)
Tests: Vitest + @testing-library (60-70% coverage)
Hosting: Vercel (auto-deploy GitHub)
```

## Features Phase 1 (MVP)

- ✅ Analyse URL unique
- ✅ Détection tech stack
- ✅ Signaux GTM
- ✅ Score fit (0-100)
- ✅ UI propre + responsive
- ✅ Error handling centralisé
- ✅ Analytics tracking
- ✅ Tests unitaires + intégration

## Roadmap

### Phase 2 (2-3 semaines)
- Cache résultats + historique
- Dashboard utilisateur
- Filtres/recherche résultats

### Phase 3 (4-6 semaines)
- Upload CSV (batch analysis)
- Export résultats
- Webhooks pour intégrations

### Phase 4 (8+ semaines)
- Scoring custom par équipe
- API publique
- Collaboration real-time

## Getting Started

### Installation locale

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Variables d'environnement

Créer `.env.local`:
```
OPENROUTER_API_KEY=votre_clé_openrouter
```

### Tests

```bash
npm test
npm test:watch
npm test:coverage
```

### Build + Deploy Vercel

```bash
npm run build
# Git push trigger auto-deploy via Vercel
```

## Limitations Actuelles

- Une seule URL par requête (Phase 3: batch)
- Pas d'historique (Phase 2: implémentation)
- Cache non persistant (Phase 2: DB)
- UI mobile basique (Phase 2: polish)

## Choix Techniques

**OpenRouter vs Claude API:**
- OpenRouter: gratuit + stable
- Pas besoin de clé Anthropic
- Fallback models si problème

**Scraping HTML basique:**
- Pas de Clearbit (payant)
- Récupère: title, meta, scripts, favicon
- Claude analyse le contexte

**Error handling centralisé:**
- Enum `ErrorType` pour tous les cas
- Middleware API standardisé
- React Error Boundaries pour UI

**Tests early:**
- Chemins critiques (API, validation, scoring)
- 60-70% coverage target
- Integration tests avec mocks API

## Structure Projet

```
app/
  ├── api/analyze/       # Phase 1: endpoint principal
  ├── dashboard/         # Phase 2: historique + stats
  ├── components/        # React components
  ├── page.tsx          # Home (form + résultats)
  ├── layout.tsx
  ├── error.tsx         # Error boundary
  ├── global-error.tsx
lib/
  ├── errors.ts         # Gestion erreurs centralisée
  ├── validation.ts     # Zod schemas
  ├── api-middleware.ts # Réponses standardisées
  ├── analytics.ts      # Tracking
  └── services/         # Phase 2-4: features futures
__tests__/
  ├── api/              # API tests
  ├── lib/              # Utility tests
  └── components/       # Component tests
```

## Support

Besoin d'aide? Check les issues ou crée une PR.
