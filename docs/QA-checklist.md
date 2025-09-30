# Checklist QA – Module Profils utilisateurs

## 1. Tests fonctionnels
- [ ] Création de profil utilisateur (nom, email, rôle)
- [ ] Édition d’un profil existant
- [ ] Sélection et modification du rôle (Admin, Opérateur, Client)
- [ ] Upload et affichage de l’avatar
- [ ] Persistance et affichage de l’avatar après reload
- [ ] Validation du formulaire (nom requis, email non éditable)
- [ ] Affichage des messages de succès/erreur

## 2. Intégration
- [ ] Navigation vers /profile depuis le menu principal
- [ ] Retour à l’accueil après modification
- [ ] Cohérence UI avec le reste de l’application

## 3. Sécurité & permissions
- [ ] Accès à /profile restreint aux utilisateurs authentifiés
- [ ] Impossible de modifier le profil d’un autre utilisateur

## 4. Tests techniques
- [ ] Couverture des tests unitaires (Vitest)
- [ ] Mock Supabase effectif en environnement de test
- [ ] Pas d’appel réseau réel en test

## 5. Documentation
- [ ] Documentation technique à jour (docs/profils-doc.md)
- [ ] README à jour (usage, limitations, sécurité)
- [ ] Section sécurité renseignée (SECURITY.md)

---

**À valider avant livraison finale.**

Responsable QA : ________________________
Date : _________________________________
