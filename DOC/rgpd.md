# RGPD — Kpratik

Analyse des flux de données personnelles et conformité au règlement européen 2016/679.

---

## Contexte

Kpratik est un outil d'intelligence commerciale B2B. Il analyse des sites web publics d'entreprises pour en extraire des signaux business (stack technique, secteur, taille, canaux GTM). Il ne collecte pas de données sur des individus et n'a pas de système d'authentification utilisateur.

---

## Données traitées

| Donnée | Source | Nature | Persistée ? |
|---|---|---|---|
| URL analysée | Saisie utilisateur | Potentiellement personnelle (blog perso) | Non — mémoire uniquement |
| HTML scrapé | Site cible | Peut contenir des noms, emails, téléphones | Non — traitement temps réel |
| Nom d'entreprise | Titre HTML / Wikipedia | Donnée publique | Non |
| DNS / MX records | DNS public | Donnée technique | Non |
| Données Wikidata | API publique | Données publiques | Non |
| Événements analytics | Interne | URL + type + durée | Non — singleton mémoire Node.js |

**Conclusion :** aucune donnée n'est stockée sur disque ni en base de données. Toutes les données sont traitées en temps réel et disparaissent à la fin de la requête (ou au redémarrage du serveur pour les analytics).

---

## Flux vers des tiers

### LLM — Groq et OpenRouter (risque principal)

Le HTML brut scrapé (50 KB max) est envoyé à Groq (`llama-3.3-70b-versatile`) ou OpenRouter (modèle gratuit en fallback). Ce HTML peut contenir :
- des noms d'employés (pages « À propos », sections équipe)
- des adresses email visibles
- des numéros de téléphone

**Risque RGPD :** transfert de données personnelles à un sous-traitant sans scrubbing préalable.

**Action requise :**
1. Vérifier la disponibilité d'un DPA (Data Processing Agreement) chez Groq et OpenRouter.
2. Implémenter un scrubbing des emails et numéros de téléphone avant envoi (voir `DOC/securite.md` → mesure S3).
3. N'envoyer que les champs utiles (title, description, scripts) plutôt que le HTML complet quand possible.

### Wikipedia / Wikidata

API publique en lecture seule. Aucune donnée personnelle envoyée. Conforme par défaut.

### Google Favicon API / Thum.io

Seul le nom de domaine est transmis. Pas de donnée personnelle.

---

## Légitimité du scraping

Kpratik scrape uniquement des pages publiques accessibles sans authentification. La base légale retenue est l'**intérêt légitime** (art. 6.1.f RGPD) dans un contexte B2B :
- les données extraites sont des informations publiques sur des entreprises
- le traitement a pour seul but l'analyse commerciale de la cible

**Limite :** si un utilisateur saisit l'URL d'un site personnel (blog, portfolio individuel), les données scrapées peuvent inclure des données personnelles au sens du RGPD. Le cas d'usage visé est exclusivement B2B.

---

## `robots.txt`

Le scraper ne vérifie pas actuellement le fichier `robots.txt` de la cible. Certains sites y interdisent le crawl automatique. Ce n'est pas une obligation RGPD stricte pour des données publiques, mais le non-respect peut constituer une violation des conditions d'utilisation du site.

**Action recommandée :** documenter cette limitation dans les CGU de Kpratik et envisager un contrôle `robots.txt` dans une version future.

---

## Analytics internes

Le module `lib/analytics.ts` enregistre en mémoire :
- le type d'événement (`analyze_request`, `analyze_success`, `analyze_error`)
- l'URL analysée
- la durée de traitement
- le message d'erreur le cas échéant

Ces données sont **non persistées** (perdues au redémarrage). Néanmoins, l'URL peut être considérée comme une donnée personnelle dans certains cas.

**Action recommandée :** supprimer l'URL des événements analytics, ou la remplacer par un hash non réversible.

---

## Déploiement Vercel

Vercel collecte des logs de requête (IP, URL, timestamp) selon sa propre politique de confidentialité. Les logs sont conservés selon les paramètres du projet (configurable dans le dashboard Vercel).

**Action recommandée :** vérifier et limiter la rétention des logs dans les paramètres Vercel (Settings → Functions → Log Drain).

---

## Résumé des actions

| Priorité | Action | Statut |
|---|---|---|
| Haute | Scrubbing emails/téléphones avant envoi LLM | À faire |
| Haute | Vérifier DPA Groq et OpenRouter | À faire |
| Moyenne | Supprimer l'URL des analytics internes | À faire |
| Moyenne | Vérifier rétention des logs Vercel | À faire |
| Basse | Contrôle `robots.txt` dans le scraper | Backlog |
| Basse | Mention RGPD dans les CGU/README | À faire |
