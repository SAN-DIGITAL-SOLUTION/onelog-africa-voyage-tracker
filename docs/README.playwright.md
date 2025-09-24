# Guide des tests E2E avec Playwright

## 📋 Configuration requise

- Node.js 18+ et npm 9+
- Navigateurs : Chromium, Firefox, WebKit (installés automatiquement)
- Accès à l'application en environnement de développement

## 🚀 Installation

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Installer les navigateurs Playwright :
   ```bash
   npx playwright install
   ```

3. Créer le dossier pour les résultats de test :
   ```bash
   mkdir -p test-results/{screenshots,videos,html}
   ```

## 🧪 Exécution des tests

### Tous les tests
```bash
npx playwright test
```

### Tests en mode UI (avec interface graphique)
```bash
npx playwright test --ui
```

### Tests sur un navigateur spécifique
```bash
# Pour Chrome
npx playwright test --project=chromium

# Pour Firefox
npx playwright test --project=firefox

# Pour WebKit (Safari)
npx playwright test --project=webkit
```

### Mode debug avec ralenti (50% de la vitesse)
```bash
PWDEBUG=1 npx playwright test --slowmo=500
```

### Relancer les tests échoués
```bash
npx playwright test --retries=2
```

## 🔍 Structure des tests

```
e2e/
  ├── timeline-optimized.spec.ts  # Tests de la timeline
  └── auth.spec.ts               # Tests d'authentification
test-results/                   # Généré automatiquement
  ├── screenshots/              # Captures d'écran des tests
  ├── videos/                   # Enregistrements vidéo
  ├── html/                     # Dumps HTML en cas d'échec
  └── test-results.xml          # Rapports au format JUnit
```

## 🎯 Stratégie de test

### Sélecteurs

Utilisez des attributs `data-testid` pour cibler les éléments du DOM de manière fiable :

```tsx
// Dans votre composant
<div data-testid="timeline-container">
  <Event data-testid={`event-item-${event.id}`} />
</div>

// Dans vos tests
const container = page.locator('[data-testid="timeline-container"]');
const firstEvent = page.locator('[data-testid^="event-item-"]').first();
```

### Gestion des attentes

- Utilisez `expect` pour les assertions
- Les timeouts sont configurés dans `playwright.config.ts`
- Utilisez `waitForSelector` pour attendre des éléments spécifiques

### Gestion des erreurs

Les erreurs sont automatiquement capturées et enregistrées dans :
- La console
- Les captures d'écran (`test-results/screenshots/`)
- Les journaux réseau
- Les vidéos des tests échoués (`test-results/videos/`)

## 🛠️ Dépannage

### Problèmes courants

1. **Éléments non trouvés**
   - Vérifiez que l'élément est rendu (attendre le chargement avec `waitForSelector`)
   - Utilisez `page.screenshot()` pour voir l'état de la page
   - Vérifiez les sélecteurs avec l'inspecteur Playwright :
     ```bash
     npx playwright test --debug
     ```

2. **Timeouts**
   - Augmentez les timeouts dans `playwright.config.ts`
   - Vérifiez les performances de l'application
   - Utilisez `waitForLoadState('networkidle')` pour attendre le chargement complet

3. **Problèmes d'authentification**
   - Vérifiez que le serveur de développement est en cours d'exécution
   - Vérifiez les identifiants de test dans `e2e/timeline-optimized.spec.ts`
   - Désactivez temporairement les extensions de navigateur qui pourraient interférer

## 🔄 Intégration continue

Exemple de configuration pour GitHub Actions (`.github/workflows/e2e.yml`) :

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
```

## 🏆 Bonnes pratiques

1. **Tests indépendants**
   - Chaque test doit pouvoir s'exécuter seul
   - Utilisez `test.describe.configure({ mode: 'serial' })` pour les tests dépendants

2. **Données de test**
   - Utilisez des données de test isolées
   - Réinitialisez l'état entre les tests

3. **Nettoyage**
   - Supprimez les données de test après utilisation
   - Utilisez `test.afterEach` pour le nettoyage

4. **Documentation**
   - Commentez les tests complexes
   - Documentez les cas limites et les hypothèses

5. **Maintenabilité**
   - Réutilisez le code avec des fonctions utilitaires
   - Gardez les tests simples et lisibles
   - Utilisez des sélecteurs fiables (`data-testid`)

## 📊 Couverture des tests

Les tests couvrent actuellement les fonctionnalités suivantes :

- [x] Chargement initial de la timeline
- [x] Filtrage des événements
- [x] Défilement et chargement infini
- [x] Interaction avec les événements
- [x] Gestion des erreurs
- [x] Affichage responsive

## 📝 Notes de version

### 1.0.0 - 2025-07-21
- Version initiale des tests E2E
- Configuration optimisée pour la stabilité
- Documentation complète

## 📄 Licence

© 2025 OneLog Africa - Tous droits réservés
