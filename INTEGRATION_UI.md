# Intégration UI

## Page Paramètres de notification

- Route Next.js : `/settings/notifications`
- Permet à chaque utilisateur de gérer ses canaux (Email, SMS, WhatsApp, in-app)
- Hook : `useNotificationPreferences` pour gestion d’état, chargement et sauvegarde
- Service : `notificationPreferencesService.ts` (CRUD Supabase)
- Sécurité : RLS sur la table `notification_preferences`
- Fonction Edge Supabase pour update sécurisé
- Tests : Vitest (hook/service), Cypress E2E (`notificationSettings.spec.ts`)

---

## StepIndicator (Barre de progression multi-étapes)

### Props
- `steps: { title: string; completed: boolean }[]` — Tableau d’étapes à afficher, chaque objet contient le titre de l’étape et si elle est complétée.

### Exemple minimal
```tsx
import { StepIndicator } from '@/components/StepIndicator';

const steps = [
  { title: 'Informations', completed: true },
  { title: 'Validation', completed: false },
  { title: 'Confirmation', completed: false },
];

<StepIndicator steps={steps} />
```

### Utilisation
- Placez `<StepIndicator />` en haut ou en bas de vos pages à étapes (onboarding, création de mission, etc.).
- Mettez à jour le tableau `steps` selon l’avancement de l’utilisateur.

---
