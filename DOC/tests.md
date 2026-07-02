# Tests — Kpratik

86 tests Vitest répartis sur 10 fichiers. À mettre à jour à chaque nouvelle feature.

Commande : `npm test`

---

## `__tests__/lib/errors.test.ts` — Gestion des erreurs (9 tests)

| Test | Ce qu'il vérifie |
|---|---|
| AppError : propriétés correctes | `type`, `message`, `statusCode` bien assignés |
| AppError : statusCode 500 par défaut | Valeur par défaut si non fourni |
| handleError : retourne AppError tel quel | Pas de double wrapping |
| handleError : wrapping d'une Error générique | Conversion en `AppError` de type `INTERNAL_ERROR` |
| handleError : erreurs inconnues | Gestion des non-Error (string, number…) |
| isValidUrl : accepte HTTPS | `https://stripe.com` → valide |
| isValidUrl : accepte HTTP | `http://example.com` → valide |
| isValidUrl : accepte sans protocole | `stripe.com` → valide |
| isValidUrl : accepte avec path | `stripe.com/pricing` → valide |
| isValidUrl : rejette les invalides | `not-a-url`, chaîne vide → invalide |

---

## `__tests__/lib/validation.test.ts` — Schémas Zod (9 tests)

| Test | Ce qu'il vérifie |
|---|---|
| Request : URL avec http | Acceptée telle quelle |
| Request : URL sans protocole | `stripe.com` accepté |
| Request : URL invalide | Rejet avec message d'erreur |
| Request : URL vide | Rejet |
| Request : trim des espaces | `  stripe.com  ` → nettoyé |
| Response : objet valide complet | Tous les champs requis présents et typés |
| Response : fitScore > 100 | Rejeté |
| Response : fitScore négatif | Rejeté |
| Response : date invalide | `analyzedAt` doit être un ISO datetime |

---

## `__tests__/lib/api-middleware.test.ts` — Format de réponse API (7 tests)

| Test | Ce qu'il vérifie |
|---|---|
| createSuccessResponse : données encapsulées | `{ success: true, data: ... }` |
| createSuccessResponse : timestamp ISO | Champ `timestamp` présent et valide |
| createErrorResponse : AppError | Code et message transmis fidèlement |
| createErrorResponse : Error générique | Wrapping correct |
| createErrorResponse : ZodError | Type `VALIDATION_ERROR`, message de la première issue |
| createErrorResponse : timestamp | Présent dans la réponse d'erreur |

---

## `__tests__/services/heuristics.test.ts` — Analyse heuristique (6 tests)

| Test | Ce qu'il vérifie |
|---|---|
| Détection complète depuis HTML public | Nom entreprise, secteur, taille, stack (`TechSignal[]` avec confidence `high`), signaux GTM |
| Extraction nom — séparateur pipe | `"Stripe \| Financial Infrastructure"` → `"Stripe"` |
| Extraction nom — tiret long (en-dash) | `"Linear – Plan and build"` → `"Linear"` |
| Extraction nom — deux-points | `"HubSpot: CRM..."` → `"HubSpot"` |
| Fallback hostname si titre absent | `notion.so` → `"Notion"` |
| Fallback hostname — sous-domaine ignoré | `app.hubspot.com` → `"Hubspot"` (pas `"App"`) |

---

## `__tests__/services/scoring.test.ts` — Score SaaS B2B (8 tests)

| Test | Ce qu'il vérifie |
|---|---|
| Score élevé pour enterprise SaaS | Profil idéal → score > 70 |
| Score faible pour B2C early-stage | Profil éloigné → score < 40 |
| Industries à haute valeur | `SaaS`, `fintech`… → score secteur > 0 |
| Stack à haute valeur | React, Stripe, Segment… → score stack > 5 |
| Signaux GTM reconnus | Pricing, free trial, demo → score GTM > 5 |
| Explication pour score élevé | Texte généré non vide et cohérent |
| Explication avec contexte business | Contient secteur détecté, taille estimée, stack observée |
| Plafonnement à 100 | Somme des dimensions ne dépasse pas 100 |

---

## `__tests__/services/dns.test.ts` — Analyse DNS (10 tests)

