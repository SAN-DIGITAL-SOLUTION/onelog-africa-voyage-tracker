# Documentation Finale & Déploiement – OneLog Africa

## 1. Structure de la documentation
- `README.md` : présentation générale, stack, installation
- `ROLES_SYSTEME_ONELOG.md` : matrice des rôles, permissions
- `QA_MVP_GLOBAL.md` : plan de tests complet
- `SECURITE_MVP_GLOBAL.md` : checklist sécurité
- `QA_DEMANDE_CLIENT.md`, `QA_DEMANDES_EXPLOITANT.md`, `QA_AFFECTATION_CHAUFFEUR.md`, `QA_MISSIONS_CHAUFFEUR.md` : QA modules
- `SECURITE_DEMANDE_CLIENT.md`, etc. : sécurité modules
- `scripts/seed_qa_supabase.sql` : seed QA Supabase
- `scripts/audit_rls_policies.sql` : audit automatique des policies

## 2. Déploiement production
- Vérifier les variables d’environnement (`.env.production`)
- Appliquer les dernières migrations SQL (tables, policies)
- Lancer le script d’audit RLS et corriger toute permissivité
- Lancer le seed QA si besoin de jeux de tests
- Déployer sur Netlify/Vercel (voir `.github/workflows/ci.yml`)
- Vérifier l’accès et la sécurité post-déploiement

## 3. Rollback
- Sauvegarder la base avant migration
- Utiliser Supabase Studio pour restaurer un backup si besoin

## 4. Générer la documentation PDF/HTML
- Utiliser Docsify, Sphinx ou Pandoc pour transformer les fichiers markdown en documentation partageable
- Exemple :
  - `npx docsify-cli init ./docs`
  - Copier les `.md` dans `/docs`
  - Déployer `/docs` sur Netlify ou GitHub Pages

---
