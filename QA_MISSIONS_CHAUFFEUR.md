# Fiche Test QA – Module Missions Chauffeur

## Objectif
Vérifier que le chauffeur peut gérer ses missions (accepter, démarrer, terminer, incident, signature) et que la sécurité d’accès est respectée.

## Étapes de test
1. **Accès à la page**
   - Connectez-vous avec un utilisateur ayant le rôle "chauffeur".
   - Accédez à `/missions-chauffeur`.
   - 🟢 La page s’affiche.
   - ❌ Si non connecté ou mauvais rôle, redirection vers `/auth` ou `/404`.

2. **Affichage des missions**
   - Les missions non terminées s’affichent sous forme de cartes.
   - Les infos principales sont visibles (type, adresses, statut).

3. **Actions sur mission**
   - "Accepter" / "Refuser" sur une mission en attente → statut mis à jour.
   - "Démarrer mission" sur une mission acceptée → statut passe à en_cours.
   - "Signaler incident" → modal, création d’un incident en base.
   - "Terminer mission" → modal signature, statut passe à terminée, signature enregistrée.

4. **Sécurité**
   - Essayez d’accéder à la page avec un autre rôle → accès refusé.
   - Essayez d’agir sur une mission non assignée → refus côté back.

5. **Responsivité**
   - Testez la page sur mobile (Chrome DevTools, smartphone).
   - 🟢 Les formulaires et listes sont utilisables.

---
