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

---

## Bug #10 — CI GitHub Actions en échec : `npm ci` / Node 20 déprécié

**Symptôme :** La CI échoue en 8s au step `npm ci` — erreur `EUSAGE: package.json and package-lock.json are not in sync` (packages `@emnapi/runtime` et `@emnapi/core` absents du lock file). Avertissement supplémentaire : Node 20 déprécié sur les runners GitHub.

**Cause :** `package-lock.json` désynchronisé avec `package.json` (dépendances installées localement sans mise à jour du lock file). Node version fixée à 20 dans le workflow alors que GitHub Actions tourne désormais sur Node 24 par défaut.

**Solution :** `npm install` en local pour resynchroniser `package-lock.json`, puis passage à `node-version: 24` dans `.github/workflows/ci.yml`. Commit des deux fichiers.

---

## Bug #11 — Données Wikidata toujours périmées (salariés, CA, bénéfice)

**Symptôme :** Les nouveaux champs Wikidata (salariés, chiffre d'affaires, bénéfice) s'affichaient avec des valeurs très anciennes — ex : Salesforce affichait 767 salariés (1999) et $748M de CA (2013) au lieu de 35 000 salariés et $37.9Md.

**Cause :** Wikidata stocke toutes les valeurs historiques d'une propriété dans un tableau chronologique. Le code prenait systématiquement `[0]`, soit la plus ancienne. Pour les propriétés à valeur unique (fondateur, année), ce n'était pas un problème ; pour les propriétés à valeurs multiples dans le temps (effectifs, revenus), `[0]` pointait sur la donnée la plus ancienne.

**Solution :** Introduction de `getBestClaim()` — sélectionne l'entrée de rang `preferred` en priorité (valeur explicitement désignée comme courante dans Wikidata), sinon la dernière entrée non-dépréciée du tableau. Toutes les fonctions d'extraction (`extractEntityId`, `extractYear`, `extractQuantity`, `extractFinancial`) utilisent désormais ce helper.

---

## Bug #12 — Année de copyright footer confondue avec l'année de création *(à corriger)*

**Symptôme :** La carte footer affiche une date comme "2026" qui peut être interprétée comme "l'entreprise existe depuis 2026", alors qu'il s'agit de l'année courante dans la mention `© 2026 Company`.

**Cause :** Le footer contient généralement `© [année courante] Company` — le copyright se met à jour automatiquement chaque année. Ce n'est pas l'année de fondation. Certains footers affichent `© 2010–2026 Company` où le premier chiffre est l'année de lancement réelle.

**Solution partielle appliquée :** Dans `FooterCard.tsx`, le label "Actif depuis" remplacé par "Copyright footer" et la valeur préfixée par "©" — la nature de l'information est maintenant explicite.

**Reste à faire :** Dans `scraper.ts`, chercher le pattern `©\s*(\d{4})\s*[–-]\s*\d{4}` en priorité pour extraire l'année de début quand disponible (ex : `© 2010–2026` → exposer 2010 séparément comme année de lancement).


