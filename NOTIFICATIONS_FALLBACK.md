# Notifications : Fallback & Retry

## Logique IA-FIRST de fallback notifications

- **Relance automatique** : toute notification échouée ou non lue est relancée jusqu’à 3 fois par SMS (`retry_count < 3`), puis bascule en fallback email.
- **Enrichissement des logs** : chaque tentative est inscrite dans `notification_logs` avec :
  - `retry_count` (nombre de tentatives)
  - `fallback_channel` (canal utilisé pour le fallback)
  - `status` (failed, retry_sms, fallback_email, fallback_sent)
- **Responsabilité du service** : `notificationRetryService.ts` gère la logique de relance, le choix du canal, la création de logs, et la fonction `markAsRead` pour marquer une notification comme lue.

## Cron job automatique
- **Local** : `node-cron` via `scripts/cron-notify-retry.cjs` (lancé par `npm run cron:retry`)
- **Production** : crontab (`*/5 * * * * npm run notify:retry`)
- **Fréquence** : toutes les 5 minutes

## Exemple de log dans `notification_logs`
```json
{
  "notification_id": "notif1",
  "user_id": "user1",
  "channel": "sms",
  "status": "retry_sms",
  "retry_count": 2,
  "fallback_channel": "sms",
  "created_at": "2025-06-25T09:00:00Z"
}
```

## Tests
- **Unitaires** : `notificationRetryService.test.ts`
  - Cas : retry_count < 3 (SMS), retry_count ≥ 3 (email), gestion erreurs DB
- **E2E** : scénario relance/fallback/vérification logs

## Usage
- `npm run notify:retry` : relance immédiate
- `npm run cron:retry` : relance automatique toutes les 5 min

## Sécurité & audit
- Toutes les relances/fallback sont tracées et auditées dans `notification_logs`
- La fonction `markAsRead` permet de marquer une notification comme lue et d’arrêter les relances

---

Mise à jour : 2025-06-25
Responsable : IA-FIRST
