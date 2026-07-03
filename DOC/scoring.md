# Grille de scoring — Kpratik

Score /100 qualifiant une entreprise comme cible commerciale d'un éditeur SaaS B2B.

**Formule :** `score = taille + secteur + stack + GTM`, plafonné à 100.
Total possible sans plafond : 105 pts.

---

## 1. Taille estimée — 30 pts max

Estimée depuis le vocabulaire du site, les signaux footer et les données Wikidata (nombre d'employés).

| Valeur estimée      | Points |
|---------------------|--------|
| Scale-up / Growth   | 30     |
| Enterprise          | 25     |
| Startup / Small     | 20     |
| Inconnu             | 15     |

---

## 2. Secteur d'activité — 30 pts max

Détecté dans la description, les mots-clés et le contenu de la page.

**Formule :** `min(30, nb_matchs × 10)`

Mots-clés reconnus (10 pts chacun) :
`saas` · `software` · `fintech` · `edtech` · `healthtech` · `proptech` · `martech` · `adtech` · `analytics` · `api`

---

## 3. Stack technique — 25 pts max

Détectée depuis les scripts chargés, les attributs HTML et le texte de la page.

**Formule :** `min(25, 5 + nb_matchs × 2)` — stack vide → 10 pts par défaut

Technologies reconnues (2 pts chacune) :
`React` · `Vue` · `Angular` · `Next.js` · `Svelte` · `TypeScript` · `Node.js` · `Python` · `Django` · `FastAPI` · `Golang` · `Rust` · `Kubernetes` · `Docker` · `GraphQL` · `PostgreSQL` · `MongoDB` · `Firebase` · `AWS` · `GCP` · `Stripe` · `Segment` · `Mixpanel` · `Amplitude`

---

## 4. Signaux GTM — 20 pts max

Signaux go-to-market détectés dans les liens et le texte de la page.

**Formule :** `min(20, 5 + nb_matchs × 3)` — aucun signal → 10 pts par défaut

Signaux reconnus (3 pts chacun) :
`Page de tarifs` · `Essai gratuit` · `Réservation démo` · `Inscription produit` · `Newsletter` · `Blog / ressources` · `Études de cas` · `Documentation` · `Intégrations` · `API / webhooks` · `Webinar`

---

## Niveaux de qualification

| Score   | Niveau            | Interprétation                        |
|---------|-------------------|---------------------------------------|
| ≥ 75    | Profil excellent  | Cible idéale — priorité haute         |
| ≥ 55    | Bon profil        | À contacter, potentiel identifié      |
| ≥ 35    | À qualifier       | Données insuffisantes ou profil mixte |
| < 35    | Profil faible     | Hors cible ou trop peu de signal      |

---

**Fichier :** `lib/services/scoring.ts`
