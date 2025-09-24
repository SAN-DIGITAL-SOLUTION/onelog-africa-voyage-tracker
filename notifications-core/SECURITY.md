# Politique de Sécurité - notifications-core

## Objectif

Assurer la protection des accès administratifs en garantissant que les secrets ne sont **jamais exposés côté client** et que l’accès aux pages sensibles est strictement contrôlé.

---

## Mise en œuvre actuelle

- Le mot de passe administrateur est stocké uniquement côté serveur dans un fichier `.env.local` (variable `ADMIN_PASSWORD`).
- L’API route `/api/login` reçoit le mot de passe via une requête POST, le valide côté serveur, puis pose un cookie HTTPOnly (`auth=1`) si l’authentification réussit.
- Le frontend ne contient jamais de mot de passe en clair ou d’information sensible.
- Les pages sensibles (exemple : `/templates`) sont protégées par une vérification côté serveur (via `getServerSideProps` ou middleware), qui valide la présence du cookie d’authentification.
- En cas d’absence ou d’expiration du cookie, l’utilisateur est automatiquement redirigé vers la page de connexion `/login`.
- Le cookie d’authentification est HTTPOnly, avec une durée de vie maîtrisée (ex. 1 heure).

---

## Bonnes pratiques collaboratives

- Toute modification concernant l’authentification ou la sécurité doit être validée par revue de code formelle.
- Ne jamais stocker ou commiter de mot de passe, clé ou secret dans le frontend ou dans le dépôt.
- Garder le cookie d’authentification en HTTPOnly pour éviter tout accès via JavaScript.
- Informer l’équipe en cas de changement majeur lié à la sécurité.
- Documenter toute évolution sécuritaire dans ce fichier `SECURITY.md`.

---

## Pour aller plus loin

- Implémentation possible d’une gestion multi-utilisateurs et rôles avec permissions.
- Ajout d’un système de journalisation (audit) des connexions et actions.
- Renforcement via tokens JWT ou OAuth selon besoin.
- Mise en place d’un système de verrouillage après tentatives répétées échouées.

---

Ce document doit accompagner tout développement ou maintenance liée à la sécurité dans `notifications-core`.

---

*Fichier généré automatiquement - Merci de le garder à jour.*
