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

**Symptôme :** La CI échoue en 8s au step `npm ci` — erreur `EUSAGE: package.json and package-lock.json are not in sync`. Avertissement supplémentaire : Node 20 déprécié sur les runners GitHub.

**Cause :** `package-lock.json` désynchronisé avec `package.json`. Node version fixée à 20 dans le workflow alors que GitHub Actions tourne désormais sur Node 24 par défaut.

**Solution :** `npm install` en local pour resynchroniser `package-lock.json`, puis passage à `node-version: 24` dans `.github/workflows/ci.yml`.

---

## Bug #11 — Données Wikidata toujours périmées (salariés, CA, bénéfice)

**Symptôme :** Les nouveaux champs Wikidata s'affichaient avec des valeurs très anciennes — ex : Salesforce affichait 767 salariés (1999) au lieu de 35 000.

**Cause :** Wikidata stocke toutes les valeurs historiques dans un tableau. Le code prenait systématiquement `[0]`, soit la plus ancienne.

**Solution :** Introduction de `getBestClaim()` — sélectionne l'entrée de rang `preferred` en priorité, sinon la dernière entrée non-dépréciée du tableau.

---

## Bug #12 — Année de copyright footer confondue avec l'année de création *(à corriger)*

**Symptôme :** La carte footer affiche une date comme "2026" qui peut être interprétée comme "l'entreprise existe depuis 2026", alors qu'il s'agit de l'année courante dans la mention `© 2026 Company`.

**Cause :** Le footer contient généralement `© [année courante] Company` — ce n'est pas l'année de fondation.

**Solution appliquée :** Dans `FooterCard.tsx`, le label "Actif depuis" remplacé par "Copyright footer" et la valeur préfixée par "©".

**Décision (2026-07-03) :** Le parsing de `© 2010–2026` pour extraire l'année de fondation ne sera pas implémenté. L'année de création est souvent présente dans le bloc description (Wikidata/Wikipedia), et l'année de copyright est déjà affichée telle quelle. Complexité non justifiée.

---

## Bug #13 — Signaux GTM en doublon (LLM anglais + heuristiques français)

**Symptôme :** Avec le LLM activé, un même signal GTM peut apparaître deux fois : en anglais depuis le LLM (`"Pricing page"`) et en français depuis les heuristiques (`"Page de tarifs"`).

**Cause :** `mergeAnalyses()` utilise `uniqStrings()` qui déduplique par string exacte — les libellés différents passent tous les deux.

**Solution :** Filtrer les signaux heuristiques dont le pattern regex matche déjà un signal LLM.

---

## Bug #14 — Meta description tronquée en mode heuristique seul

**Symptôme :** La description affichée peut être coupée en plein mot (ex : `"…des dirigeants d"`) à cause d'un attribut HTML mal échappé ou d'une limite CMS.

**Cause :** La meta description est extraite telle quelle. Quand le LLM est actif, sa description (phrase complète) la remplace — le problème disparaît.

**Solution :** La description LLM est prioritaire dans `mergeAnalyses()`. En fallback heuristique, `finalizeDescription()` coupe au dernier mot complet si la description ne se termine pas par `.!?` — pas d'ellipse (trompeuse), juste une phrase plus courte mais lisible.

---

## Bug #15 — Onglet "Analyse IA" absent sans avertissement *(à corriger)*

**Symptôme :** L'onglet "Analyse IA" disparaît sur tous les sites sans message d'erreur. Seul indice : `analysisSource` passe à "Heuristiques".

**Cause identifiée :** double échec —
- **Groq** : limite free tier atteinte (100 000 tokens/jour). Reset automatique à J+1.
- **OpenRouter fallback** : le modèle `llama-3.1-8b-instruct:free` n'est plus gratuit.

**Correctifs appliqués :** fallback OpenRouter supprimé (cascade Groq → OpenRouter retirée). `callOpenRouter` conservé au cas où un nouveau modèle gratuit apparaît.

**Reste à faire :** indicateur UI discret quand le LLM est en échec, plutôt que la disparition silencieuse de l'onglet.

**Décision architecturale (2026-07-03) :** L'idée d'un appel LLM différé ("lazy") — déclenché au clic sur l'onglet "Analyse IA" plutôt que lors de l'analyse principale — a été étudiée mais non retenue. Le plan était : `POST /api/analyze` sans LLM + nouveau `POST /api/analyze-llm` appelé à la demande. Problème principal : `mergeAnalyses()` utilise le LLM pour enrichir la description, les signaux GTM et la stack dans la carte principale — avec le lazy loading, ces champs resteraient heuristiques seuls. Trade-off jugé trop dégradant. La limite des 100k tokens/jour n'est atteinte que lors de sessions de développement intensif, pas en usage normal.

---

## Bug #16 — `"0"` parasite affiché sous les résultats IA

**Symptôme :** Un `"0"` isolé apparaît en bas de l'onglet "Analyse IA" pour certains sites.

**Cause :** `const hasLists = tractionSignals?.length || competitors?.length || fundingSignals?.length` retourne `0` (pas `false`) quand tous les tableaux sont vides. En React, `{0 && <Component />}` rend le chiffre `"0"` au lieu de ne rien afficher.

**Solution :** Conversion en booléen avec `!!` : `const hasLists = !!(tractionSignals?.length || ...)`.

---

## Bug #17 — Enrichissement Wikipedia absent pour la majorité des sites (régression)

**Symptôme :** Stripe, Linear, HubSpot, Facebook et la plupart des sites ne retournaient plus de données Wikipedia. Seuls quelques cas comme Pennylane fonctionnaient encore.

**Cause :** Le filtre anti-faux-positifs (bug #6) exige que le titre de l'article Wikipedia contienne `companyName`. Quand le nom extrait du titre du site diffère légèrement du nom de l'article Wikipedia (casse, suffixe, rebranding…), le filtre rejette tous les résultats et retourne `found: false`.

**Solution :** Fallback dans `lookupCompanyWiki` — si la recherche par `companyName` échoue, retry avec le nom de domaine sans TLD (`domainRoot = domain.split('.')[0]`), uniquement si différent du companyName. Couvre les cas où le titre extrait du site ne correspond pas exactement au nom Wikipedia.
