# Checklist Sécurité – MVP Global OneLog Africa

- [ ] **RLS sur toutes les tables** :
  - Table `missions` : seul le chauffeur assigné, l’exploitant ou l’admin peut lire/écrire selon le statut
  - Table `demandes` : seul le client créateur, l’exploitant, l’admin
  - Table `tracking` : uniquement les utilisateurs concernés
  - Table `incidents` : uniquement le chauffeur concerné, l’exploitant
  - Table `factures` : client, admin, comptable
- [ ] **Contrôle des rôles dans chaque page** :
  - Middleware ou guard sur chaque route sensible
  - Affichage conditionnel des menus et actions
- [ ] **Protection des environnements et clés** :
  - Variables d’environnement non exposées dans le front
  - Clés Supabase sécurisées
- [ ] **Logs d’audit** :
  - Toutes les actions critiques sont loguées (création, modification, suppression)
- [ ] **Protection XSS/SQL** :
  - Échappement des champs texte
  - Requêtes paramétrées
- [ ] **HTTPS obligatoire**
- [ ] **Tests d’intrusion et vérification des accès**

---
