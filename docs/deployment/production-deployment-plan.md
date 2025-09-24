# 🚀 Plan de Déploiement Production - OneLog Africa

## Vue d'Ensemble

Ce document détaille la procédure complète de mise en production de OneLog Africa, incluant les vérifications préalables, les étapes de déploiement et les procédures de rollback.

## 📋 Check-list Pré-Déploiement

### ✅ Validation Technique

#### Code et Tests
- [ ] **Tests unitaires** : 100% de passage, couverture > 80%
- [ ] **Tests E2E** : Tous les scénarios critiques validés
- [ ] **Tests de charge** : Performances validées sous charge
- [ ] **Audit sécurité** : Scan de vulnérabilités passé
- [ ] **Code review** : Validation par au moins 2 développeurs seniors

#### Infrastructure
- [ ] **Environnement staging** : Identique à la production
- [ ] **Base de données** : Migrations testées et validées
- [ ] **Certificats SSL** : Valides et configurés
- [ ] **DNS** : Configuration et propagation vérifiées
- [ ] **CDN** : Configuration et cache optimisés

#### Monitoring
- [ ] **Sentry** : Configuration et tests d'alertes
- [ ] **Logs** : Centralisation et rétention configurées
- [ ] **Métriques** : Dashboards et alertes opérationnels
- [ ] **Health checks** : Endpoints de santé fonctionnels

### ✅ Validation Métier

#### Fonctionnalités
- [ ] **Authentification** : Tous les rôles testés
- [ ] **Missions** : Cycle complet testé (création → livraison)
- [ ] **Notifications** : Tous les canaux validés
- [ ] **Facturation** : Génération et envoi testés
- [ ] **Timeline** : Affichage et filtres fonctionnels

#### Données
- [ ] **Migration** : Données de production migrées en staging
- [ ] **Intégrité** : Vérification cohérence des données
- [ ] **Performance** : Requêtes optimisées
- [ ] **Sauvegarde** : Stratégie de backup validée

### ✅ Validation Opérationnelle

#### Équipe
- [ ] **Formation** : Équipe support formée
- [ ] **Documentation** : Guides utilisateurs finalisés
- [ ] **Procédures** : Runbooks opérationnels rédigés
- [ ] **Contacts** : Liste d'escalade mise à jour

#### Communication
- [ ] **Clients** : Notification de mise en production
- [ ] **Partenaires** : Information des intégrateurs
- [ ] **Équipe** : Planning et rôles définis
- [ ] **Support** : Renforcement équipe J-Day

## 🎯 Stratégie de Déploiement

### Approche Blue-Green

**Principe** : Deux environnements identiques (Blue/Green) permettent un basculement instantané et un rollback immédiat.

```
Production Actuelle (Blue) ←→ Nouvelle Version (Green)
```

**Avantages** :
- Zéro downtime
- Rollback instantané
- Tests en conditions réelles
- Validation progressive

### Phases de Déploiement

#### Phase 1 : Préparation (J-7)
- **Freeze code** : Branche `main` gelée
- **Build final** : Image Docker de production
- **Tests finaux** : Validation complète en staging
- **Communication** : Notification équipes et clients

#### Phase 2 : Déploiement Infrastructure (J-1)
- **Environnement Green** : Provisioning infrastructure
- **Base de données** : Réplication et synchronisation
- **Configuration** : Variables d'environnement
- **Tests infrastructure** : Validation connectivité

#### Phase 3 : Déploiement Application (J-Day)
- **Déploiement Green** : Application sur nouvel environnement
- **Tests smoke** : Vérifications fonctionnelles rapides
- **Tests de charge** : Validation performances
- **Validation métier** : Tests utilisateurs critiques

#### Phase 4 : Basculement (J-Day + 2h)
- **Basculement DNS** : Redirection trafic vers Green
- **Monitoring intensif** : Surveillance métriques
- **Support renforcé** : Équipe en alerte
- **Validation continue** : Tests automatisés

#### Phase 5 : Stabilisation (J+1 à J+7)
- **Monitoring** : Surveillance continue
- **Optimisations** : Ajustements si nécessaire
- **Feedback** : Retours utilisateurs
- **Documentation** : Mise à jour post-déploiement

## 🔧 Procédures Techniques

### Déploiement Automatisé

#### GitHub Actions Workflow
```yaml
# Déclenchement manuel pour production
workflow_dispatch:
  inputs:
    environment:
      description: 'Environment to deploy'
      required: true
      default: 'production'
      type: choice
      options:
      - production
```

