# Configuration des Environnements GitHub Actions

## 🎯 Objectif
Configurer les environnements `staging` et `production` dans GitHub pour résoudre les erreurs du workflow CI/CD.

## 🚨 Erreurs Actuelles
```
Value 'staging' is not valid (ligne 220)
Value 'production' is not valid (lignes 283, 329)
```

**Cause** : Les environnements référencés dans le workflow n'existent pas dans les paramètres du repository GitHub.

## 📋 Étapes de Configuration

### 1. Créer l'Environnement Staging

1. **Naviguer vers** : Repository → `Settings` → `Environments`
2. **Cliquer** : `New environment`
3. **Nom** : `staging`
4. **Configuration** :
   - **URL** : `https://staging.onelog-africa.com`
   - **Deployment branches** : `develop` uniquement
   - **Required reviewers** : Optionnel (recommandé : 1 reviewer)
   - **Wait timer** : 0 minutes

### 2. Créer l'Environnement Production

1. **Naviguer vers** : Repository → `Settings` → `Environments`
2. **Cliquer** : `New environment`
3. **Nom** : `production`
4. **Configuration** :
   - **URL** : `https://onelog-africa.com`
   - **Deployment branches** : `main` uniquement
   - **Required reviewers** : **OBLIGATOIRE** (minimum 1 reviewer)
   - **Wait timer** : 5 minutes (sécurité)
   - **Prevent self-review** : ✅ Activé

### 3. Configurer les Protection Rules

#### Staging Environment
```yaml
Deployment branches: Selected branches
- Branch: develop
Required reviewers: 1 (optionnel)
Wait timer: 0 minutes
```

#### Production Environment
```yaml
Deployment branches: Selected branches  
- Branch: main
Required reviewers: 1 (OBLIGATOIRE)
Wait timer: 5 minutes
Prevent self-review: ✅
Allow administrators to bypass: ❌
```

## 🔐 Secrets GitHub Actions Requis

### Navigation
Repository → `Settings` → `Secrets and variables` → `Actions`

### Secrets à Configurer

#### Staging Environment
```
STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJ...
STAGING_SENTRY_DSN=https://...@sentry.io/...
```

#### Production Environment  
```
PROD_SUPABASE_URL=https://your-prod-project.supabase.co
PROD_SUPABASE_ANON_KEY=eyJ...
PROD_SENTRY_DSN=https://...@sentry.io/...
```

#### Services Externes
```
SLACK_WEBHOOK=https://hooks.slack.com/services/...
SONAR_TOKEN=squ_...
CODECOV_TOKEN=...
```

## ✅ Validation

Après configuration, le workflow devrait :
- ✅ Reconnaître les environnements `staging` et `production`
- ✅ Appliquer les protection rules
- ✅ Accéder aux secrets configurés
- ✅ Exécuter les déploiements sans erreur

## 🔄 Ordre de Déploiement

1. **Develop** → **Staging** (automatique sur push)
2. **Main** → **Production** (avec approbation manuelle)
3. **Rollback** (automatique en cas d'échec)

## 📞 Support

En cas de problème :
1. Vérifier que les environnements sont bien créés
2. Valider les noms exacts (`staging`, `production`)
3. Confirmer les protection rules
4. Tester avec un déploiement staging d'abord

---

**Note** : Cette configuration est **obligatoire** pour que le pipeline CI/CD fonctionne correctement.
