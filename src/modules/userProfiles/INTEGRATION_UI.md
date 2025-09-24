# 📚 Guide d’intégration UI/pages – Module Profils Utilisateurs

## Vue d’ensemble de l’arborescence

```
src/modules/userProfiles/
├── components/
│   ├── Button.tsx
│   ├── Layout.tsx
│   ├── UserCard.tsx
│   ├── UserForm.tsx
│   └── __tests__/
│       ├── Button.test.tsx
│       ├── Layout.test.tsx
│       ├── UserCard.test.tsx
│       └── UserForm.test.tsx
├── pages/
│   ├── user-list.tsx
│   ├── [id].tsx
│   └── edit.tsx
├── styles/
│   ├── globals.css
│   └── variables.css
├── hooks/ (à créer pour la connexion API)
│   └── useUserProfile.ts
├── services/ (logique métier, accès données)
│   └── users.ts
├── README.md
├── storybook-tests.md
└── INTEGRATION_UI.md (ce fichier)
```

## Explication des pages

- **user-list.tsx** : Affiche la liste des utilisateurs (mock ou API), chaque nom est un lien vers la page profil détaillé.
- **[id].tsx** : Affiche le profil détaillé d’un utilisateur (nom, rôle, bouton Modifier).
- **edit.tsx** : Formulaire d’édition du profil (nom, rôle), prérempli si édition, sinon création.

### Navigation

- Depuis la liste, cliquer sur un utilisateur ouvre son profil détaillé.
- Depuis le profil, cliquer sur "Modifier" ouvre le formulaire d’édition.
- Après édition, retour possible à la liste ou au profil.

## Utilisation des composants

- **Layout** : Structure l’ensemble des pages, header et contenu principal.
- **Button** : Bouton stylisé, utilisé dans les formulaires et actions.
- **UserCard** : Affiche les infos clés d’un utilisateur (nom, rôle, bouton Modifier).
- **UserForm** : Formulaire réutilisable pour création ou édition d’utilisateur.

## Liens entre hooks, services et UI

- Les pages utilisent les composants UI pour l’affichage et la saisie.
- Les hooks (ex: `useUserProfile`) permettent de récupérer ou modifier les données utilisateur via les services (API/Supabase).
- Les services (ex: `users.ts`) centralisent les appels à la base ou à Supabase (CRUD, rôles, etc.).
- Les tests unitaires garantissent la stabilité des composants et des hooks.

## Bonnes pratiques de structure et d’extension

- Ajouter tout nouveau composant dans `components/` avec son test et sa story.
- Factoriser la logique d’accès aux données dans `hooks/` et `services/`.
- Utiliser `Layout` pour toutes les pages pour garantir la cohérence visuelle.
- Documenter chaque nouveau composant/page dans le README ou dans ce fichier.
- Viser 80% de couverture de test minimum sur les composants et hooks.
- Utiliser Storybook pour valider visuellement chaque composant avant intégration.

---

Ce guide permet à tout développeur de comprendre l’organisation, la navigation et les points d’extension du module Profils Utilisateurs. Pour toute évolution, garder la structure et la documentation à jour !
