# 📊 Phase 2 - Cards Dashboard : Spécifications Techniques

## 🎯 Objectif
Développer un **dashboard modulaire** avec cartes synthétiques pour OneLog Africa Voyage Tracker, intégrant la palette UI existante et offrant une vue d'ensemble des KPIs flotte.

---

## 🏗️ Architecture

### 📁 Structure des Composants
```
src/components/dashboard/
├── DashboardGrid.tsx          # Grille responsive principale
├── CardVehicleStats.tsx       # Statistiques véhicules détaillées
├── StatWidget.tsx             # Widget statistique générique
├── CardMissionStats.tsx       # Statistiques missions (à venir)
├── CardPerformance.tsx        # Indicateurs performance (à venir)
└── index.ts                   # Exports centralisés
```

### 🎨 Intégration UI System
- **Palette OneLog Africa** : Utilisation via `ui-system.tsx` existant
- **Composants de base** : Card, Badge, Button déjà disponibles
- **Cohérence visuelle** : Respect des couleurs et typographie Phase 1

---

## 🧩 Composants MVP

### 1. DashboardGrid
**Responsabilité** : Grille responsive pour organiser les cartes

#### ✅ Fonctionnalités
- **Layout adaptatif** : 1 col (mobile), 2 cols (tablette), 3 cols (desktop)
- **Espacement cohérent** : Gap de 6 unités Tailwind
- **Extensibilité** : Support ajout/suppression cartes dynamique
- **Accessibilité** : data-testid pour tests E2E

#### 🔧 Props Interface
```typescript
interface DashboardGridProps {
  className?: string;
  children?: React.ReactNode;
}
```

### 2. CardVehicleStats
**Responsabilité** : Affichage détaillé des statistiques véhicules

#### ✅ Fonctionnalités
- **Métriques clés** : Total, actifs, inactifs, maintenance
- **Indicateurs visuels** : Couleurs par statut, badges pourcentage
- **Tendances** : Évolution avec icônes directionnelles
- **État de chargement** : Skeleton loader animé
- **Mise à jour temps réel** : Timestamp dernière actualisation

#### 🔧 Props Interface
```typescript
interface VehicleStatsData {
  active: number;
  inactive: number;
  maintenance: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface CardVehicleStatsProps {
  data?: VehicleStatsData;
  loading?: boolean;
  className?: string;
}
```

### 3. StatWidget
**Responsabilité** : Widget générique pour métriques simples

#### ✅ Fonctionnalités
- **Affichage flexible** : Titre, valeur, sous-titre
- **Icône optionnelle** : Support Lucide React
- **Tendances** : Indicateur direction avec pourcentage
- **Thèmes couleur** : 6 variantes (primary, secondary, accent, success, warning, error)
- **État de chargement** : Animation skeleton

#### 🔧 Props Interface
```typescript
interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  loading?: boolean;
  className?: string;
}
```

---

## 📊 Données et Services

### 🔌 Sources de Données
- **Supabase** : Connexion existante pour données réelles
- **Mock Data** : Données simulées pour développement
- **Cache local** : Optimisation performance avec React Query (optionnel)

### 📈 Métriques Calculées
```typescript
interface DashboardMetrics {
  vehicles: {
    total: number;
    active: number;
    inactive: number;
    maintenance: number;
    trend: TrendData;
  };
  missions: {
    completed: number;
    inProgress: number;
    delayed: number;
    trend: TrendData;
  };
  performance: {
    onTimeRate: number;
    fuelEfficiency: number;
    utilizationRate: number;
    trend: TrendData;
  };
}
```

---

## 🎨 Design System

### 🎨 Palette Couleurs (OneLog Africa)
```css
/* Couleurs principales */
--primary-dark: #1A3C40;      /* Textes, titres */
--primary-yellow: #F9A825;    /* Accents, CTA */
--accent-orange: #E65100;     /* Alertes, erreurs */
--secondary-teal: #009688;    /* Succès, validation */
--neutral-dark: #263238;      /* Textes secondaires */
--neutral-light: #F4F4F4;     /* Fonds, séparateurs */
```

### 📏 Dimensions et Espacements
- **Cards** : Padding 6 (24px), border-radius par défaut
- **Grid** : Gap 6 (24px) entre cartes
- **Breakpoints** : Mobile < 768px, Tablette 768-1024px, Desktop > 1024px
- **Typographie** : Montserrat (titres), Open Sans (texte)

---

## 🧪 Tests

