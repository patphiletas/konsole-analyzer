# Kpratik — contexte agent

## Contexte

Kpratik est un outil de qualification de comptes B2B pour des équipes Revenue Engineering : à partir d'une URL, il scrape le site, en déduit stack technique, secteur, taille, signaux GTM, puis calcule un score de fit SaaS B2B /100. Déployé sur https://kpratik.vercel.app/.

Stack : Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS 4, Zod 4 pour la validation, Vitest pour les tests. Pas de base de données, pas d'authentification.

Architecture en services indépendants sous `lib/services/` (scraper, heuristics, dns, wiki, llm, scoring), orchestrés par les routes API `app/api/analyze/route.ts` (analyse complète) et `app/api/analyze-llm/route.ts` (enrichissement IA différé, mode "lazy"). Chaque service a ses tests dans `__tests__/services/`.

## Règles

- **Zéro coût.** Aucune dépendance ou API payante. Le LLM (Groq, tier gratuit) est optionnel — l'app doit rester fonctionnelle sans clé, sur les seules heuristiques.
- **UI en français uniquement.** Ne pas mélanger anglais/français dans les labels (cf. `DOC/style.md`).
- **Sécurité.** Toute route qui fetch une URL fournie par l'utilisateur ou décidée par un LLM doit passer par `assertPublicUrl` (anti-SSRF, `lib/services/scraper.ts`) et un timeout. Toute sortie LLM doit être validée par un schéma Zod avant d'atteindre l'UI. Ne jamais désactiver ces protections sans compensation équivalente — voir `DOC/securite.md` pour l'inventaire complet (S1–S15).
- **Tests obligatoires.** Lancer `npm test` avant de considérer une tâche terminée. Toute nouvelle fonction de service doit avoir ses tests.
- **Documentation vivante.** Tenir `DOC/` à jour en même temps que le code : cocher les tâches finies et ajouter les nouvelles dans `roadmap.md`, documenter chaque bug (symptôme / cause / solution) dans `bugs.md`, mettre à jour les compteurs/tableaux dans `tests.md`, ajouter un bloc dans `pitch.md` pour toute nouvelle feature.
- **Git.** Ne jamais exécuter `git add`/`commit`/`push` de manière autonome — proposer uniquement le message de commit (une ligne, parties séparées par ` / `, sans guillemets).

## Routage — où chercher avant d'agir

| Sujet | Fichier |
|---|---|
| Contexte produit, utilisateurs cibles, périmètre | `DOC/sujet.md` |
| Sécurité : risques identifiés, mesures en place | `DOC/securite.md` |
| Algorithme de scoring (pondérations, seuils) | `DOC/scoring.md` |
| Conventions UI / refonte visuelle | `DOC/style.md` |
| Couverture de tests, tableau par fichier | `DOC/tests.md` |
| Historique des bugs rencontrés | `DOC/bugs.md` |
| Fonctionnalités existantes avec extraits de code | `DOC/features.md` |
| Feuille de route (fait / à faire) | `DOC/roadmap.md` |
| RGPD | `DOC/rgpd.md` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
