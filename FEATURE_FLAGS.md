# 🎯 Feature Flags - Rollout Progressif Control Room

## Configuration des Feature Flags

### 1. FEATURE_SUPERVISION_REALTIME
- **Description**: Active le mode supervision en temps réel
- **Valeurs**: `true` | `false`
- **Scope**: Transporteur (par organisation)
- **Default**: `false`

### 2. FEATURE_CANARY_TRANSPORTEURS
- **Description**: Liste des transporteurs pilotes pour rollout progressif
- **Format**: JSON array `["org_123", "org_456"]`
- **Default**: `[]`

### 3. FEATURE_OFFLINE_FALLBACK
- **Description**: Active le fallback offline mode
- **Valeurs**: `true` | `false`
- **Scope**: Global
- **Default**: `true`

## 🚀 Plan de Rollout Progressif

### Phase 1: Canary (1-3 transporteurs)
```bash
# Configuration initiale
FEATURE_CANARY_TRANSPORTEURS=["transp_pilot_001"]
FEATURE_SUPERVISION_REALTIME=true
```

### Phase 2: Élargissement (5 transporteurs)
```bash
# Élargissement progressif
FEATURE_CANARY_TRANSPORTEURS=["transp_pilot_001","transp_pilot_002","transp_pilot_003","transp_pilot_004","transp_pilot_005"]
```

### Phase 3: Global
```bash
# Rollout complet
FEATURE_SUPERVISION_REALTIME=true
FEATURE_CANARY_TRANSPORTEURS=[] # tous activés
```

## 📊 Monitoring des Phases

### Métriques à surveiller
- **Latency**: < 200ms (P95)
- **Error Rate**: < 1%
- **WebSocket Connections**: stabilité
- **Memory Usage**: < 80%
- **CPU Usage**: < 70%

### Commandes de monitoring
```bash
# Vérifier healthcheck
curl http://localhost:3001/health

# Vérifier métriques
curl http://localhost:3001/metrics

# Logs en temps réel
tail -f server/logs/app.log
```

## 🔧 Configuration Environment

### .env.staging
```bash
NODE_ENV=staging
FEATURE_SUPERVISION_REALTIME=true
FEATURE_CANARY_TRANSPORTEURS=["test_org_001"]
FEATURE_OFFLINE_FALLBACK=true
```

### .env.production
```bash
NODE_ENV=production
FEATURE_SUPERVISION_REALTIME=true
FEATURE_CANARY_TRANSPORTEURS=[]
FEATURE_OFFLINE_FALLBACK=true
```

## 🎮 Scripts de Rollout

### Activer pour transporteur spécifique
```bash
# Via API POST /admin/feature-flags
{
  "feature": "FEATURE_SUPERVISION_REALTIME",
  "transporteur_id": "transp_123",
  "enabled": true
}
```

### Vérifier statut rollout
```bash
# GET /admin/feature-flags/status
{
  "FEATURE_SUPERVISION_REALTIME": {
    "enabled": true,
    "canary_transporteurs": 3,
    "total_transporteurs": 150
  }
}
```
