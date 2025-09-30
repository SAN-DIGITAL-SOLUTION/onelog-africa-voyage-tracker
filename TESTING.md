# 🧪 Guide de Tests - OneLog Africa

## État des Tests après Corrections

### ✅ **Build & Compilation**
```bash
npm run build
```
**Status:** ✅ **RÉUSSI** - Le projet compile sans erreur

### ⚠️ **Tests Unitaires (Vitest)**
```bash
npm run test:unit
```
**Status:** ⚠️ **NÉCESSITE RÉINSTALLATION**

**Problème identifié:** Dépendances vitest corrompues
**Solution:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run test:unit
```

### ⚠️ **Tests E2E (Playwright)**
```bash
npm run test:e2e
```
**Status:** ⚠️ **NAVIGATEURS MANQUANTS**

**Problème identifié:** Navigateurs Playwright non installés (problème réseau)
**Solution:**
```bash
# Installer les navigateurs (nécessite connexion internet stable)
npx playwright install
# Ou installer seulement Chromium
npx playwright install chromium
```

## Configuration des Variables d'Environnement

### Tests E2E avec Secrets
Les tests E2E nécessitent des variables d'environnement pour Supabase et Mapbox.

Créer un fichier `.env.test` :
```bash
# Supabase (requis pour tests)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Mapbox (requis pour tests de carte)
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Base URL pour tests
TEST_BASE_URL=http://localhost:5173
```

### Mock des Services Externes
Pour les tests sans secrets, utiliser les mocks :
```bash
# Exécuter avec mocks
MOCK_EXTERNAL_SERVICES=true npm run test:e2e
```

## Scripts de Test Disponibles

| Script | Description | Status |
|--------|-------------|--------|
| `npm run build` | Compilation TypeScript + Vite | ✅ |
| `npm run test:unit` | Tests unitaires Vitest | ⚠️ |
| `npm run test:e2e` | Tests E2E Playwright | ⚠️ |
| `npm run push:force` | Push sans hooks pré-push | ✅ |

## Hook Pré-Push

Le hook pré-push a été configuré pour exécuter **uniquement les tests unitaires** :
```bash
# Exécution automatique lors du push
git push origin infra/mcp-ci-cd

# Tests E2E optionnels avec variable d'environnement
RUN_E2E=true git push origin infra/mcp-ci-cd

# Bypass complet des hooks
npm run push:force
```

## Corrections Appliquées

### ✅ **Alias & Configuration**
- ✅ `vite.config.ts` : Alias `@` corrigé
- ✅ `tsconfig.app.json` : Paths configurés correctement
- ✅ Exports UI : `Button` et `Badge` index.ts corrects

### ✅ **Supabase Queries**
- ✅ Suppression de `head: true` dans les requêtes count
- ✅ Fichiers corrigés :
  - `src/modules/adminDashboard/services/adminService.ts`
  - `src/modules/adminDashboard/analytics/analyticsService.ts`
  - `src/pages/mission-detail/MissionFeedback.tsx`
  - `src/services/notificationService.ts`

### ✅ **Playwright Configuration**
- ✅ Version unifiée : `@playwright/test@1.55.0`
- ✅ Suppression de `pnpm-lock.yaml` (conflit avec npm)
- ⚠️ Installation navigateurs requise

### ✅ **Hooks & Scripts**
- ✅ Script `test:unit` ajouté
- ✅ Script `test:e2e` configuré pour Playwright
- ✅ Hook pré-push créé (`.husky/pre-push`)

## Prochaines Étapes

1. **Réinstaller les dépendances** pour corriger vitest
2. **Installer les navigateurs Playwright** avec connexion stable
3. **Configurer les variables d'environnement** pour les tests E2E
4. **Exécuter la suite complète de tests**

## Commandes de Diagnostic

```bash
# Vérifier les versions
npm ls vitest
npm ls @playwright/test

# Vérifier la configuration
npm run build
npx tsc --noEmit

# Tester les alias
node -e "console.log(require('path').resolve(__dirname, 'src'))"
```
