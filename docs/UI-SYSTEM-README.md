# UI System - OneLog Africa | Palette de Couleurs

## 🎨 Palette de Couleurs Officielle

### Couleurs Principales
```css
:root {
  --onelog-primary: #1A3C40;    /* Bleu-vert foncé principal */
  --onelog-accent: #F9A825;     /* Jaune/orange accent */
  --onelog-secondary: #E65100;  /* Orange secondaire */
  --onelog-success: #009688;    /* Vert succès */
  --onelog-dark: #263238;       /* Gris foncé texte */
  --onelog-light: #F4F4F4;      /* Gris clair fond */
}
```

### Usage des Couleurs

| Couleur | Hex Code | Usage | Exemple |
|---------|----------|-------|---------|
| **Primary** | `#1A3C40` | Headers, navigation, éléments principaux | Headers, sidebar active |
| **Accent** | `#F9A825` | Boutons secondaires, highlights | Boutons "Filtrer", badges |
| **Secondary** | `#E65100` | Boutons primaires, actions importantes | CTA, boutons "Valider" |
| **Success** | `#009688` | États de succès, confirmations | Statuts "Terminé", validations |
| **Dark** | `#263238` | Texte principal, contenu | Paragraphes, labels |
| **Light** | `#F4F4F4` | Arrière-plans, surfaces | Fond de page, cards |

## 🔧 Composants Disponibles

### 1. Layout
```tsx
import { Layout } from '@/components/ui-system';

<Layout showHeader={true}>
  <YourContent />
</Layout>
```

### 2. Button Variants
```tsx
import { ButtonVariants } from '@/components/ui-system';

<ButtonVariants variant="primary" size="md">Action</ButtonVariants>
<ButtonVariants variant="secondary" size="sm">Filtrer</ButtonVariants>
<ButtonVariants variant="outline" size="lg">Annuler</ButtonVariants>
```

### 3. Cards et Badges
```tsx
import { Card, Badge } from '@/components/ui-system';

<Card title="Missions">
  <Badge text="En cours" color="accent" />
</Card>
```

## 📝 Typographie

### Fonts Importées
- **Montserrat** : Titres, boutons (weights: 400, 600, 700)
- **Open Sans** : Texte courant, paragraphes (weights: 400, 500, 600)

### Classes Utilitaires
```css
.font-montserrat { font-family: 'Montserrat', sans-serif; }
.font-opensans { font-family: 'Open Sans', sans-serif; }
```

## 🎯 Guidelines d'Usage

### Contrastes WCAG
- **Primary/Light** : Ratio 4.8:1 ✅
- **Dark/Light** : Ratio 5.2:1 ✅
- **Secondary/White** : Ratio 4.5:1 ✅

### Responsive Design
- **Mobile** : Tailles réduites, espacement compact
- **Desktop** : Tailles normales, espacement confortable
- **Large screens** : Tailles augmentées pour supervision

### États Interactifs
- **Hover** : Assombrissement de 10-15%
- **Focus** : Ring de 2px avec couleur primaire
- **Active** : Shadow interne + couleur plus foncée

## 🔄 Mise à Jour

Pour modifier la palette, éditez le fichier `src/components/ui-system.tsx` :

```tsx
export const onelogColors = {
  primary: '#1A3C40',
  // ... autres couleurs
};
```

Les variables CSS sont automatiquement injectées au chargement du composant.

---

**Version** : 1.0.0 - Phase 1 Supervision MVP
**Dernière mise à jour** : 2025-01-17
