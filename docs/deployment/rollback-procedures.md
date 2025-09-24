# ↩️ Procédures de Rollback - OneLog Africa

## Vue d'Ensemble

Ce document détaille les procédures de rollback pour OneLog Africa, permettant un retour rapide et sécurisé à la version précédente en cas de problème en production.

## 🚨 Déclencheurs de Rollback

### Critères Automatiques

#### Performance
- **Temps de réponse** : p95 > 5 secondes pendant 5 minutes
- **Taux d'erreur** : > 5% pendant 5 minutes consécutives
- **Disponibilité** : < 95% pendant 10 minutes
- **Timeout** : > 10% des requêtes en timeout

#### Fonctionnel
- **Authentification** : Taux d'échec > 10%
- **Missions critiques** : Création/modification échoue > 20%
- **Notifications** : Échec d'envoi > 30%
- **GPS Tracking** : Perte de signal > 50% des véhicules

#### Infrastructure
- **Base de données** : Connexions échouées > 20%
- **APIs externes** : Indisponibilité Supabase/Twilio
- **Certificats** : Expiration ou erreur SSL
- **CDN** : Indisponibilité des assets statiques

### Critères Manuels

#### Décision Métier
- **Fonctionnalité critique** : Dysfonctionnement majeur
- **Sécurité** : Vulnérabilité découverte
- **Données** : Corruption ou perte détectée
- **Utilisateurs** : Feedback négatif massif

#### Décision Technique
- **Architecture** : Problème de conception
- **Performance** : Dégradation non résoluble rapidement
- **Intégration** : Échec service externe critique
- **Monitoring** : Perte de visibilité système

## ⚡ Procédure de Rollback Rapide

### Étape 1 : Évaluation (< 2 minutes)

#### Vérification Automatique
```bash
# Check health endpoints
curl -f https://onelog-africa.com/health
curl -f https://onelog-africa.com/api/health

# Check key metrics
curl -s "https://api.sentry.io/api/0/projects/onelog/events/" \
  -H "Authorization: Bearer $SENTRY_TOKEN" | jq '.[] | select(.level=="error")'
```

#### Validation Manuelle
- [ ] **Connexion** : Test authentification
- [ ] **Missions** : Création d'une mission test
- [ ] **Suivi** : Vérification GPS tracking
- [ ] **Notifications** : Test envoi notification

### Étape 2 : Décision (< 1 minute)

#### Responsables Décision
- **Tech Lead** : Problèmes techniques
- **Product Owner** : Problèmes fonctionnels
- **DevOps** : Problèmes infrastructure
- **Security Officer** : Problèmes sécurité

#### Critères de Décision
```
SI (erreurs_critiques > seuil) OU (performance_degradee > seuil) OU (fonctionnalite_critique_hs)
ALORS rollback_immediat = TRUE
```

### Étape 3 : Exécution Rollback (< 5 minutes)

#### Rollback Application
```bash
# Via GitHub Actions
gh workflow run .github/workflows/rollback.yml \
  -f environment=production \
  -f rollback_reason="Performance degradation"

# Ou manuel via Vercel
PREVIOUS_DEPLOYMENT=$(vercel ls --token $VERCEL_TOKEN | grep production | head -2 | tail -1 | awk '{print $1}')
vercel promote $PREVIOUS_DEPLOYMENT --token $VERCEL_TOKEN
```

#### Rollback DNS (si nécessaire)
```bash
# Basculement vers environnement Blue
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://rollback-dns.json
```

#### Rollback Base de Données
```sql
-- Vérification version actuelle
SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;

-- Rollback vers version précédente (si nécessaire)
-- ATTENTION: Seulement si migrations non destructives
BEGIN;
DELETE FROM schema_migrations WHERE version = '20250824_latest';
-- Rollback des changements de schéma si nécessaire
COMMIT;
```

### Étape 4 : Validation (< 3 minutes)

#### Tests Automatiques
```bash
# Smoke tests post-rollback
npm run test:smoke:production

# Health checks
for i in {1..10}; do
  curl -f https://onelog-africa.com/health && echo "OK" || echo "FAIL"
  sleep 5
done
```

#### Tests Manuels
- [ ] **Authentification** : Connexion utilisateur test
- [ ] **Fonctionnalités** : Tests des features critiques
- [ ] **Performance** : Vérification temps de réponse
- [ ] **Données** : Intégrité des données critiques

## 🔄 Types de Rollback

### 1. Rollback Application Seule

**Cas d'usage** : Problème code applicatif, pas de changement DB

```bash
# Rollback via CI/CD
gh workflow run rollback-app.yml -f environment=production

# Vérification
curl -s https://onelog-africa.com/api/version | jq '.version'
```

**Durée** : 2-5 minutes
**Impact** : Minimal, pas de perte de données

### 2. Rollback avec Base de Données

**Cas d'usage** : Migration DB problématique

```bash
# 1. Arrêt des écritures
kubectl scale deployment api --replicas=0

# 2. Rollback DB
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME backup_pre_migration.sql

# 3. Rollback application
gh workflow run rollback-full.yml -f environment=production

# 4. Redémarrage services
kubectl scale deployment api --replicas=3
```

**Durée** : 10-15 minutes
**Impact** : Perte potentielle de données récentes

### 3. Rollback Infrastructure Complète

**Cas d'usage** : Problème infrastructure majeur

```bash
# Basculement vers environnement Blue complet
terraform workspace select blue
terraform apply -var="active_environment=blue"

# Mise à jour DNS
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://switch-to-blue.json
```

**Durée** : 5-10 minutes
**Impact** : Downtime minimal avec Blue-Green

## 📊 Monitoring Post-Rollback

### Métriques à Surveiller

