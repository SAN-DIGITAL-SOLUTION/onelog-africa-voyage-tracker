# Wireframes Phase 0 - OneLog Africa Voyage Tracker

## Vue d'ensemble des Wireframes

Les wireframes suivants représentent les trois approches stratégiques validées pour l'interface utilisateur :

### 1. Map-First View (Supervision Temps Réel)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OneLog Africa                                    [User Menu] [Notifications] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────┐  ┌─────────────────────────────────────────────────────────┐ │
│ │   FILTRES   │  │                                                         │ │
│ │             │  │                    CARTE INTERACTIVE                    │ │
│ │ □ Actifs    │  │                                                         │ │
│ │ □ Inactifs  │  │    🟢 Véhicule A-001 (Dakar)                          │ │
│ │ □ Maintenance│  │                                                         │ │
│ │             │  │         🔵 Véhicule B-002 (Thiès)                     │ │
│ │   KPI       │  │                                                         │ │
│ │ Actifs: 2   │  │                  🔴 Véhicule C-003 (Maintenance)       │ │
│ │ Total: 3    │  │                                                         │ │
│ │             │  │                                                         │ │
│ │ [Plein      │  │                                                         │ │
│ │  Écran]     │  │                                                         │ │
│ └─────────────┘  └─────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Card-First View (Dashboard Modulaire)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OneLog Africa                                    [User Menu] [Notifications] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                 │
│ │    MISSIONS     │ │  NOTIFICATIONS  │ │   FACTURATION   │                 │
│ │                 │ │                 │ │                 │                 │
│ │ 🚛 En cours: 5  │ │ 🔔 Non lues: 3  │ │ 💰 Ce mois:     │                 │
│ │ ✅ Terminées: 12│ │ ✉️ Envoyées: 15 │ │    2.5M FCFA    │                 │
│ │                 │ │                 │ │                 │                 │
│ │ ▓▓▓▓▓░░░░░ 65%  │ │ [Voir toutes]   │ │ ⏳ En attente:  │                 │
│ │                 │ │                 │ │    850K FCFA    │                 │
│ │ [Voir détails]  │ │                 │ │                 │                 │
│ └─────────────────┘ └─────────────────┘ │ [Générer]       │                 │
│                                         └─────────────────┘                 │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                 │
│ │   VÉHICULES     │ │    CHAUFFEURS   │ │   STATISTIQUES  │                 │
│ │                 │ │                 │ │                 │                 │
│ │ 🟢 Actifs: 2    │ │ 👤 Disponibles: │ │ 📊 Performance  │                 │
│ │ 🔴 Maintenance: │ │     8           │ │    mensuelle    │                 │
│ │     1           │ │ 🚗 En mission:  │ │                 │                 │
│ │                 │ │     5           │ │ ↗️ +15% vs mois │                 │
│ │ [Gérer flotte]  │ │                 │ │    précédent    │                 │
│ │                 │ │ [Planning]      │ │                 │                 │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3. Timeline-First View (Suivi Chronologique)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OneLog Africa                                    [User Menu] [Notifications] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐   │
│ │                        TIMELINE DES ÉVÉNEMENTS                         │   │
│ │                                                                         │   │
│ │ 14:30 ●─── 🚛 Départ Camion A-001 (Dakar → Thiès)                     │   │
│ │       │                                                                 │   │
│ │ 13:45 ●─── ✅ Livraison terminée - Thiès                               │   │
│ │       │                                                                 │   │
│ │ 12:20 ●─── 📧 Notification envoyée au client SONATEL                   │   │
│ │       │                                                                 │   │
│ │ 11:15 ●─── ⚠️ Maintenance programmée B-002                             │   │
│ │       │                                                                 │   │
│ │ 10:30 ●─── 🔄 Changement de statut mission #M-2024-001                │   │
│ │       │                                                                 │   │
│ │ 09:45 ●─── 📋 Nouvelle mission créée - Transport Kaolack               │   │
│ │       │                                                                 │   │
│ │ 08:00 ●─── 🌅 Début de journée - 3 véhicules disponibles              │   │
│ │                                                                         │   │
│ └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                 │
│ │    FILTRES      │ │   STATISTIQUES  │ │    ACTIONS      │                 │
│ │                 │ │                 │ │                 │                 │
│ │ 📅 Aujourd'hui  │ │ 📊 Événements:  │ │ 📤 Exporter     │                 │
│ │ 📅 Cette semaine│ │     24          │ │    rapport      │                 │
│ │ 📅 Ce mois      │ │                 │ │                 │                 │
│ │                 │ │ ⚡ Pic activité:│ │ 🔔 Créer        │                 │
│ │ 🏷️ Missions     │ │    14h-16h      │ │    alerte       │                 │
│ │ 🏷️ Maintenance  │ │                 │ │                 │                 │
│ │ 🏷️ Notifications│ │                 │ │                 │                 │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Spécifications des Wireframes

### Dimensions et Responsive
- **Desktop** : 1920x1080 (optimisé)
- **Tablet** : 1024x768 (adapté)
- **Mobile** : 375x667 (simplifié)

### Éléments Interactifs
- **Boutons** : Coins arrondis, ombre portée
- **Cards** : Hover avec élévation
- **Marqueurs** : Animation pulsante pour les actifs

### Navigation
- **Header** : Fixe avec menu utilisateur
- **Sidebar** : Rétractable sur mobile
- **Breadcrumb** : Navigation contextuelle

### États Visuels
- **Chargement** : Skeleton loading
- **Erreur** : Messages contextuels
- **Succès** : Feedback visuel immédiat

## Validation Technique

### Accessibilité
- Contraste WCAG AA compliant
- Navigation clavier complète
- Aria-labels sur tous les éléments interactifs

### Performance
- Lazy loading des composants
- Optimisation des images
- Mise en cache des données

### Compatibilité
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

**Status** : ✅ Wireframes Phase 0 - TERMINÉS
**Fichiers associés** :
- Prototype interactif : `/src/components/prototypes/UXPrototype.tsx`
- Spécifications UX : `/docs/UX-specs-phase0.md`
