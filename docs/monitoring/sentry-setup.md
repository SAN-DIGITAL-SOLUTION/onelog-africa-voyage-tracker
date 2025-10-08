# 🔍 Configuration Monitoring Sentry - OneLog Africa

## Installation et Configuration

### 1. Variables d'Environnement

Ajouter dans `.env.production` :
```bash
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

### 2. Configuration GitHub Secrets

Dans les paramètres du repository GitHub, ajouter :
- `STAGING_SENTRY_DSN` : DSN pour l'environnement staging
- `PROD_SENTRY_DSN` : DSN pour l'environnement production

### 3. Intégration dans le Code

Le monitoring est automatiquement initialisé dans `src/main.tsx` :

```typescript
import { initSentry } from './lib/monitoring/sentry'
initSentry()
```

### 4. Utilisation dans les Composants

#### Capture d'Erreurs Métier
```typescript
import { captureBusinessError } from '@/lib/monitoring/sentry'

try {
  await createMission(data)
} catch (error) {
  captureBusinessError(error, {
    user: user.id,
    action: 'create_mission',
    module: 'missions',
    data: { missionType: data.type }
  })
}
```

#### Traçage des Performances
```typescript
import { traceOperation } from '@/lib/monitoring/sentry'

const result = await traceOperation(
  'fetch_missions',
  () => fetchMissions(filters),
  { page: currentPage.toString() }
)
```

#### Métriques Personnalisées
```typescript
import { trackMetrics } from '@/lib/monitoring/sentry'

// Création de mission
trackMetrics.missionCreated(duration, success)

// Mise à jour GPS
trackMetrics.trackingUpdate(missionId, accuracy)

// Notification envoyée
trackMetrics.notificationSent('whatsapp', success, retries)

// Problème de performance
trackMetrics.performanceIssue('api_call', duration, 2000)
```

## Configuration Sentry Dashboard

### 1. Alertes Recommandées

#### Erreurs Critiques
- **Condition** : `error.level:error AND error.handled:false`
- **Seuil** : > 5 erreurs en 5 minutes
- **Action** : Email + Slack

#### Performance Dégradée
- **Condition** : `transaction.duration:>2000ms`
- **Seuil** : > 10% des transactions
- **Action** : Slack notification

#### Taux d'Erreur Élevé
- **Condition** : `error.rate:>5%`
- **Période** : 10 minutes
- **Action** : Email équipe + PagerDuty

### 2. Dashboards Personnalisés

#### Dashboard Métier
- Missions créées/heure
- Erreurs par module
- Performance des endpoints critiques
- Taux de succès des notifications

#### Dashboard Technique
- Erreurs JavaScript par navigateur
- Performance des requêtes Supabase
- Utilisation mémoire
- Temps de chargement des pages

## Filtres et Sampling

### Production
- **Traces** : 10% (performance)
- **Session Replay** : 1% (normal) + 100% (erreurs)
- **Erreurs** : 100%

### Staging
- **Traces** : 100%
- **Session Replay** : 10%
- **Erreurs** : 100%

## Intégration CI/CD

Le pipeline GitHub Actions configure automatiquement :
- Upload des source maps
- Création des releases Sentry
- Notification des déploiements

## Maintenance

### Nettoyage Automatique
- **Événements** : Rétention 30 jours
- **Session Replays** : Rétention 14 jours
- **Attachments** : Rétention 7 jours

### Monitoring des Quotas
- Surveiller l'utilisation mensuelle
- Alertes à 80% du quota
- Ajustement du sampling si nécessaire

## Troubleshooting

### Erreurs Communes

#### DSN Non Configuré
```
Sentry DSN not configured
```
**Solution** : Vérifier la variable `VITE_SENTRY_DSN`

#### Source Maps Manquantes
**Solution** : Vérifier l'upload dans le pipeline CI/CD

#### Trop d'Événements
**Solution** : Ajuster les filtres dans `beforeSend`

### Debug Local
```bash
# Activer les logs Sentry
VITE_SENTRY_DEBUG=true npm run dev
```

## Ressources

- [Documentation Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