#### Performance
```bash
# Temps de réponse
curl -w "@curl-format.txt" -s -o /dev/null https://onelog-africa.com/

# Taux d'erreur
curl -s "https://api.sentry.io/api/0/projects/onelog/stats/" \
  -H "Authorization: Bearer $SENTRY_TOKEN"
```

#### Fonctionnel
- **Authentifications** : Taux de succès
- **Missions** : Créations réussies
- **Notifications** : Envois réussis
- **GPS** : Mises à jour tracking

#### Infrastructure
- **CPU/RAM** : Utilisation serveurs
- **DB** : Connexions et performances
- **CDN** : Cache hit ratio
- **SSL** : Validité certificats

### Alertes Post-Rollback

#### Immédiates (0-30 minutes)
- Vérification toutes les 1 minute
- Alertes critiques activées
- Monitoring manuel équipe

#### Court terme (30 minutes - 2 heures)
- Vérification toutes les 5 minutes
- Surveillance métriques métier
- Tests utilisateurs

#### Moyen terme (2-24 heures)
- Retour monitoring normal
- Analyse des logs
- Rapport post-incident

## 📋 Check-lists de Rollback

### Check-list Pré-Rollback
- [ ] **Sauvegarde** : Backup état actuel créé
- [ ] **Équipe** : Notification équipe technique
- [ ] **Communication** : Préparation message utilisateurs
- [ ] **Outils** : Accès aux outils de rollback vérifiés

### Check-list Exécution
- [ ] **Rollback** : Procédure exécutée
- [ ] **Validation** : Tests post-rollback passés
- [ ] **Monitoring** : Métriques normalisées
- [ ] **Communication** : Utilisateurs informés

### Check-list Post-Rollback
- [ ] **Stabilité** : Système stable > 30 minutes
- [ ] **Performance** : Métriques dans les seuils
- [ ] **Fonctionnel** : Features critiques opérationnelles
- [ ] **Documentation** : Incident documenté

## 🔧 Outils et Scripts

### Script de Rollback Automatique

```bash
#!/bin/bash
# rollback.sh - Script de rollback automatique

set -e

ENVIRONMENT=${1:-production}
REASON=${2:-"Automatic rollback"}

echo "🚨 Starting rollback for $ENVIRONMENT"
echo "Reason: $REASON"

# 1. Get previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --token $VERCEL_TOKEN | grep $ENVIRONMENT | head -2 | tail -1 | awk '{print $1}')

if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
    echo "❌ No previous deployment found"
    exit 1
fi

echo "📦 Rolling back to: $PREVIOUS_DEPLOYMENT"

# 2. Execute rollback
vercel promote $PREVIOUS_DEPLOYMENT --token $VERCEL_TOKEN

# 3. Wait for propagation
echo "⏳ Waiting for rollback to propagate..."
sleep 30

# 4. Validate rollback
echo "✅ Validating rollback..."
for i in {1..5}; do
    if curl -f https://onelog-africa.com/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
        break
    else
        echo "⚠️ Health check failed, retrying..."
        sleep 10
    fi
done

# 5. Notify team
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 Rollback completed for $ENVIRONMENT. Reason: $REASON\"}" \
    $SLACK_WEBHOOK_URL

echo "✅ Rollback completed successfully"
```

### Monitoring Post-Rollback

```bash
#!/bin/bash
# monitor-rollback.sh - Monitoring post-rollback

DURATION=${1:-1800}  # 30 minutes par défaut
INTERVAL=${2:-60}    # 1 minute par défaut

echo "📊 Starting post-rollback monitoring for ${DURATION}s"

END_TIME=$(($(date +%s) + DURATION))

while [ $(date +%s) -lt $END_TIME ]; do
    # Health check
    if curl -f https://onelog-africa.com/health > /dev/null 2>&1; then
        echo "$(date): ✅ Health check OK"
    else
        echo "$(date): ❌ Health check FAILED"
        # Alert team
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Health check failed post-rollback"}' \
            $SLACK_WEBHOOK_URL
    fi
    
    # Performance check
    RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null https://onelog-africa.com/)
    echo "$(date): ⏱️ Response time: ${RESPONSE_TIME}s"
    
    if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
        echo "$(date): ⚠️ Slow response time detected"
    fi
    
    sleep $INTERVAL
done

echo "📊 Monitoring completed"
```

## 📞 Contacts d'Urgence Rollback

### Équipe Technique
- **Tech Lead** : +221 XX XXX XX XX
- **DevOps Lead** : +221 XX XXX XX XX
- **Database Admin** : +221 XX XXX XX XX

### Équipe Métier
- **Product Owner** : +221 XX XXX XX XX
- **Support Manager** : +221 XX XXX XX XX

### Prestataires
- **Hébergeur** : Support 24/7
- **CDN Provider** : Support technique
- **Monitoring** : Sentry/DataDog support

## 📚 Documentation Post-Incident

### Rapport d'Incident Template

```markdown
# Incident Report - [Date] - [Titre]

## Résumé
- **Date/Heure** : 
- **Durée** : 
- **Impact** : 
- **Cause racine** : 

## Timeline
- **[Heure]** : Détection du problème
- **[Heure]** : Décision de rollback
- **[Heure]** : Début rollback
- **[Heure]** : Rollback terminé
- **[Heure]** : Validation complète

## Actions Correctives
1. **Immédiate** : 
2. **Court terme** : 
3. **Long terme** : 

## Leçons Apprises
- 
- 
- 

## Améliorations Processus
- 
- 
```

### Métriques à Documenter
- **MTTR** : Mean Time To Recovery
- **MTBF** : Mean Time Between Failures
- **Impact utilisateurs** : Nombre d'utilisateurs affectés
- **Perte de données** : Volume de données perdues (si applicable)

---

*Procédures de Rollback OneLog Africa - Version 1.0 - Août 2025*
