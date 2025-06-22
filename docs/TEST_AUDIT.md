# 🧪 Audit de couverture des tests – OneLog Africa

## 1. Couverture des modules et workflows

| Module / Workflow              | Couvert par tests | Type(s) de test(s)        |
|-------------------------------|:-----------------:|---------------------------|
| Onboarding                    |       ✅          | E2E, unitaire             |
| Authentification              |       ⚠️          | (partiel, pas de login.cy)|
| Dashboard Client              |       ✅          | E2E, unitaire             |
| Dashboard Chauffeur           |       ✅          | E2E, unitaire             |
| Dashboard Admin               |       ✅          | E2E, unitaire             |
| Missions (listing, détail)    |       ✅          | E2E, unitaire             |
| Facturation (invoices)        |       ⚠️          | (pas de client_invoices)  |
| Notifications                 |       ⚠️          | (pas de NotificationList) |
| Tracking live                 |       ✅          | E2E, unitaire             |
| Rôle-requests/modération      |       ✅          | E2E, unitaire             |
| Protection des routes         |       ✅          | E2E, unitaire             |
| Profil utilisateur            |       ⚠️          | (pas de test dédié)       |

## 2. Fichiers de tests existants

### E2E (Cypress)
- `cypress/e2e/admin_role_moderation.cy.ts`
- `cypress/e2e/chauffeur_tracking.cy.ts`
- `cypress/e2e/client_dashboard.cy.ts`
- `cypress/e2e/mission_tracking.cy.ts`
- `cypress/e2e/onboarding_modes.cy.ts`
- `cypress/e2e/route_protection.cy.ts`

### Unitaires (Vitest)
- `tests/admin_role_moderation.test.ts`
- `tests/chauffeur_dashboard.test.tsx`
- `tests/chauffeur_tracking.test.ts`
- `tests/checkin_checkout.test.tsx`
- `tests/client_dashboard.test.tsx`
- `tests/live_tracking.test.ts`
- `tests/mission_history.test.tsx`
- `tests/onboarding_modes.test.ts`
- `tests/route_protection.test.ts`

## 3. Recommandations & scénarios à ajouter

- **Authentification** :
  - Ajouter un test E2E `login.cy.ts` (connexion, logout, erreurs, redirections).
  - Ajouter un test unitaire pour le composant/formulaire de login.
- **Facturation** :
  - Ajouter un test E2E `client_invoices.cy.ts` (affichage, export, accès sécurisé).
  - Ajouter un test unitaire sur `InvoiceList` et `Invoices`.
- **Notifications** :
  - Ajouter un test E2E sur la réception, affichage et suppression de notifications.
  - Ajouter un test unitaire sur `NotificationList` et `NotificationToast`.
- **Profil utilisateur** :
  - Ajouter un test E2E sur la modification du profil, upload d’avatar, gestion erreurs.
  - Ajouter un test unitaire sur `ProfileForm` et `profile.tsx`.

---

## Relancer l’audit automatiquement

```sh
npm run audit:tests
```

_Script à ajouter dans package.json :_
```json
"scripts": {
  ...
  "audit:tests": "node scripts/audit-tests.js"
}
```

---

Ce rapport doit être tenu à jour à chaque ajout de module ou de test. Il sert de checklist QA et d’outil de pilotage pour la couverture des tests MVP.
