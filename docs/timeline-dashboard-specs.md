# Timeline Dashboard - Phase 3 Specifications

## 🎯 Objectif Phase 3
Développer un dashboard timeline interactif pour l'analyse chronologique des trajets, livraisons et événements de la flotte OneLog Africa, permettant aux superviseurs d'analyser les incidents passés et retards.

---

## 📋 Vue d'Ensemble

### 🎪 Contexte Utilisateur
**Persona** : Superviseur de flotte OneLog Africa  
**Use Case** : Analyser l'historique des trajets, identifier les patterns de retards, investiguer les incidents  
**Objectif** : Améliorer la performance opérationnelle via l'analyse temporelle

### 🏗️ Architecture Technique
```
Timeline Dashboard MVP
├── TimelineContainer (scroll optimisé)
├── EventItem (événement individuel)
├── DayDivider (séparateur journalier)
├── EventDetailModal (détails événement)
├── TimelineFilters (filtres temporels)
├── TimelineService (données mock)
└── useTimelineEvents (hook de données)
```

---

## 🧩 Composants MVP

### 1. TimelineContainer
**Responsabilité** : Container principal avec scroll optimisé et animations

#### Props Interface
```typescript
interface TimelineContainerProps {
  events: TimelineEvent[];
  loading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
  height?: number;
}
```

#### Fonctionnalités
- **Scroll optimisé** : Implémentation simple et performante sans virtualisation
- **Layout responsive** : Adaptation mobile/desktop
- **Groupement par jour** : Organisation automatique des événements
- **Animations fluides** : Transitions avec framer-motion
- **États de chargement** : Skeleton loading et état vide
- **Timeline visuelle** : Ligne de temps avec indicateurs

#### Structure
```tsx
<div className="timeline-container" data-testid="timeline-container">
  <div className="timeline-track">
    {virtualItems.map(virtualItem => (
      <div key={virtualItem.index}>
        {renderTimelineItem(events[virtualItem.index])}
      </div>
    ))}
  </div>
</div>
```

### 2. EventItem
**Responsabilité** : Affichage individuel d'un événement timeline

#### Props Interface
```typescript
interface EventItemProps {
  event: TimelineEvent;
  onClick?: (event: TimelineEvent) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showTime?: boolean;
  className?: string;
}
```

#### Variantes Événements
- **🚚 Départ** : Couleur primary, icône Truck
- **📍 Arrivée** : Couleur success, icône MapPin
- **⚠️ Incident** : Couleur warning, icône AlertTriangle
- **🔧 Maintenance** : Couleur error, icône Wrench
- **⏰ Retard** : Couleur accent, icône Clock

#### Structure
```tsx
<div className="event-item" data-testid="event-item">
  <div className="event-marker">
    <Icon className="event-icon" />
  </div>
  <div className="event-content">
    <div className="event-header">
      <h4 className="event-title">{event.title}</h4>
      <span className="event-time">{formatTime(event.timestamp)}</span>
    </div>
    <p className="event-description">{event.description}</p>
    <div className="event-metadata">
      <Badge variant={event.status}>{event.status}</Badge>
      <span className="event-vehicle">{event.vehicleId}</span>
    </div>
  </div>
</div>
```

### 3. DayDivider
**Responsabilité** : Séparateur visuel entre les jours

#### Props Interface
```typescript
interface DayDividerProps {
  date: Date;
  eventCount?: number;
  className?: string;
}
```

#### Structure
```tsx
<div className="day-divider" data-testid="day-divider">
  <div className="day-line"></div>
  <div className="day-content">
    <span className="day-date">{formatDate(date)}</span>
    {eventCount && (
      <span className="day-count">{eventCount} événements</span>
    )}
  </div>
  <div className="day-line"></div>
</div>
```

### 4. EventDetailModal
**Responsabilité** : Modal détaillé pour un événement

#### Props Interface
```typescript
interface EventDetailModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: TimelineEvent) => void;
}
```

#### Contenu Modal
- **Header** : Titre, timestamp, statut
- **Details** : Description complète, véhicule, conducteur
- **Location** : Coordonnées GPS, adresse
- **Actions** : Modifier, supprimer, exporter
- **Related** : Événements liés, historique

