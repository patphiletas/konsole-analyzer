# Matière vidéo — Kpratik

Éléments de description des fonctionnalités, à adapter selon le moment de la vidéo.

---

## Présentation générale

Kpratik est un outil d'intelligence commerciale : tu entres l'URL d'un site, l'application l'analyse et te donne en quelques secondes tout ce qu'un SDR ou un Revenue Engineer a besoin de savoir pour qualifier le compte. Pas de clé API requise, tout fonctionne en gratuit.

---

## Fonctionnalité 1 — Scraping et extraction

> *À utiliser quand on montre la saisie de l'URL et le chargement*

L'application accepte une URL avec ou sans protocole — `stripe.com` fonctionne aussi bien que `https://stripe.com`. Dès que tu valides, le serveur va chercher le HTML public de la page d'accueil et en extrait : le titre, la meta description, les mots-clés, les scripts chargés, les liens de navigation et le favicon. Tout ça en quelques centaines de millisecondes.

---

## Fonctionnalité 2 — Détection heuristique (stack et signaux GTM)

> *À utiliser quand on montre les tags colorés*

Sans aucune API externe, l'application détecte la stack technique depuis les noms de fichiers JavaScript chargés par la page. Et elle scrute les liens et le texte pour identifier les signaux d'un go-to-market mature : page pricing, bouton "book a demo", free trial, documentation, blog, cas clients, intégrations. Ce sont les indices que regarde un bon SDR quand il qualifie un compte.

---

## Fonctionnalité 3 — Curseur de confiance sur la stack

> *À utiliser quand on montre la section "Stack technique estimée"*

Tous les signaux ne se valent pas. Si un framework apparaît dans un attribut `src` d'une balise `<script>`, c'est confirmé — le fichier est réellement chargé. Si le nom apparaît dans le HTML ou le markup, c'est probable. Si c'est juste mentionné dans du texte de contenu, c'est indicatif — la boîte en parle, mais ça ne veut pas dire qu'elle l'utilise. Chaque technologie est donc affichée avec un dot coloré : vert, orange ou gris selon la source du signal.

---

## Fonctionnalité 4 — Intelligence DNS

> *À utiliser quand on montre la section violette*

Ça c'est le truc que la plupart des outils ne font pas. Les enregistrements DNS d'un domaine contiennent des informations très utiles, notamment le SPF record qui liste tous les outils autorisés à envoyer des emails au nom de l'entreprise. On y lit directement : HubSpot, Salesforce, Klaviyo, Outreach, Braze… La liste des outils marketing et sales est là, dans les DNS publics, disponible sans clé et sans scraping agressif.

On récupère aussi les enregistrements MX pour identifier le provider email : Google Workspace, Microsoft 365, ProtonMail — un signal de taille et de maturité en lui-même.

---

## Fonctionnalité 5 — Score de fit SaaS B2B

> *À utiliser quand on montre le score et le breakdown*

Le score sur 100 est une synthèse actionnelle. Il est calculé sur quatre dimensions : la taille estimée de la boîte, son secteur d'activité, la modernité de sa stack technique, et la richesse de ses signaux GTM. Le breakdown te montre exactement où les points ont été gagnés ou perdus. Et l'explication en texte reprend les indices clés : secteur détecté, taille estimée, outils observés.

L'objectif n'est pas une vérité absolue — c'est un premier tri rapide pour savoir si ça vaut la peine d'approfondir.

---

## Fonctionnalité 6 — Données publiques Wikipedia/Wikidata

> *À utiliser quand on montre la carte "Données publiques"*

Pour les boîtes référencées sur Wikipedia, on récupère automatiquement les données structurées de Wikidata : fondateur, CEO actuel, année de création. Plus un résumé de l'article Wikipedia et le lien direct. Tout ça sans aucune clé API — Wikipedia et Wikidata sont des bases de données publiques et libres.

Le logo affiché en haut de la fiche vient du favicon du site lui-même, extrait lors du scraping. Si aucun favicon n'est trouvé, Google favicon API prend le relais.

---

## Fonctionnalité 7 — Signaux footer

> *À utiliser quand on montre la section "Signaux footer"*

Le footer d'un site est souvent négligé, mais il concentre des informations structurées que les équipes juridiques et marketing y déposent intentionnellement. L'application extrait automatiquement la balise `<footer>` et en tire : l'année de copyright (proxy pour l'ancienneté de la boîte), les réseaux sociaux présents (LinkedIn = signal B2B), les certifications affichées (SOC 2, ISO 27001, HIPAA, PCI DSS — signal secteur et maturité), la forme juridique (Inc., SAS, GmbH…) et parfois le siège social.

Ces signaux viennent compléter l'analyse sans aucun appel externe — tout vient du HTML déjà récupéré.

---

## Architecture — ce qui tourne sous le capot

> *À utiliser pour la partie technique de la vidéo*

Quand tu cliques sur "Analyser", trois opérations se lancent en parallèle : le scraping de la page, la résolution DNS du domaine, et la recherche Wikipedia. Ça évite d'enchaîner les appels et le résultat arrive plus vite.

Côté code : Next.js 16 App Router avec une route API serverless, TypeScript partout, Zod pour valider les payloads, Tailwind pour l'UI. 52 tests unitaires Vitest couvrent chaque service indépendamment avec des mocks de fetch — les tests ne font jamais d'appel réseau réel.

Le LLM (OpenRouter) est une couche optionnelle : si une clé est configurée, il enrichit l'analyse ; sinon l'expérience reste complète grâce aux heuristiques locales.

---

## Limitations honnêtes

> *À utiliser si on veut montrer de l'honnêteté intellectuelle dans la vidéo*

L'analyse porte uniquement sur la page d'accueil publique. Une boîte qui cache sa stack derrière un CDN, qui n'a pas de page Wikipedia ou qui utilise un système d'email custom ne sera pas pleinement enrichie. Les estimations de taille restent heuristiques. Et les petites startups non référencées sur Wikipedia n'auront pas de données fondateur/CEO.

C'est un premier filtre, pas un enrichissement CRM complet.
