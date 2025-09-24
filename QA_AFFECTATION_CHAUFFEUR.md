# Fiche Test QA – Module Affectation Chauffeur

## Objectif
Vérifier que l’exploitant peut affecter un chauffeur à une demande validée, et que la sécurité d’accès est respectée.

## Étapes de test
1. **Accès à la page**
   - Connectez-vous avec un utilisateur ayant le rôle "exploitant".
   - Accédez à `/affectation-exploitant`.
   - 🟢 La page s’affiche.
   - ❌ Si non connecté ou mauvais rôle, redirection vers `/auth` ou `/404`.

2. **Affichage des demandes validées**
   - Les demandes avec statut `validée` s’affichent sous forme de cartes/lignes.
   - Les infos principales sont visibles (type, adresses, trackingId).

3. **Affectation d’un chauffeur**
   - Cliquez sur "Affecter" sur une demande.
   - Sélectionnez un chauffeur disponible (et véhicule si activé).
   - Cliquez sur "Affecter le chauffeur".
   - 🟢 Une mission est créée en base, liée à la demande et au chauffeur.
   - Le chauffeur reçoit une notification (table `notifications`).
   - La demande disparaît de la liste (rafraîchissement).

4. **Sécurité**
   - Essayez d’accéder à la page avec un autre rôle → accès refusé.
   - Essayez d’affecter un chauffeur déjà en mission → message d’erreur.

5. **Responsivité**
   - Testez la page sur mobile (Chrome DevTools, smartphone).
   - 🟢 Les formulaires et listes sont utilisables.

---