#### Étapes Automatisées
1. **Build** : Compilation et optimisation
2. **Tests** : Exécution suite complète
3. **Security** : Scan vulnérabilités
4. **Deploy** : Déploiement sur Green
5. **Smoke Tests** : Validation fonctionnelle
6. **Switch** : Basculement DNS

### Configuration Environnement

#### Variables d'Environnement Production
```bash
# Application
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
VITE_API_URL=https://api.onelog-africa.com

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Monitoring
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Services externes
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
GOOGLE_MAPS_API_KEY=xxx
```

#### Secrets GitHub
- `PROD_SUPABASE_URL`
- `PROD_SUPABASE_ANON_KEY`
- `PROD_SENTRY_DSN`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Base de Données

#### Migration Production
```sql
-- Vérification pré-migration
SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;

-- Sauvegarde complète
pg_dump -h host -U user -d database > backup_pre_migration.sql

-- Exécution migrations
supabase db push --db-url $PRODUCTION_DB_URL

-- Vérification post-migration
SELECT COUNT(*) FROM missions;
SELECT COUNT(*) FROM users;
```

#### Rollback Base de Données
```sql
-- Restauration depuis sauvegarde
psql -h host -U user -d database < backup_pre_migration.sql

-- Vérification intégrité
SELECT pg_stat_database.* FROM pg_stat_database;
```

## 🚨 Procédures de Rollback

### Déclencheurs de Rollback

#### Automatiques
- **Taux d'erreur** > 5% pendant 5 minutes
- **Temps de réponse** > 3s pour 95% des requêtes
- **Health check** en échec pendant 2 minutes
- **Erreurs critiques** > 10 par minute

#### Manuels
- **Décision équipe** : Problème métier critique
- **Feedback utilisateurs** : Dysfonctionnements majeurs
- **Problème sécurité** : Vulnérabilité découverte
- **Performance** : Dégradation significative

### Procédure de Rollback

#### Rollback Immédiat (< 5 minutes)
1. **Alerte** : Notification équipe technique
2. **Décision** : Validation rollback par responsable
3. **Exécution** : Basculement DNS vers Blue
4. **Vérification** : Tests fonctionnels rapides
5. **Communication** : Information équipes et clients

#### Rollback Base de Données
```bash
# Arrêt des écritures
kubectl scale deployment api --replicas=0

# Restauration backup
pg_restore -h host -U user -d database backup_pre_migration.sql

# Redémarrage services
kubectl scale deployment api --replicas=3
```

#### Rollback Application
```bash
# Via GitHub Actions
gh workflow run rollback.yml -f environment=production

# Ou manuel via Vercel
vercel promote [previous-deployment-id] --token $VERCEL_TOKEN
```

### Validation Post-Rollback
- [ ] **Fonctionnalités** : Tests critiques passent
- [ ] **Performance** : Métriques normales
- [ ] **Données** : Intégrité vérifiée
- [ ] **Utilisateurs** : Accès restauré

## 📊 Monitoring et Alertes

### Métriques Critiques

#### Performance
- **Temps de réponse** : p50 < 500ms, p95 < 2s, p99 < 5s
- **Débit** : > 100 requêtes/seconde
- **Disponibilité** : > 99.9%
- **Erreurs** : < 1% taux d'erreur

#### Métier
- **Missions créées** : Monitoring en temps réel
- **Authentifications** : Taux de succès > 98%
- **Notifications** : Délai d'envoi < 30s
- **GPS tracking** : Précision et fréquence

### Alertes Configurées

#### Critiques (PagerDuty + SMS)
- Application indisponible > 2 minutes
- Taux d'erreur > 5% pendant 5 minutes
- Base de données inaccessible
- Certificat SSL expiré

#### Importantes (Slack + Email)
- Performance dégradée > 10 minutes
- Erreurs métier > seuil
- Espace disque < 20%
- Mémoire > 90%

#### Informatives (Slack)
- Déploiement réussi/échoué
- Nouveau utilisateur inscrit
- Pic de trafic inhabituel
- Maintenance programmée

## 👥 Rôles et Responsabilités

### Équipe de Déploiement

#### Tech Lead
- **Responsabilité** : Coordination technique générale
- **Actions** : Validation code, supervision déploiement
- **Escalade** : Décision rollback technique

#### DevOps Engineer
- **Responsabilité** : Infrastructure et déploiement
- **Actions** : Provisioning, monitoring, alertes
- **Escalade** : Problèmes infrastructure

