import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Configuration Playwright pour les tests E2E
 * Documentation : https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Dossier contenant les tests E2E
  testDir: './e2e',
  
  // Exécution en parallèle des tests
  fullyParallel: true,
  
  // Échec si des tests sont marqués .only et non en CI
  forbidOnly: !!process.env.CI,
  
  // Nombre de tentatives de réessai en cas d'échec
  retries: process.env.CI ? 2 : 1,
  
  // Nombre de workers (1 en CI pour plus de stabilité)
  workers: process.env.CI ? 1 : undefined,
  
  // Timeout global pour chaque test (30 secondes)
  timeout: 30000,
  
  // Timeout pour les assertions (10 secondes)
  expect: {
    timeout: 10000,
  },
  
  // Rapports
  reporter: [
    ['html', { open: 'never' }], // Génère un rapport HTML
    ['list'], // Affiche les résultats dans la console
  ],
  
  // Configuration partagée pour tous les projets
  use: {
    // URL de base pour les tests
    baseURL: 'http://localhost:5174',
    
    // Capture des traces pour le débogage
    trace: 'on-first-retry', // Capture la trace au premier échec
    
    // Capture des captures d'écran
    screenshot: 'on', // Prend une capture d'écran après chaque test
    
    // Vidéo des tests
    video: 'on-first-retry', // Enregistre une vidéo au premier échec
    
    // Options de navigation
    navigationTimeout: 30000, // 30 secondes de timeout pour la navigation
    actionTimeout: 10000, // 10 secondes de timeout pour les actions
  },
  
  // Configuration des navigateurs à tester
  projects: [
    // Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Firefox (désactivé par défaut pour accélérer les tests)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // WebKit (désactivé par défaut pour accélérer les tests)
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Configuration du serveur de développement
  webServer: {
    command: 'npx vite --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes de timeout pour le démarrage du serveur
    stderr: 'pipe',
    stdout: 'pipe',
  },
  
  // Configuration des rapports
  outputDir: 'test-results',
  
  // Configuration des timeouts globaux
  globalTimeout: 60 * 60 * 1000, // 60 minutes de timeout global
});
