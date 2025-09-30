# Documentation Système de Notifications - OneLog Africa

## Vue d'ensemble

Le système de notifications de OneLog Africa est une solution complète de gestion des notifications multi-canal, intégrant React Query pour la gestion d'état, Supabase pour le stockage, et des services d'envoi pour email, Slack, et SMS.

## Architecture

### Composants principaux

1. **Backend Service** (`src/services/notificationService.ts`)
   - Singleton pattern pour la gestion centralisée
   - Support multi-canal (email, Slack, SMS, in-app)
   - Gestion des préférences utilisateur
   - Retry logic et gestion d'erreurs

2. **React Hooks** (`src/hooks/useNotifications.ts`)
   - `useNotifications()` : Gestion complète des notifications
   - `useNotificationBadge()` : Compteur de notifications non lues
   - `useNotificationPreferences()` : Gestion des préférences
   - `useCreateNotification()` : Création de notifications

3. **UI Components**
   - `NotificationBadge` : Badge de notification avec compteur
   - `NotificationPanel` : Panneau latéral des notifications

### Types et Interfaces

```typescript
// Types de notifications
export type NotificationType = 
  | 'invoice_generated'
  | 'invoice_sent' 
  | 'payment_received'
  | 'payment_overdue'
  | 'mission_completed'
  | 'mission_delayed'
  | 'system_error'
  | 'maintenance'
  | 'custom';

export type NotificationChannel = 
  | 'email'
  | 'slack'
  | 'sms'
  | 'in_app';

export type NotificationStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read';

export type NotificationPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';
```

## Installation et Configuration

### Variables d'environnement

```bash
# MailerSend API
VITE_MAILERSEND_API_KEY=your_mailersend_api_key

# Slack Webhook (optionnel)
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Twilio (optionnel pour SMS)
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Base de données

Le système utilise les tables Supabase suivantes :

- `notifications` : Stockage des notifications
- `user_notification_preferences` : Préférences utilisateur
- `notification_webhooks` : Configuration webhooks

## Utilisation

### 1. Affichage du badge de notification

```tsx
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { useState } from 'react';

function Header() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flex items-center space-x-4">
      <NotificationBadge 
        onClick={() => setIsPanelOpen(true)} 
        className="relative"
      />
      
      <NotificationPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </div>
  );
}
```

### 2. Création de notifications

```typescript
import { NotificationService } from '@/services/notificationService';

const notificationService = NotificationService.getInstance();

// Créer une notification
await notificationService.createNotification({
  title: 'Nouvelle facture générée',
  message: 'La facture #12345 a été générée avec succès',
  type: 'invoice_generated',
  priority: 'high',
  userId: 'user-uuid',
  billingPartnerId: 'partner-uuid',
  relatedEntityType: 'invoice',
  relatedEntityId: 'invoice-uuid',
});

// Envoyer une notification personnalisée
await notificationService.sendCustomNotification({
  type: 'custom',
  channel: 'email',
  recipient: 'user@example.com',
  title: 'Message personnalisé',
  message: 'Contenu du message',
  userId: 'user-uuid',
});
```

### 3. Gestion des préférences

```typescript
import { useNotificationPreferences } from '@/hooks/useNotifications';

function NotificationSettings() {
  const { preferences, updatePreferences } = useNotificationPreferences();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences?.email_enabled}
          onChange={(e) => updatePreferences({ email_enabled: e.target.checked })}
        />
        Activer les notifications email
      </label>
    </div>
  );
}
```

## API Reference

### NotificationService

#### `createNotification(params: CreateNotificationParams): Promise<Notification>`
Crée une nouvelle notification dans la base de données.

#### `getUserNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]>`
Récupère les notifications d'un utilisateur avec filtres optionnels.

#### `markAsRead(notificationId: string, userId: string): Promise<void>`
Marque une notification comme lue.

#### `markAllAsRead(userId: string): Promise<void>`
Marque toutes les notifications comme lues.

#### `sendEmailNotification(recipient: string, subject: string, html: string): Promise<{ success: boolean; error?: string }>`
Envoie une notification email via MailerSend.

#### `sendSlackNotification(webhookUrl: string, message: string): Promise<{ success: boolean; error?: string }>`
Envoie une notification Slack via webhook.

### React Hooks

#### `useNotifications(filters?: NotificationFilters)`
Hook principal pour gérer les notifications.

**Retourne:**
- `notifications: Notification[]` - Liste des notifications
- `unreadCount: number` - Nombre de notifications non lues
- `isLoading: boolean` - État de chargement
- `markAsRead: (params: { notificationId: string }) => Promise<void>`
- `markAllAsRead: () => Promise<void>`
- `refetch: () => void`

#### `useNotificationBadge()`
Hook pour le badge de notification.

**Retourne:**
- `unreadCount: number`
- `isLoading: boolean`

## Sécurité et RLS

### Policies Supabase

```sql
-- Notifications access
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Notification preferences
CREATE POLICY "Users can manage their preferences"
  ON user_notification_preferences FOR ALL
  USING (auth.uid() = user_id);
```

## Tests

### Tests unitaires

```bash
# Lancer tous les tests
npm test

# Tests spécifiques aux notifications
npm test NotificationBadge
npm test NotificationPanel
```

### Tests d'intégration

```bash
# Tests Cypress
npm run cypress:open
```

## Troubleshooting

### Problèmes courants

1. **Notifications non reçues**
   - Vérifier les variables d'environnement
   - Vérifier les logs Supabase
   - Vérifier les préférences utilisateur

2. **Badge non mis à jour**
   - Vérifier la connexion Supabase
   - Vérifier les permissions RLS
   - Vérifier les webhooks

3. **Erreurs d'envoi email**
   - Vérifier la clé API MailerSend
   - Vérifier les limites de quota
   - Vérifier les adresses email

## Déploiement

### Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Tables Supabase créées
- [ ] RLS policies activées
- [ ] Webhooks configurés
- [ ] Tests unitaires passés
- [ ] Tests d'intégration passés

### Migration de données

```sql
-- Script de migration pour les notifications existantes
INSERT INTO notifications (
  title, message, type, priority, user_id, 
  created_at, updated_at
)
SELECT 
  'Migration: ' || event_type,
  'Notification migrée depuis ancien système',
  'custom',
  'medium',
  user_id,
  created_at,
  updated_at
FROM old_notifications;
```

## Support et maintenance

### Monitoring

- Logs d'erreurs via Sentry
- Métriques de performance via React Query DevTools
- Monitoring Supabase via dashboard

### Maintenance

- Nettoyage régulier des notifications lues (30 jours)
- Mise à jour des préférences utilisateur
- Vérification des quotas API

## Contact

Pour toute question ou support technique, contactez l'équipe OneLog Africa.