#### Product Owner
- **Responsabilité** : Validation métier
- **Actions** : Tests fonctionnels, validation UX
- **Escalade** : Décision rollback métier

#### Support Manager
- **Responsabilité** : Support utilisateurs
- **Actions** : Communication, assistance
- **Escalade** : Problèmes utilisateurs critiques

### Contacts d'Urgence

#### Technique
- **Tech Lead** : +221 XX XXX XX XX
- **DevOps** : +221 XX XXX XX XX
- **Sysadmin** : +221 XX XXX XX XX

#### Métier
- **Product Owner** : +221 XX XXX XX XX
- **Support** : +221 XX XXX XX XX
- **Commercial** : +221 XX XXX XX XX

## 📅 Planning de Déploiement

### Calendrier Type

#### J-14 : Préparation
- Code freeze sur `main`
- Tests finaux en staging
- Validation sécurité

#### J-7 : Validation
- Tests de charge complets
- Validation métier finale
- Communication clients

#### J-3 : Préparation Infrastructure
- Provisioning environnement Green
- Configuration DNS
- Tests infrastructure

#### J-Day : Déploiement
- **08h00** : Briefing équipe
- **09h00** : Déploiement Green
- **10h00** : Tests smoke
- **11h00** : Tests de charge
- **12h00** : Validation métier
- **14h00** : Basculement DNS
- **15h00** : Monitoring intensif
- **18h00** : Bilan J-Day

#### J+1 à J+7 : Stabilisation
- Monitoring continu
- Support renforcé
- Optimisations
- Retours utilisateurs

### Fenêtres de Déploiement

#### Recommandées
- **Mardi à Jeudi** : 09h00 - 12h00 GMT
- **Éviter** : Lundi, Vendredi, veilles de fêtes
- **Saison** : Éviter périodes de forte activité

#### Maintenance d'Urgence
- **24h/7j** : Disponibilité équipe technique
- **Délai** : Intervention < 30 minutes
- **Communication** : Notification immédiate

## 📋 Check-list Post-Déploiement

### Validation Immédiate (J-Day)
- [ ] **Application** : Accessible et fonctionnelle
- [ ] **Authentification** : Tous les rôles testés
- [ ] **APIs** : Endpoints critiques opérationnels
- [ ] **Base de données** : Connexions et requêtes OK
- [ ] **Monitoring** : Métriques normales
- [ ] **Notifications** : Envoi fonctionnel

### Validation J+1
- [ ] **Performance** : Métriques dans les seuils
- [ ] **Erreurs** : Taux d'erreur acceptable
- [ ] **Utilisateurs** : Feedback positif
- [ ] **Support** : Tickets résolus
- [ ] **Monitoring** : Alertes configurées

### Validation J+7
- [ ] **Stabilité** : Aucun incident majeur
- [ ] **Performance** : Optimisations appliquées
- [ ] **Documentation** : Mise à jour complète
- [ ] **Équipe** : Retour d'expérience
- [ ] **Planification** : Prochaines évolutions

## 📚 Documentation et Formation

### Documentation Mise à Jour
- [ ] **Guides utilisateurs** : Nouvelles fonctionnalités
- [ ] **API Documentation** : Endpoints et exemples
- [ ] **Runbooks** : Procédures opérationnelles
- [ ] **Architecture** : Diagrammes et spécifications

### Formation Équipes
- [ ] **Support** : Nouvelles fonctionnalités
- [ ] **Commercial** : Arguments de vente
- [ ] **Technique** : Architecture et maintenance
- [ ] **Utilisateurs** : Sessions de formation

---

## 🎯 Critères de Succès

### Techniques
- ✅ **Disponibilité** : > 99.9% sur 30 jours
- ✅ **Performance** : Temps de réponse respectés
- ✅ **Erreurs** : < 1% taux d'erreur global
- ✅ **Sécurité** : Aucune vulnérabilité critique

### Métier
- ✅ **Adoption** : Utilisation par 100% des utilisateurs actifs
- ✅ **Satisfaction** : Note > 4/5 en moyenne
- ✅ **Support** : < 5% d'augmentation des tickets
- ✅ **Performance** : Amélioration des KPIs métier

### Opérationnels
- ✅ **Déploiement** : Réalisé dans les délais
- ✅ **Rollback** : Procédure testée et validée
- ✅ **Équipe** : Formation complète réalisée
- ✅ **Documentation** : 100% à jour

---

*Plan de Déploiement Production OneLog Africa - Version 1.0 - Août 2025*
