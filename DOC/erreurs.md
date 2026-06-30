# Gestion des erreurs — Kpratik

## Principe général

Toutes les erreurs applicatives passent par `AppError` (classe centrale dans `lib/errors.ts`). Chaque erreur a un type, un message et un HTTP status code. En dehors de l'endpoint principal, les services externes (DNS, Wikipedia, LLM) sont isolés par des `.catch()` individuels — une défaillance partielle ne bloque pas le reste de l'analyse.

---

## Types d'erreurs

| Type | Code HTTP | Déclencheur |
|---|---|---|
| `INVALID_URL` | 400 | URL soumise non valide (format incorrect) |
| `FETCH_FAILED` | 502 | Scraping du site impossible (timeout, refus connexion, DNS) |
| `PARSE_FAILED` | 500 | HTML reçu mais non parseable |
| `LLM_ERROR` | 502 | Échec de l'appel OpenRouter |
| `VALIDATION_ERROR` | 400 | Payload request ou response ne passe pas le schéma Zod |
| `INTERNAL_ERROR` | 500 | Toute autre exception non anticipée |

---

## Où les erreurs sont levées

### `lib/errors.ts`
- `isValidUrl()` — valide le format de l'URL avant tout traitement
- `handleError()` — convertit n'importe quelle exception en `AppError` (ZodError, Error générique, unknown)

### `lib/services/scraper.ts`
- `FETCH_FAILED` — si le fetch HTTP échoue ou retourne un status non-ok
- `FETCH_FAILED` — si le parse HTML lève une exception (re-throw si déjà `AppError`)

### `app/api/analyze/route.ts`
- `INVALID_URL` — vérification `isValidUrl()` dès l'entrée dans l'endpoint
- Catch global `try/catch` → `createErrorResponse()` → réponse JSON structurée

---

## Services externes : isolation par `.catch()`

Les services tiers ne font jamais planter l'analyse principale. Chacun a un fallback défini :

| Service | Fallback si erreur |
|---|---|
| `lookupDns()` | `{ emailProvider: 'Unknown', toolsFromDns: [] }` |
| `lookupCompanyWiki()` | `{ found: false, logoUrl: favicon Google, screenshotUrl: Thum.io }` |
| `analyzeWebsiteWithLLM()` | log de l'erreur, analyse heuristique utilisée à la place |
| `new URL(favicon)` | fallback silencieux vers `wikiIntel.logoUrl` |

---

## Format de réponse d'erreur

Toutes les erreurs retournent le même enveloppe JSON :

```json
{
  "success": false,
  "error": {
    "type": "INVALID_URL",
    "message": "Invalid URL format"
  },
  "timestamp": "2026-06-30T16:00:00.000Z"
}
```

Géré par `createErrorResponse()` dans `lib/api-middleware.ts`.

---

## Timeout des services externes

`lib/services/wiki.ts` et `lib/services/dns.ts` utilisent `AbortSignal.timeout(5000)` sur chaque fetch — aucune requête externe ne peut bloquer plus de 5 secondes.