### ✅ Tests Unitaires (Vitest)
```typescript
// Tests à implémenter
describe('DashboardGrid', () => {
  it('renders with correct responsive classes');
  it('handles empty state gracefully');
  it('supports custom className');
});

describe('CardVehicleStats', () => {
  it('displays vehicle statistics correctly');
  it('shows loading state with skeleton');
  it('calculates percentages accurately');
  it('renders trend indicators properly');
});

describe('StatWidget', () => {
  it('renders all variants correctly');
  it('handles missing optional props');
  it('displays trend information when provided');
  it('applies correct color themes');
});
```

### 🔍 Tests E2E (Cypress)
```typescript
// Tests d'intégration à implémenter
describe('Dashboard Integration', () => {
  it('loads dashboard with all cards');
  it('updates data in real-time');
  it('maintains responsive layout');
  it('handles data loading states');
  it('navigates between dashboard sections');
});
```

---

## 📱 Responsive Design

### 📱 Mobile (< 768px)
- **Layout** : 1 colonne, cartes pleine largeur
- **Cartes** : Hauteur adaptée, contenu prioritaire visible
- **Navigation** : Touch-friendly, espacement suffisant
- **Performance** : Lazy loading des cartes non visibles

### 📟 Tablette (768px - 1024px)
- **Layout** : 2 colonnes, répartition équilibrée
- **Cartes** : Taille optimisée pour lecture
- **Interactions** : Support touch et hover
- **Orientation** : Adaptation portrait/paysage

### 🖥️ Desktop (> 1024px)
- **Layout** : 3 colonnes, utilisation optimale espace
- **Cartes** : Détails complets visibles
- **Interactions** : Hover effects, tooltips
- **Performance** : Animations fluides

---

## ⚡ Performance

### 🎯 Critères de Performance
| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Chargement initial** | < 1.5s | Time to Interactive |
| **Mise à jour données** | < 500ms | Data refresh |
| **Changement layout** | < 200ms | Responsive transitions |
| **Animation cartes** | 60fps | Smooth animations |

### 🔧 Optimisations
- **Lazy loading** : Cartes hors viewport
- **Memoization** : React.memo sur composants statiques
- **Debouncing** : Mises à jour données fréquentes
- **Code splitting** : Import dynamique des cartes

---

## 🔐 Sécurité

### 🛡️ Validation Données
- **Input sanitization** : Nettoyage données API
- **Type checking** : Validation TypeScript stricte
- **Error boundaries** : Gestion erreurs composants
- **Rate limiting** : Protection contre requêtes excessives

### 🔒 Authentification
- **JWT tokens** : Validation côté client
- **Permissions** : Accès selon rôle utilisateur
- **Session management** : Renouvellement automatique
- **Audit logs** : Traçabilité actions utilisateur

---

## 🚀 Déploiement

### 📦 Build Process
```bash
# Build optimisé
npm run build

# Tests avant déploiement
npm run test
npm run test:e2e

# Vérification qualité
npm run lint
npm run type-check
```

### 🌐 Environnements
- **Development** : Mock data, hot reload
- **Staging** : Données réelles, tests complets
- **Production** : Optimisations, monitoring

---

## 📈 Métriques et Monitoring

### 📊 KPIs Techniques
- **Bundle size** : < 500KB gzipped
- **Lighthouse score** : > 90
- **Error rate** : < 1%
- **Uptime** : > 99.9%

### 🔍 Monitoring
- **Performance** : Web Vitals, Core Web Vitals
- **Erreurs** : Sentry, logs centralisés
- **Usage** : Analytics, heatmaps
- **API** : Latence, taux d'erreur

---

## 🗺️ Roadmap

### 🎯 Phase 2a - MVP (Actuel)
- [x] DashboardGrid responsive
- [x] CardVehicleStats avec tendances
- [x] StatWidget générique
- [ ] Tests unitaires complets
- [ ] Tests E2E de base
- [ ] Documentation utilisateur

### 🎯 Phase 2b - Extensions
- [ ] CardMissionStats (missions, retards)
- [ ] CardPerformance (KPIs, efficacité)
- [ ] Graphiques interactifs (Chart.js)
- [ ] Filtres temporels
- [ ] Export données

### 🎯 Phase 2c - Avancé
- [ ] Dashboard personnalisable
- [ ] Alertes configurables
- [ ] Rapports automatisés
- [ ] Intégration BI
- [ ] API publique

---

**Version** : 2.0.0-mvp  
**Dernière mise à jour** : 2025-07-17  
**Responsable** : Tech Lead OneLog Africa  
**Status** : 🚧 En développement
