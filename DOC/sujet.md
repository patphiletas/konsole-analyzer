# Sujet du cas pratique — Kpratik

## Contexte

Une équipe Revenue Engineering a besoin d'un outil capable d'analyser rapidement le site public d'une entreprise cible et d'en extraire des signaux utiles pour la prospection et la priorisation des comptes.

L'objectif n'est pas de remplacer un enrichissement CRM complet, mais de donner en quelques secondes une lecture actionnelle d'un compte : est-ce que cette boîte est un bon fit pour notre offre SaaS B2B ? Quels signaux le confirment ?

## Problème adressé

Les équipes sales perdent du temps à qualifier manuellement des comptes : visiter le site, chercher une page pricing, identifier la stack, estimer la taille… Kpratik automatise cette lecture en moins de 5 secondes depuis une simple URL.

## Périmètre de l'analyse

À partir d'une URL (avec ou sans protocole), l'application produit :

- **Identité** : nom de l'entreprise, description, secteur, taille estimée
- **Stack technique** : frameworks, outils analytics, CRM, paiement — avec niveau de confiance (confirmé / probable / indicatif)
- **Signaux GTM** : pricing, demo, free trial, sign-up, docs, blog, case studies, intégrations
- **Intelligence DNS** : outils marketing/sales détectés depuis le SPF record, provider email depuis les MX
- **Données publiques** : fondateur, CEO, année de création, résumé Wikipedia
- **Score de fit SaaS B2B** : note sur 100 avec breakdown par dimension et explication

## Contraintes techniques

- Fonctionnel à coût zéro : aucune API payante requise
- Enrichissement LLM optionnel (OpenRouter) si une clé est fournie
- Déployable sur Vercel en quelques minutes
- Résultat en moins de 5 secondes (opérations I/O en parallèle)

## Stack choisie

Next.js 16 App Router + TypeScript pour la simplicité du déploiement (frontend + API dans le même projet). Tailwind CSS 4 pour l'UI. Zod pour la validation des contrats. Vitest pour les tests unitaires.

## Utilisateurs cibles

- **SDR / AE** : qualifier rapidement un compte avant un premier contact
- **Revenue Engineer** : construire des listes de comptes priorisées par fit
- **Ops / Marketing** : enrichir des comptes entrants sans intervention manuelle