---

## 📊 Types et Interfaces

### TimelineEvent
```typescript
interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'departure' | 'arrival' | 'incident' | 'maintenance' | 'delay';
  title: string;
  description: string;
  vehicleId: string;
  driverId?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'completed' | 'in_progress' | 'cancelled' | 'delayed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  relatedEvents?: string[];
}
```

### TimelineFilters
```typescript
interface TimelineFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventTypes: TimelineEvent['type'][];
  vehicleIds: string[];
  statuses: TimelineEvent['status'][];
  severity?: TimelineEvent['severity'][];
}
```

---

## 🎨 Design System

### Palette Couleurs (OneLog Africa)
```css
/* Événements */
--event-departure: var(--primary-dark);     /* #1A3C40 */
--event-arrival: var(--secondary-teal);     /* #009688 */
--event-incident: var(--primary-yellow);    /* #F9A825 */
--event-maintenance: var(--accent-orange);  /* #E65100 */
--event-delay: var(--accent-orange);        /* #E65100 */

/* Timeline */
--timeline-track: var(--neutral-medium);    /* #B0BEC5 */
--timeline-marker: var(--primary-dark);     /* #1A3C40 */
--timeline-background: var(--neutral-light); /* #F4F4F4 */
```

### Dimensions
```css
/* Timeline */
--timeline-width: 4px;
--timeline-marker-size: 16px;
--timeline-gap: 24px;

/* Events */
--event-padding: 16px;
--event-border-radius: 8px;
--event-shadow: 0 2px 4px rgba(0,0,0,0.1);

/* Responsive */
--timeline-mobile-gap: 16px;
--timeline-desktop-gap: 32px;
```

---

## 🚀 Stack Technique

### Dépendances Principales
```json
{
  "framer-motion": "^10.16.0",
  "react-virtual": "^2.10.4",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "date-fns": "^2.30.0"
}
```

### Animations (Framer Motion)
```typescript
// Animations événements
const eventVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

// Animations timeline
const timelineVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

### Virtualisation (React Virtual)
```typescript
const virtualizer = useVirtualizer({
  count: events.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120, // Hauteur estimée événement
  overscan: 10 // Éléments pré-chargés
});
```

---

## 🧪 Tests et Validation

### Tests Unitaires (Vitest)
```typescript
// TimelineContainer.test.tsx
describe('TimelineContainer', () => {
  it('renders events with virtual scrolling');
  it('handles large datasets efficiently');
  it('supports keyboard navigation');
  it('maintains scroll position on updates');
});

// EventItem.test.tsx  
describe('EventItem', () => {
  it('displays event information correctly');
  it('handles different event types');
  it('shows appropriate icons and colors');
  it('triggers onClick callbacks');
});
```

### Tests E2E (Cypress)
```typescript
// timeline-dashboard.cy.ts
describe('Timeline Dashboard', () => {
  it('loads timeline with events');
  it('scrolls smoothly through large datasets');
  it('filters events by date range');
  it('opens event details modal');
  it('maintains performance with 1000+ events');
});
```

### Fixtures de Test
```json
// timeline-events.json
{
  "events": [
    {
      "id": "evt_001",
      "timestamp": "2025-07-17T08:00:00Z",
      "type": "departure",
      "title": "Départ Abidjan",
      "description": "Départ du véhicule CI-001 vers Bouaké",
      "vehicleId": "CI-001",
      "status": "completed"
    }
  ]
}
```

---

## 📈 Performance

### Critères de Performance
| Métrique | Cible | Mesure |
|----------|-------|--------|
| **Chargement initial** | < 1.5s | First Contentful Paint |
| **Scroll performance** | 60 FPS | Frame rate during scroll |
| **Memory usage** | < 100MB | Heap size with 1000+ events |
| **Bundle size** | < 200KB | Gzipped component bundle |

### Optimisations
- **Virtual scrolling** : Rendu uniquement des éléments visibles
- **Lazy loading** : Chargement progressif des données
- **Memoization** : React.memo sur composants statiques
- **Code splitting** : Import dynamique des composants

---

## 🔐 Sécurité et Accessibilité

### Accessibilité (WCAG 2.1)
- **Navigation clavier** : Tab, Arrow keys, Enter, Escape
- **Screen readers** : ARIA labels, roles, descriptions
- **Contraste** : Minimum 4.5:1 pour tous les textes
- **Focus management** : Indicateurs visuels clairs

### Sécurité
- **Input validation** : Sanitization des données événements
- **XSS protection** : Échappement des contenus dynamiques
- **CSRF protection** : Tokens pour actions de modification

---

## 🎯 User Stories

### Story 1 : Consultation Timeline
```
En tant que superviseur,
Je veux voir la timeline des événements de ma flotte,
Afin d'analyser l'activité quotidienne.

