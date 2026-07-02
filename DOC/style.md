# Style — Chantier UI

Points relevés avant la phase de refonte visuelle.

---

## Problèmes identifiés

### 1 — Posture "pseudo-blog" au lieu d'app
L'interface actuelle ressemble à une suite de cartes textuelles empilées, pas à un outil métier. L'objectif : une densité d'information plus élevée, une hiérarchie visuelle claire, une sensation d'app plutôt que de page web.

### 2 — Texte sous le score indigeste
L'explication textuelle générée sous le score est un bloc de prose difficile à scanner rapidement. Un SDR qui qualifie 20 comptes par jour ne peut pas lire un paragraphe par compte. À remplacer par quelque chose de plus scannable (bullet points, tags, highlights).

### 3 — Breakdown du score — graphique à la place du tableau
Les 4 dimensions (taille, secteur, stack, GTM) sont actuellement affichées sous forme de liste. Un graphique radar ou des barres de progression colorées seraient plus lisibles et plus mémorables.

### 4 — Logo sous-exploité
Le logo récupéré (favicon haute résolution ou Wikipedia) est affiché en petit dans un coin. Il pourrait ancrer visuellement la fiche entreprise — header de la carte, fond flou en watermark, ou hero visuel de la fiche.

### 5 — Incohérence anglais / français
Les labels de l'UI mélangent les deux langues (ex: "Tech Stack", "GTM Signals" côté labels de carte, contenu en français). Choisir une langue pour l'interface et s'y tenir. Probablement français puisque le produit cible des équipes francophones.

---

## Pistes envisagées

- Layout 2 colonnes : colonne gauche identité + score, colonne droite détails
- Score affiché en grand chiffre avec jauge circulaire ou arc
- Radar chart (4 axes) pour le breakdown — recharts ou une SVG custom légère
- Logo en header de la fiche avec fond coloré extrait de la palette du logo
- Passage de tous les labels en français

---

## Ordre d'implémentation recommandé

1. **Langue** — transversal, sans risque de régression visuelle, à faire en premier
2. **Layout 2 colonnes** — changement de perception le plus fort, même sans toucher au contenu ; l'œil descend actuellement sur 8 cartes en cascade, c'est long
3. **Texte du score** — remplacer le paragraphe généré par 3–4 bullet points scannables ; implique un changement de logique dans `scoring.ts`, pas juste du CSS
4. **Graphique de breakdown** — barres de progression colorées préférables au radar chart sur 4 axes seulement (radar beau mais peu lisible sur mobile et peu différenciant avec si peu d'axes)
5. **Logo** — afficher l'identité visuelle de l'entreprise en grand donnerait un effet "fiche compte" professionnel fort ; cosmétique mais psychologiquement impactant pour un outil sales

---

## Contraintes à respecter

- Pas de nouvelle dépendance lourde (pas de D3.js) — recharts déjà évalué, ou barres SVG custom légères
- Responsive mobile conservé
- Temps d'analyse affiché clairement (skeleton ou spinner pendant le fetch)
