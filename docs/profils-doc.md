# Documentation du module Profils Utilisateurs

## Objectif
Permettre la création, l’édition et l’affichage de profils utilisateurs avec sélection de rôle, intégration Supabase Auth, et extension future (avatar, préférences, historique).

## Fonctionnalités principales
- Création/édition/affichage du profil utilisateur
- Sélection du rôle (Admin, Opérateur, Client)
- Intégration directe avec Supabase Auth et table `users` étendue
- Affichage des champs essentiels : nom, email, rôle, date de création

## Structure technique
- **Page** : `src/pages/profile/index.tsx` (wrapper) + `src/pages/profile.tsx`
- **Composant** : `src/components/ProfileForm.tsx`
- **Service** : `src/services/users.ts`
- **Types** : `src/types/user.ts`

## Flux de données
1. Authentification via Supabase (user courant)
2. Lecture/écriture du profil depuis/vers la table `users`
3. Synchronisation des métadonnées (nom, rôle) dans Supabase Auth

## Utilisation
- Accès au profil via `/profile`
- Modification du nom et du rôle possible si autorisé
- Email non modifiable (issu de Supabase Auth)

## Extension prévue
- Ajout d’un champ avatar (upload et affichage)
- Gestion des préférences utilisateur
- Historique d’activité

## Tests unitaires
- À écrire dans `src/components/__tests__/ProfileForm.test.tsx`
- Cas à couvrir : création, édition, validation, erreurs

## Pré-requis
- Table `users` dans Supabase avec schéma :
  - id (UUID, PK)
  - name (text)
  - email (text)
  - role (text)
  - created_at (timestamp)

## Sécurité
- Vérifier les droits d’accès et la cohérence entre Auth et table `users`
- Protéger les routes sensibles (RequireAuth)

## Exemple d’appel service
```ts
import { getUserProfile, updateUserProfile } from "../services/users";
const profile = await getUserProfile(user.id);
await updateUserProfile(user.id, { name: "Nouveau nom", role: "client" });
```
