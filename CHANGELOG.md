# Changelog

## [1.0.0] – 2025-06-20

### Ajouts majeurs
- **Module Profils Utilisateurs** :
  - Création, édition, affichage du profil utilisateur
  - Sélection du rôle (Admin, Opérateur, Client)
  - Intégration Supabase Auth et table `users` étendue
  - Upload et affichage d’avatar, persistance dans Supabase Storage
  - Validation des champs avec React Hook Form et Zod
- **Module Facturation** :
  - Pages invoices, génération PDF/CSV, envoi email via Edge Functions
- **Notifications** :
  - Refactor, cohérence diagnostic, exports, footer
- **Tests unitaires** :
  - Couverture complète du module Profils avec Vitest et mock Supabase
- **Documentation** :
  - README, docs/profils-doc.md, docs/factures-doc.md, SECURITY.md, QA-checklist.md
- **Branding** :
  - Ajout des logos OneLog Africa (fond transparent et blanc)

### Sécurité
- Vulnérabilités modérées documentées (esbuild/vite)

### QA
- Checklist QA complète, tests manuels et unitaires validés

---

*Livraison validée le 20/06/2025*
