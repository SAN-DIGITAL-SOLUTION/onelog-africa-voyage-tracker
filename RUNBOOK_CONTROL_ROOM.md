# 📋 Runbook - Control Room Demo & Onboarding

## 🎯 Démonstration TV Mode - Checklist

### Pré-démo (5 min)
- [ ] Vérifier connexion backend: `curl http://localhost:3001/health`
- [ ] Vérifier WebSocket: `ws://localhost:3001`
- [ ] Lancer simulateur: `cd server && npm run simulate`
- [ ] Ouvrir URL: `http://localhost:5173/control-room`

### Setup TV Mode (2 min)
- [ ] Activer mode TV: bouton "TV Mode" en haut à droite
- [ ] Plein écran: F11
- [ ] Régler zoom: 125-150% pour lisibilité TV
- [ ] Tester refresh auto: toutes les 30s

### Scénario Demo (10 min)

#### 1. Vue d'ensemble (2 min)
- Montrer carte avec véhicules en temps réel
- Pointer clusters de véhicules
- Montrer statistiques globales (total, en ligne, alertes)

#### 2. Filtres temps réel (3 min)
- Filtrer par statut: "En route", "Arrêt", "Alerte"
- Filtrer par transporteur: démo dropdown
- Recherche par immatriculation

#### 3. Interactions véhicules (3 min)
- Cliquer sur véhicule: popup détails
- Zoom sur cluster: décomposition
- Suivi temps réel: déplacement en direct

#### 4. Mode supervision (2 min)
- Basculer mode TV → supervision
- Montrer historique trajectoire
- Démonstration alertes automatiques

## 👥 Onboarding Transporteurs Pilotes

### Transporteurs Pilotes - Phase 1
**Candidats idéaux**:
- **TransLog Afrique** (Sénégal) - 50 véhicules
- **Express Transport** (Côte d'Ivoire) - 35 véhicules
- **Rapid Delivery** (Ghana) - 25 véhicules

### Contrat Pilote (30 jours)

#### Jour 1-3: Setup
- [ ] Installation accès Control Room
- [ ] Formation 30 min équipe
- [ ] Configuration alertes personnalisées
- [ ] Test avec 5 véhicules pilotes

#### Jour 4-7: Monitoring
- [ ] Daily check 9h et 17h
- [ ] Rapport bugs/suggestions via Slack
- [ ] Mesure performance: latence < 200ms
- [ ] Validation données GPS précision < 10m

#### Jour 8-14: Élargissement
- [ ] Ajout progressif flotte complète
- [ ] Test mode TV pour supervision
- [ ] Formation chauffeurs app mobile
- [ ] Intégration systèmes existants

#### Jour 15-30: Optimisation
- [ ] Analyse ROI et gains d'efficacité
- [ ] Ajustements alertes et seuils
- [ ] Préparation rollout global
- [ ] Documentation retour d'expérience

## 📱 Guide Chauffeur Mobile

### App OneLog Driver - Installation
1. **Télécharger**: Play Store / App Store
2. **Connexion**: Identifiants transporteur fournis
3. **Permissions**: Localisation en arrière-plan
4. **Test**: Vérifier tracking en temps réel

### Fonctionnalités Chauffeur
- **Statut voyage**: En route / En pause / Terminé
- **Alertes SOS**: Bouton d'urgence intégré
- **Navigation**: Intégration Google Maps
- **Communication**: Chat avec dispatch

## 📊 KPIs Pilote

### Métriques de succès
- **Uptime**: > 99.5%
- **Latence GPS**: < 5 secondes
- **Précision localisation**: < 10 mètres
- **Taux erreur**: < 1%
- **Satisfaction utilisateur**: > 8/10

### Dashboard Pilote
```
┌─────────────────────────────────────┐
│ KPI Transporteur Pilote             │
├─────────────────────────────────────┤
│ Véhicules connectés: 45/50          │
│ Temps réel moyen: 2.3s             │
│ Alertes aujourd'hui: 3             │
│ Trajets complétés: 127             │
│ Satisfaction: 9.2/10               │
└─────────────────────────────────────┘
```

## 🔧 Support Technique

### Contacts
- **Support**: support@onelog.africa
- **Slack**: #control-room-pilotes
- **Urgent**: +221 77 123 4567

### Escalade
1. **Niveau 1**: Support chat (5 min)
2. **Niveau 2**: Appel support (15 min)
3. **Niveau 3**: Équipe technique (1h)

## 🎬 Script Demo Rapide (2 min)

### Version Express
1. **Ouverture** (10s): "Voici notre salle de contrôle en temps réel"
2. **Carte** (20s): Montrer véhicules en mouvement
3. **Filtre** (20s): Filtrer par "En alerte"
4. **Détails** (30s): Cliquer sur véhicule, montrer historique
5. **Conclusion** (40s): "Gain de 30% d'efficacité constaté"
