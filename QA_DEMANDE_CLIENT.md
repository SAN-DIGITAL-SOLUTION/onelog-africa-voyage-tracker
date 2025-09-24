# Fiche Test QA – Module Création de Demande Client

## Objectif
Vérifier que le formulaire de création de demande fonctionne correctement, est sécurisé et accessible uniquement au rôle "client".

## Étapes de test
1. **Accès à la page**
   - Connectez-vous avec un utilisateur ayant le rôle "client".
   - Accédez à `/demande-client`.
   - 🟢 La page s’affiche.
   - ❌ Si non connecté ou mauvais rôle, redirection vers `/auth` ou `/404`.

2. **Validation du formulaire**
   - Laissez un champ obligatoire vide → une erreur s’affiche.
   - Entrez un volume négatif ou zéro → erreur de validation.
   - Saisissez une date antérieure à aujourd’hui → erreur de validation.

3. **Envoi d’une demande valide**
   - Remplissez tous les champs correctement.
   - Cliquez sur "Envoyer la demande".
   - 🟢 Un message de succès s’affiche avec un lien de suivi.
   - La demande apparaît dans la base Supabase (table `demandes`).

4. **Sécurité**
   - Essayez d’accéder à la page avec un autre rôle (admin, chauffeur) → accès refusé.
   - Essayez d’injecter du code dans un champ → le champ est nettoyé/échoue.

5. **Responsivité**
   - Testez le formulaire sur mobile (Chrome DevTools, smartphone).
   - 🟢 Le formulaire s’adapte et reste utilisable.

---
