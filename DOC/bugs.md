# Journal des bugs — Kpratik

Format : symptôme → cause → solution choisie.

---

## Bug #1 — `const analysis` déclaré deux fois dans `route.ts`

**Symptôme :** Erreur TypeScript `Cannot redeclare block-scoped variable 'analysis'` après intégration de Wikipedia.

**Cause :** En ajoutant le bloc wiki dans `route.ts`, une déclaration `const analysis` avait été insérée trop tôt, avant le bloc LLM qui déclarait déjà la même variable.

**Solution :** Réécriture complète de `route.ts` avec une structure claire (variables déclarées une seule fois, dans le bon ordre).

---

## Bug #2 — TypeScript : `WikiIntelligence` trop étroit dans le `.catch()`

**Symptôme :** Erreur TS2322 — le type `{ found: false; logoUrl: string }` n'est pas assignable à `WikiIntelligence`.

**Cause :** Le `.catch()` retournait un objet littéral sans annotation de type, TypeScript inférait un type plus étroit que `WikiIntelligence`.

**Solution :** Annotation explicite du type de retour : `.catch((): WikiIntelligence => ({ ... }))`.

---

## Bug #3 — Test de validation cassé après ajout du champ `enrichment`

**Symptôme :** Le test `should accept valid response` échouait avec une erreur Zod sur le champ `enrichment`.

**Cause :** Le fixture de test n'avait pas été mis à jour pour inclure le nouveau champ `enrichment` requis par le schéma.

**Solution :** Ajout du champ `enrichment` complet dans le fixture du test.

---

## Bug #4 — Tests wiki vérifiaient encore l'URL Clearbit après migration

**Symptôme :** 2 tests wiki en échec après remplacement de Clearbit par Google favicon API.

**Cause :** Les assertions comparaient `https://logo.clearbit.com/...` alors que le code produisait désormais `https://www.google.com/s2/favicons?domain=...`.

**Solution :** Mise à jour des deux assertions pour vérifier l'URL Google favicon.

---

## Bug #5 — Logos invisibles en local (Clearbit abandonné)

**Symptôme :** Aucun logo ne s'affichait lors des tests locaux.

**Cause :** Clearbit a arrêté son API Logo suite au rachat par HubSpot. Les URLs `logo.clearbit.com` retournent des erreurs.

**Solution :** Double fallback — favicon scrapé (résolu avec `new URL()` pour les URLs relatives) en priorité, puis Google favicon API (`https://www.google.com/s2/favicons?domain=...&sz=128`) en fallback.

---

## Bug #6 — Faux positif Wikipedia pour `youno.com`

**Symptôme :** L'analyse de `youno.com` affichait une page Wikipedia sans rapport avec la boîte.

**Cause :** `searchWikipediaTitle` prenait le premier résultat de recherche sans vérifier la pertinence. Pour une petite boîte non référencée, le premier résultat pouvait être n'importe quel article contenant un mot proche.

**Solution :** Recherche sur 5 résultats (`srlimit=5`) avec filtre — seul un titre qui contient le nom de la boîte (`title.includes(companyName)`) est accepté. Si aucun ne correspond, `found: false`.

---

## Bug #7 — Screenshots Thum.io invisibles (`encodeURIComponent`)

**Symptôme :** La section screenshot n'affichait rien pour aucun site testé.

**Cause :** L'URL cible était encodée avec `encodeURIComponent` avant d'être concaténée au path Thum.io. Thum.io attend l'URL brute dans son path : `https://image.thum.io/get/.../https://stripe.com`, pas `https://image.thum.io/get/.../https%3A%2F%2Fstripe.com`.

**Solution :** Suppression de `encodeURIComponent` — interpolation directe du hostname : `` `https://image.thum.io/get/width/1280/crop/800/https://${domain}` ``.

---

## Bug #8 — Fautes d'accentuation dans l'UI et les explications de score

**Symptôme :** Textes affichés sans accents : "detecte", "integrations", "taille estimee"…

**Cause :** Absence d'accentuation dans les chaînes hardcodées de `heuristics.ts`, `scoring.ts` et `analyzer-app.tsx`.

**Solution :** Correction systématique dans tous les fichiers concernés — UI, scoring, README.

---

## Bug #9 — `screenshotUrl` manquant dans la réponse API

**Symptôme :** Erreur TypeScript après ajout de `screenshotUrl` comme champ requis dans `WikiIntelligence` — le fallback `.catch()` dans `route.ts` et l'objet `enrichment` de la réponse ne l'incluaient pas.

**Cause :** Ajout du champ dans l'interface sans propagation complète sur tous les points de construction de l'objet.

**Solution :** Ajout de `screenshotUrl` dans le fallback `.catch()` de `route.ts` et dans l'objet `enrichment` retourné par la route.