Critères d'acceptation :
- Affichage chronologique des événements
- Scroll fluide sur gros volumes
- Filtrage par date et type
- Responsive mobile/desktop
```

### Story 2 : Analyse Incidents
```
En tant que superviseur,
Je veux identifier les patterns d'incidents,
Afin d'améliorer la sécurité de ma flotte.

Critères d'acceptation :
- Filtrage par type d'incident
- Visualisation des détails complets
- Liens entre événements liés
- Export des données d'analyse
```

---

## 🚀 Roadmap Phase 3

### Phase 3a - MVP (Semaine 1)
- [x] Structure composants de base
- [ ] TimelineContainer avec scroll virtuel
- [ ] EventItem avec variantes
- [ ] DayDivider et séparateurs
- [ ] Mock data service
- [ ] Tests unitaires de base

### Phase 3b - Interactions (Semaine 2)
- [ ] EventDetailModal
- [ ] TimelineFilters
- [ ] Navigation clavier
- [ ] Animations framer-motion
- [ ] Tests E2E complets

### Phase 3c - Optimisations (Semaine 3)
- [ ] Performance avec gros volumes
- [ ] Graphiques Chart.js intégrés
- [ ] Export fonctionnalités
- [ ] Documentation complète

---

## 📋 Checklist Développement

### Setup Initial
- [ ] Branche feat/timeline-dashboard créée
- [ ] Dépendances installées (framer-motion, react-virtual, chart.js)
- [ ] Structure dossiers `/src/components/timeline/`
- [ ] Types TypeScript définis

### Composants MVP
- [ ] TimelineContainer implémenté
- [ ] EventItem avec variantes
- [ ] DayDivider fonctionnel
- [ ] EventDetailModal basique
- [ ] Service mock data

### Tests et Qualité
- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E (Cypress)
- [ ] Performance validée
- [ ] Accessibilité WCAG 2.1
- [ ] Documentation technique

### Intégration
- [ ] UI System OneLog Africa
- [ ] Page timeline intégrée
- [ ] Navigation depuis dashboard
- [ ] Responsive design
- [ ] Error handling

---

## ✅ Statut d'Implémentation

### Composants Livrés
- ✅ **TimelineContainer** : Container principal avec scroll optimisé et animations
- ✅ **EventItem** : Affichage des événements avec icônes et statuts
- ✅ **DayDivider** : Séparateurs journaliers avec compteurs
- ✅ **EventDetailModal** : Modal de détails avec actions
- ✅ **TimelineFilters** : Panneau de filtres complet
- ✅ **TimelineService** : Service de données mock
- ✅ **useTimelineEvents** : Hook de gestion des données
- ✅ **Timeline Page** : Page d'intégration complète

### Corrections Techniques Appliquées
- ✅ **Dépendances** : Suppression de react-virtual (conflit React 18)
- ✅ **Badge Component** : Correction usage props text/color
- ✅ **Imports** : Résolution problèmes de modules
- ✅ **UI System** : Intégration palette OneLog Africa
- ✅ **TypeScript** : Types complets et cohérents

### Stack Technique Finale
- **Animations** : framer-motion ✅
- **Dates** : date-fns avec locale française ✅
- **Icons** : lucide-react ✅
- **Charts** : chart.js + react-chartjs-2 ✅
- **Scroll** : Implémentation native optimisée ✅

**Status** : ✅ **MVP Timeline Dashboard Implémenté**  
**Prochaine Action** : Tests unitaires et E2E  
**Timeline** : Phase 3 MVP complétée
