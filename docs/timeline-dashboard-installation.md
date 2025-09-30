# Timeline Dashboard - Guide d'Installation et Configuration

## 🎯 Prérequis Système

### Environnement de Développement
- **Node.js** : Version 18.x ou supérieure
- **npm** : Version 9.x ou supérieure
- **Git** : Version 2.x ou supérieure
- **TypeScript** : Version 5.x (inclus dans le projet)

### Navigateurs Supportés
- **Chrome** : Version 90+
- **Firefox** : Version 88+
- **Safari** : Version 14+
- **Edge** : Version 90+

---

## 📦 Installation des Dépendances

### Dépendances Principales
```bash
# Animations et interactions
npm install framer-motion@^10.16.0

# Gestion des dates
npm install date-fns@^2.30.0

# Icônes
npm install lucide-react@^0.263.1

# Graphiques (optionnel pour futures versions)
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0
```

### Dépendances de Développement
```bash
# Tests unitaires
npm install --save-dev vitest@^0.34.0
npm install --save-dev @testing-library/react@^13.4.0
npm install --save-dev @testing-library/jest-dom@^5.16.5

# Tests E2E
npm install --save-dev cypress@^12.17.0
npm install --save-dev @cypress/react@^7.0.0
```

### Vérification de l'Installation
```bash
# Vérifier les versions
node --version    # v18.x.x
npm --version     # 9.x.x
git --version     # 2.x.x

# Vérifier les dépendances du projet
npm list framer-motion date-fns lucide-react
```

---

## 🏗️ Structure du Projet

### Arborescence Timeline Dashboard
```
src/
├── components/timeline/
│   ├── TimelineContainer.tsx     # Container principal
│   ├── EventItem.tsx            # Événement individuel
│   ├── DayDivider.tsx           # Séparateur journalier
│   ├── EventDetailModal.tsx     # Modal de détails
│   ├── TimelineFilters.tsx      # Panneau de filtres
│   ├── types.ts                 # Types TypeScript
│   └── index.ts                 # Exports publics
├── services/
│   └── TimelineService.ts       # Service de données
├── hooks/
│   └── useTimelineEvents.ts     # Hook de gestion
├── pages/timeline/
│   └── index.tsx                # Page principale
└── types/
    └── timeline.ts              # Types globaux
```

### Fichiers de Configuration
```
docs/
├── timeline-dashboard-specs.md          # Spécifications techniques
├── timeline-dashboard-user-guide.md     # Guide utilisateur
└── timeline-dashboard-installation.md   # Ce guide

__tests__/
├── components/timeline/
│   ├── TimelineContainer.test.tsx
│   ├── EventItem.test.tsx
│   └── ...
└── services/
    └── TimelineService.test.ts
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement
Créez un fichier `.env.local` :
```env
# Timeline Dashboard Configuration
REACT_APP_TIMELINE_PAGE_SIZE=50
REACT_APP_TIMELINE_MAX_EVENTS=1000
REACT_APP_TIMELINE_ANIMATION_DURATION=300
REACT_APP_TIMELINE_SCROLL_THRESHOLD=100

# Locale Configuration
REACT_APP_DEFAULT_LOCALE=fr
REACT_APP_DATE_FORMAT=dd/MM/yyyy
REACT_APP_TIME_FORMAT=HH:mm

# Performance Configuration
REACT_APP_TIMELINE_DEBOUNCE_MS=300
REACT_APP_TIMELINE_CACHE_TTL=300000
```

### 2. Configuration TypeScript
Ajoutez dans `tsconfig.json` :
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/services/*": ["services/*"],
      "@/hooks/*": ["hooks/*"],
      "@/types/*": ["types/*"]
    }
  }
}
```

### 3. Configuration Tailwind CSS
Ajoutez dans `tailwind.config.js` :
```javascript
module.exports = {
  content: [
    "./src/components/timeline/**/*.{js,ts,jsx,tsx}",
    "./src/pages/timeline/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Couleurs OneLog Africa (déjà configurées)
      colors: {
        'timeline-track': '#B0BEC5',
        'timeline-marker': '#1A3C40',
        'event-departure': '#1A3C40',
        'event-arrival': '#009688',
        'event-incident': '#E65100',
        'event-maintenance': '#7B1FA2',
        'event-delay': '#D32F2F',
      },
      // Animations Timeline
      animation: {
        'timeline-fade-in': 'fadeIn 0.3s ease-in-out',
        'timeline-slide-in': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
}
```

---

## 🚀 Déploiement

### 1. Build de Production
```bash
# Build optimisé
npm run build

# Vérifier la taille du bundle
npm run analyze

# Test du build local
npm run preview
```

### 2. Variables de Production
```env
# Production Environment
NODE_ENV=production
REACT_APP_API_URL=https://api.onelog-africa.com
REACT_APP_TIMELINE_CACHE_TTL=600000
REACT_APP_TIMELINE_MAX_EVENTS=5000
```

