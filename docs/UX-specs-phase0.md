# Spécifications UX - Phase 0 | OneLog Africa Voyage Tracker

## 🎯 Objectif de la Phase 0

Validation interne des choix UI/UX pour les trois approches stratégiques :
- **Map-First** : Supervision temps réel en salle de contrôle
- **Card-First** : Synthèse métier rapide et modulaire
- **Timeline-First** : Suivi chronologique des événements

---

## 1. User Journeys Détaillés

### 1.1 Journey Opérateur (Rôle : Supervision quotidienne)

**Contexte** : L'opérateur arrive le matin et doit avoir une vue d'ensemble de la flotte.

**Parcours Map-First** :
1. **Connexion** → Dashboard principal
2. **Vue carte** → Visualisation immédiate des véhicules actifs
3. **Filtrage** → Sélection par statut (actif/maintenance/idle)
4. **Détail véhicule** → Clic sur marqueur → Popup avec infos mission
5. **Action** → Notification client ou contact chauffeur

**Temps estimé** : < 30 secondes pour vue d'ensemble, < 1 minute pour action

**Parcours Card-First** :
1. **Connexion** → Dashboard modulaire
2. **Scan rapide** → Lecture des KPI sur cards (missions, notifications, facturation)
3. **Drill-down** → Clic sur card → Modal détaillée
4. **Action** → Validation notification ou génération facture

**Temps estimé** : < 15 secondes pour vue d'ensemble, < 45 secondes pour action

### 1.2 Journey Superviseur (Rôle : Pilotage et contrôle)

**Contexte** : Le superviseur doit présenter l'état de la flotte en réunion.

**Parcours Map-First** :
1. **Mode plein écran** → Activation via bouton dédié
2. **Projection** → Affichage sur grand écran (TV/vidéoprojecteur)
3. **Navigation** → Zoom/dézoom, filtres visibles
4. **Présentation** → Explication des positions et statuts

**Parcours Timeline-First** :
1. **Vue chronologique** → Historique des 24 dernières heures
2. **Analyse** → Identification des pics d'activité
3. **Export** → Génération de rapport pour direction

---

## 2. Critères d'Acceptation UX

### 2.1 Critères de Performance
- **Temps de chargement initial** : < 2 secondes
- **Temps de basculement entre vues** : < 500ms
- **Réactivité des interactions** : < 200ms (hover, click)

### 2.2 Critères d'Intuitivité
- **Apprentissage** : Utilisateur autonome en < 1 minute
- **Navigation** : Maximum 3 clics pour atteindre une information
- **Feedback visuel** : États hover/active/disabled clairement identifiables

### 2.3 Critères Responsive
- **Desktop** : Optimisé pour écrans 1920x1080 et plus
- **Tablet** : Adaptation pour iPad (1024x768)
- **Mobile** : Interface simplifiée pour smartphones
- **Grand écran** : Mode plein écran pour salles de contrôle

### 2.4 Critères d'Accessibilité
- **Contraste** : Ratio minimum 4.5:1 (WCAG AA)
- **Navigation clavier** : Tous les éléments accessibles via Tab
- **Aria-labels** : Descriptions pour lecteurs d'écran
- **Focus visible** : Indicateurs de focus clairement visibles

---

## 3. Annotations Interactionnelles

### 3.1 États des Composants

**Boutons** :
- `default` : Couleur de base avec ombre légère
- `hover` : Élévation shadow-md + transition 200ms
- `active` : Shadow-inner + couleur plus foncée
- `disabled` : Opacité 50% + cursor not-allowed

**Cards** :
- `default` : Background blanc, shadow-sm
- `hover` : Shadow-lg + translation Y -2px
- `selected` : Border-left 4px couleur primaire

**Marqueurs Carte** :
- `active` : Vert pulsant (animation)
- `idle` : Gris statique
- `maintenance` : Rouge avec icône outils

### 3.2 Transitions et Animations

**Basculement de vues** :
```css
transition: all 300ms ease-in-out;
transform: translateX(0);
opacity: 1;
```

**Chargement des données** :
- Skeleton loading pour les cards
- Spinner centré pour la carte
- Progressive loading pour la timeline

**Micro-interactions** :
- Boutons : Scale 0.98 au clic
- Cards : Rotation légère (1deg) au hover
- Notifications : Slide-in depuis la droite

---

## 4. Spécifications Techniques

### 4.1 Breakpoints Responsive
```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }

/* Large screens */
@media (min-width: 1920px) { ... }
```

### 4.2 Couleurs et Typographie
```css
:root {
  --primary: #2563eb;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --background: #f8fafc;
  --surface: #ffffff;
}
```

### 4.3 Composants Réutilisables
- `<ViewSwitcher />` : Navigation entre vues
- `<KPICard />` : Affichage métriques
- `<VehicleMarker />` : Marqueurs carte
- `<TimelineEvent />` : Événements chronologiques

---

## 5. Tests Utilisateurs Prévus

### 5.1 Scénarios de Test
1. **Navigation rapide** : Basculer entre les 3 vues en < 10 secondes
2. **Recherche d'information** : Trouver le statut d'un véhicule spécifique
3. **Action métier** : Envoyer une notification depuis la carte
4. **Mode présentation** : Activer le plein écran et naviguer

### 5.2 Métriques à Mesurer
- Temps de complétion des tâches
- Nombre d'erreurs de navigation
- Satisfaction utilisateur (échelle 1-10)
- Préférence entre les 3 approches

---

## 6. Wireframes et Prototypes

### 6.1 Wireframes Disponibles
- **Map-First** : Vue carte avec sidebar compacte
- **Card-First** : Grille modulaire 3 colonnes
- **Timeline-First** : Liste chronologique avec filtres

### 6.2 Prototype Interactif
- **Localisation** : `/src/components/prototypes/UXPrototype.tsx`
- **Technologies** : React + Framer Motion + Tailwind CSS
- **Fonctionnalités** : Navigation fluide, animations, données simulées

---

## 7. Prochaines Étapes

### 7.1 Validation Interne
- [ ] Revue avec l'équipe technique
- [ ] Tests sur différents navigateurs
- [ ] Validation des performances

### 7.2 Préparation Phase 1
- [ ] Finalisation des spécifications techniques
- [ ] Création des composants de base
- [ ] Mise en place de l'environnement de développement

---

**Status** : ✅ Phase 0 - Revue UX interne TERMINÉE
**Prochaine étape** : Validation et lancement Phase 1 - Supervision MVP
