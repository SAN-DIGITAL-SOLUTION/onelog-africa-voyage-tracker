# 📊 Plan de Tests de Charge - OneLog Africa

## Vue d'Ensemble

Les tests de charge valident la capacité du système à gérer différents niveaux de trafic et identifient les points de rupture avant la mise en production.

## Types de Tests Implémentés

### 1. Test de Charge Standard (`load-test.js`)
**Objectif** : Valider les performances sous charge normale et pic prévisible

**Profil de charge** :
- Montée : 10 → 50 → 100 utilisateurs sur 9 minutes
- Maintien : 100 utilisateurs pendant 5 minutes
- Descente progressive

**Seuils de performance** :
- 95% des requêtes < 2 secondes
- Taux d'erreur < 5%
- Erreurs métier < 10%

**Scénarios testés** :
- Navigation homepage (30%)
- Authentification (15%)
- Liste des missions (25%)
- Création de mission (10%)
- Mises à jour GPS (15%)
- Notifications (5%)

### 2. Test de Stress (`stress-test.js`)
**Objectif** : Identifier les limites du système et comportement en surcharge

**Profil de charge** :
- Montée agressive : 50 → 200 → 500 utilisateurs
- Maintien du stress : 500 utilisateurs pendant 2 minutes

**Seuils de stress** :
- 99% des requêtes < 5 secondes
- Taux d'erreur < 15%
- Acceptation des erreurs 429 (rate limiting)

### 3. Test de Pic (`spike-test.js`)
**Objectif** : Valider la résilience face aux pics soudains de trafic

**Profil de charge** :
- Pic instantané : 10 → 1000 utilisateurs en 10 secondes
- Maintien : 30 secondes
- Retour normal immédiat

**Seuils de pic** :
- 95% des requêtes < 3 secondes
- Taux d'erreur < 25%
- Pas d'erreurs 5xx (serveur)

## Métriques Surveillées

### Performance
- **Temps de réponse** : p50, p95, p99
- **Débit** : Requêtes/seconde
- **Latence réseau** : Temps de connexion

### Fiabilité
- **Taux d'erreur HTTP** : 4xx, 5xx
- **Erreurs métier** : Échecs de création/mise à jour
- **Timeouts** : Requêtes abandonnées

### Ressources
- **CPU** : Utilisation serveur
- **Mémoire** : Consommation RAM
- **Base de données** : Connexions actives, temps de requête

## Environnements de Test

### Staging
- **URL** : `https://staging.onelog-africa.com`
- **Configuration** : Identique à la production
- **Données** : Jeu de données de test

### Production (Tests limités)
- **Smoke tests** uniquement après déploiement
- **Charge réduite** : Maximum 10 utilisateurs virtuels
- **Fenêtre** : Heures creuses uniquement

## Exécution des Tests

### Local
```bash
# Installation k6
npm install -g k6

# Test de charge standard
k6 run tests/load/load-test.js

# Test de stress
k6 run tests/load/stress-test.js

# Test de pic
k6 run tests/load/spike-test.js
```

### CI/CD (Automatique)
Les tests s'exécutent automatiquement :
- **Déclencheur** : Déploiement sur staging
- **Fréquence** : Chaque push sur `develop`
- **Rapport** : Artifacts GitHub Actions

### Paramètres d'Environnement
```bash
# URL de base
export BASE_URL=https://staging.onelog-africa.com

# Niveau de log
export K6_LOG_LEVEL=info

# Sortie des résultats
export K6_OUT=json=results.json
```

## Seuils de Performance Cibles

### Endpoints Critiques

| Endpoint | p95 Response Time | Throughput | Error Rate |
|----------|-------------------|------------|------------|
| `/` | < 800ms | > 100 rps | < 1% |
| `/api/missions` | < 1.5s | > 50 rps | < 2% |
| `/api/tracking` | < 500ms | > 200 rps | < 1% |
| `/api/notifications` | < 1s | > 30 rps | < 3% |
| `/api/admin/*` | < 2s | > 20 rps | < 5% |

### Ressources Système

| Ressource | Seuil Normal | Seuil Critique |
|-----------|--------------|----------------|
| CPU | < 70% | < 90% |
| RAM | < 80% | < 95% |
| DB Connections | < 80% pool | < 95% pool |
| Disk I/O | < 80% | < 95% |

## Analyse des Résultats

### Métriques de Succès
- ✅ Tous les seuils respectés
- ✅ Pas de dégradation progressive
- ✅ Récupération rapide après pic

### Signaux d'Alerte
- ⚠️ Temps de réponse croissant
- ⚠️ Taux d'erreur > 5%
- ⚠️ Timeouts fréquents

### Actions Correctives
- **Performance** : Optimisation requêtes, cache, CDN
- **Scalabilité** : Auto-scaling, load balancing
- **Fiabilité** : Circuit breakers, retry logic

## Rapports et Monitoring

### Génération de Rapports
```bash
# Rapport HTML détaillé
k6 run --out html=report.html tests/load/load-test.js

# Export JSON pour analyse
k6 run --out json=results.json tests/load/load-test.js

# Intégration Grafana
k6 run --out influxdb=http://localhost:8086/k6 tests/load/load-test.js
```

### Dashboard Temps Réel
- **Grafana** : Visualisation des métriques
- **InfluxDB** : Stockage des données de performance
- **Alertes** : Notifications automatiques

## Maintenance

### Mise à Jour des Tests
- **Fréquence** : À chaque nouvelle fonctionnalité
- **Validation** : Review par l'équipe
- **Documentation** : Mise à jour des seuils

### Calibrage des Seuils
- **Baseline** : Mesure initiale en production
- **Ajustement** : Selon l'évolution du trafic
- **Validation** : Tests A/B si nécessaire

## Ressources

- [Documentation k6](https://k6.io/docs/)
- [Best Practices Load Testing](https://k6.io/docs/testing-guides/test-types/)
- [Métriques k6](https://k6.io/docs/using-k6/metrics/)