### 3. Optimisations Performance
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'timeline-vendor': ['framer-motion', 'date-fns'],
          'timeline-components': [
            './src/components/timeline/TimelineContainer',
            './src/components/timeline/EventItem',
            './src/components/timeline/DayDivider',
          ],
        },
      },
    },
  },
})
```

---

## 🧪 Configuration des Tests

### Tests Unitaires (Vitest)
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/components/timeline/**/*.test.{ts,tsx}',
      'src/services/**/*.test.{ts,tsx}',
      'src/hooks/**/*.test.{ts,tsx}',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/components/timeline/**/*'],
      exclude: ['**/*.test.*', '**/*.stories.*'],
    },
  },
})
```

### Tests E2E (Cypress)
```javascript
// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/timeline/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/components/timeline/**/*.cy.{js,jsx,ts,tsx}',
  },
})
```

---

## 🔧 Scripts de Développement

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "e2e": "cypress run --spec 'cypress/e2e/timeline/**/*'",
    
    "lint": "eslint src/components/timeline --ext .ts,.tsx",
    "lint:fix": "eslint src/components/timeline --ext .ts,.tsx --fix",
    
    "type-check": "tsc --noEmit",
    "timeline:dev": "npm run dev -- --open /timeline"
  }
}
```

### Scripts Utilitaires
```bash
# Développement Timeline uniquement
npm run timeline:dev

# Tests Timeline complets
npm run test -- src/components/timeline
npm run e2e -- --spec "**/timeline/**/*"

# Vérification qualité
npm run lint && npm run type-check && npm run test:coverage
```

---

## 📊 Monitoring et Performance

### Métriques à Surveiller
```javascript
// Performance monitoring
const timelineMetrics = {
  // Temps de chargement initial
  initialLoadTime: performance.now(),
  
  // Nombre d'événements affichés
  eventsCount: events.length,
  
  // Temps de filtrage
  filteringTime: 0,
  
  // Utilisation mémoire
  memoryUsage: performance.memory?.usedJSHeapSize,
}

// Seuils d'alerte
const PERFORMANCE_THRESHOLDS = {
  INITIAL_LOAD_MAX: 2000,      // 2 secondes
  FILTERING_MAX: 500,          // 500ms
  MEMORY_MAX: 100 * 1024 * 1024, // 100MB
}
```

### Logging et Debug
```javascript
// Debug mode
const DEBUG_TIMELINE = process.env.NODE_ENV === 'development'

if (DEBUG_TIMELINE) {
  console.log('Timeline Debug:', {
    eventsLoaded: events.length,
    filtersActive: activeFilters,
    renderTime: performance.now() - startTime,
  })
}
```

---

## 🔒 Sécurité

### Validation des Données
```typescript
// Validation des événements
const validateTimelineEvent = (event: any): TimelineEvent => {
  if (!event.id || !event.timestamp || !event.type) {
    throw new Error('Invalid timeline event structure')
  }
  
  return {
    id: String(event.id),
    timestamp: new Date(event.timestamp),
    type: event.type as EventType,
    // ... autres validations
  }
}
```

### Sanitisation
```typescript
// Sanitisation des entrées utilisateur
import DOMPurify from 'dompurify'

const sanitizeEventDescription = (description: string): string => {
  return DOMPurify.sanitize(description, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  })
}
```

---

## 🆘 Dépannage

### Problèmes Courants

#### 1. Erreurs de Build
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install

# Vérifier les conflits de versions
npm ls framer-motion date-fns
```

#### 2. Problèmes de Performance
```javascript
// Profiling React
import { Profiler } from 'react'

<Profiler id="Timeline" onRender={onRenderCallback}>
  <TimelineContainer />
</Profiler>
```

#### 3. Erreurs TypeScript
```bash
# Vérification complète
npx tsc --noEmit --skipLibCheck

# Régénérer les types
rm -rf node_modules/@types
npm install
```

---

## 📚 Ressources Supplémentaires

### Documentation Technique
- **Framer Motion** : https://www.framer.com/motion/
- **Date-fns** : https://date-fns.org/
- **Lucide React** : https://lucide.dev/
- **Vitest** : https://vitest.dev/
- **Cypress** : https://cypress.io/

### Outils de Développement
- **React DevTools** : Extension navigateur
- **Vite DevTools** : Plugin Vite
- **Timeline Profiler** : Chrome DevTools

---

## 🔄 Maintenance

### Mises à Jour Régulières
```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour les dépendances mineures
npm update

# Mettre à jour les dépendances majeures (avec précaution)
npm install framer-motion@latest
```

### Nettoyage Périodique
```bash
# Nettoyer les fichiers temporaires
npm run clean

# Analyser la taille du bundle
npm run analyze

# Audit de sécurité
npm audit
```

---

*Guide d'installation mis à jour le : 17 Juillet 2025*  
*Version : Phase 3 MVP*  
*Équipe Technique OneLog Africa*