| Test | Ce qu'il vérifie |
|---|---|
| SPF : extraction des outils | `include:hubspot.com` → HubSpot, Salesforce, SendGrid |
| SPF : pas de record SPF | `toolsFromDns` vide |
| SPF : suppression des guillemets | TXT avec `"..."` parsé correctement |
| SPF : pas de TXT records | Résultat vide |
| MX : Google Workspace | `aspmx.l.google.com` → détecté |
| MX : Microsoft 365 | `protection.outlook.com` → détecté |
| MX : provider inconnu | `Unknown` retourné |
| MX : pas de records | `Unknown` retourné |
| Résilience : erreur réseau | Catch dans la route, pas de crash |
| Résilience : NXDOMAIN (Status != 0) | Réponse vide sans erreur |

---

## `__tests__/lib/utils.test.ts` — Utilitaires URL (6 tests)

| Test | Ce qu'il vérifie |
|---|---|
| buildFaviconUrl : URL Google favicon | Format correct avec domaine et taille |
| buildScreenshotUrl : URL Thum.io | Format correct, domaine non encodé |
| buildScreenshotUrl : pas de `%3A` ni `%2F` | Régression bug #7 (`encodeURIComponent`) |
| resolveFaviconUrl : favicon absent | Retourne le fallback |
| resolveFaviconUrl : favicon relatif | Résolu en URL absolue depuis le hostname |
| resolveFaviconUrl : favicon absolu | Retourné tel quel |
| resolveFaviconUrl : protocole non http/https | `javascript:` → fallback |

---

## `__tests__/services/scraper.test.ts` — Sécurité scraper S7 + S14 (15 tests)

| Test | Ce qu'il vérifie |
|---|---|
| `127.0.0.1` → privé | Loopback IPv4 détecté |
| `10.0.0.1` → privé | Plage RFC1918 10/8 |
| `192.168.1.1` → privé | Plage RFC1918 192.168/16 |
| `172.16.0.1` → privé | Plage RFC1918 172.16–31/12 (borne basse) |
| `172.31.255.255` → privé | Plage RFC1918 172.16–31/12 (borne haute) |
| `169.254.169.254` → privé | Metadata AWS/GCP (link-local) |
| `::1` → privé | Loopback IPv6 |
| `fc00::1` → privé | ULA IPv6 (fc::/7) |
| `93.184.216.34` → public | IP publique (example.com) — non bloquée |
| `172.32.0.1` → public | Hors plage 172.16–31, donc public |
| S7 : bloque `localhost` | `scrapeWebsite('http://localhost/admin')` → `INVALID_URL` |
| S7 : bloque `0.0.0.0` | `scrapeWebsite('http://0.0.0.0/')` → `INVALID_URL` |
| S7 : bloque `::1` IPv6 | `scrapeWebsite('http://[::1]/')` → `INVALID_URL` |
| S14 : contenu sous la limite | Réponse < 500 KB retournée intacte |
| S14 : body > 500 KB tronqué | `result.html.length ≤ 500 000` même si le body fait 600 KB |

---

## `__tests__/services/llm.test.ts` — Scrubbing HTML S8 (6 tests)

| Test | Ce qu'il vérifie |
|---|---|
| Suppression des commentaires HTML | `<!-- secret token -->` absent de la sortie |
| Suppression des scripts inline | `<script>var key="sk-123"</script>` retiré |
| Rédaction des emails | `john.doe@company.com` → `[email]` |
| Rédaction des numéros de téléphone | `+33 1 23 45 67 89` → `[phone]` |
| Troncature à 5 000 caractères | Input 10 000 chars → sortie ≤ 5 000 chars |
| Préservation du texte marketing | `"The best CRM for sales teams"` conservé |

---

## `__tests__/services/wiki.test.ts` — Enrichissement Wikipedia/Wikidata (8 tests)

| Test | Ce qu'il vérifie |
|---|---|
| Logo toujours présent | Google favicon URL construite même si Wikipedia ne répond pas |
| Pas de résultat Wikipedia | `found: false`, pas de données enrichies |
| Wikipedia sans Wikidata | `found: true`, summary et wikiUrl présents, founder absent |
| Données complètes Wikipedia + Wikidata | Fondateur, CEO, année extraits et labellisés |
| Troncature du résumé | Résumé limité à 400 caractères |
| Erreur réseau | Retour propre `{ found: false, logoUrl }` sans exception |
| Données économiques Wikidata | Salariés (rang `preferred`), siège, cotation, groupe parent, CA et bénéfice (dernière valeur `normal`) |
| Extraction année avec précision mois | `+2015-03-01T...` → `"2015"` |
