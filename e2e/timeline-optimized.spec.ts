import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Configuration des timeouts (en millisecondes)
const TIMEOUT = {
  SHORT: 5000,
  MEDIUM: 15000,
  LONG: 30000,
  VERY_LONG: 60000
};

// Fonction utilitaire pour se connecter avec gestion améliorée des erreurs
async function login(page: Page, testInfo: any) {
  try {
    // Aller à la page de connexion avec un timeout plus long
    await page.goto('/auth', { waitUntil: 'domcontentloaded', timeout: TIMEOUT.VERY_LONG });
    
    // Capturer l'état initial de la page
    await page.screenshot({ path: `test-results/screenshots/${testInfo.testId}-login-page.png`, fullPage: true });
    
    // Attendre que le formulaire soit visible avec une attente plus robuste
    const emailSelector = '#email';
    await page.waitForSelector(emailSelector, { 
      state: 'visible', 
      timeout: TIMEOUT.LONG 
    });
    
    // Remplir le formulaire de connexion avec des identifiants valides
    await page.fill(emailSelector, 'test@example.com');
    await page.fill('#password', 'password123');
    
    // Capturer l'état après remplissage du formulaire
    await page.screenshot({ path: `test-results/screenshots/${testInfo.testId}-login-filled.png` });
    
    // Cliquer sur le bouton de connexion avec vérification d'état
    const submitButton = page.getByRole('button', { name: /se connecter|connexion/i });
    await expect(submitButton).toBeEnabled({ timeout: TIMEOUT.SHORT });
    
    // Déclencher la soumission
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: TIMEOUT.LONG }),
      submitButton.click()
    ]);
    
    // Attendre la redirection après connexion
    await page.waitForURL('**/dashboard', { timeout: TIMEOUT.VERY_LONG });
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle', { timeout: TIMEOUT.LONG });
    
    // Capturer l'état après connexion réussie
    await page.screenshot({ path: `test-results/screenshots/${testInfo.testId}-logged-in.png`, fullPage: true });
    
  } catch (error) {
    // Capturer l'état en cas d'erreur
    await page.screenshot({ path: `test-results/screenshots/${testInfo.testId}-login-error.png`, fullPage: true });
    console.error('Erreur lors de la connexion:', error);
    throw error; // Relancer l'erreur pour échouer le test
  }
}

// Configuration des tests
test.describe.configure({ mode: 'serial' }); // Exécuter les tests en série pour plus de fiabilité

test.describe('Timeline Optimisée', () => {
  // Configuration du contexte de test
  let context: BrowserContext;
  
  // Configuration avant tous les tests
  test.beforeAll(async ({ browser }) => {
    // Créer un nouveau contexte avec des options personnalisées
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 }
      },
      // Désactiver le cache pour éviter les problèmes de mise en cache
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      // Activer les logs réseau pour le débogage
      serviceWorkers: 'block',
      // Intercepter les requêtes réseau pour le débogage
      _httpCredentials: undefined
    });
    
    // Activer les logs de la console
    context.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
    
    // Intercepter les erreurs réseau
    context.on('pageerror', error => console.error(`[PAGE ERROR] ${error.message}`));
    
    // Intercepter les requêtes échouées
    context.on('requestfailed', request => 
      console.error(`[REQUEST FAILED] ${request.failure()?.errorText} ${request.url()}`)
    );
  });
  
  // Nettoyage après tous les tests
  test.afterAll(async () => {
    await context.close();
  });
  
  // Données de test
  const testEvent = {
    title: 'Test Event ' + faker.string.alphanumeric(5),
    type: 'alert', // À adapter selon les types disponibles
    status: 'pending' // À adapter selon les statuts disponibles
  };

  test.beforeEach(async ({ page }, testInfo) => {
    // Ajouter un identifiant unique au test pour les captures d'écran
    testInfo.testId = testInfo.title.replace(/\s+/g, '-').toLowerCase();
    
    try {
      // Activer la journalisation réseau
      await page.route('**/*', route => {
        console.log(`[NETWORK] ${route.request().method()} ${route.request().url()}`);
        route.continue();
      });
      
      // Se connecter avec gestion d'erreur améliorée
      await login(page, testInfo);
      
      // Aller à la page de la timeline optimisée avec vérification de chargement
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: TIMEOUT.VERY_LONG }),
        page.goto('/timeline-optimized')
      ]);
      
      // Attendre que le conteneur de la timeline soit chargé avec une attente plus robuste
      const timelineContainer = page.locator('[data-testid="timeline-container"]');
      await expect(timelineContainer).toBeVisible({ timeout: TIMEOUT.LONG });
      
      // Attendre que les événements soient chargés
      await page.waitForSelector('[data-testid^="event-item-"]', { 
        state: 'attached', 
        timeout: TIMEOUT.LONG 
      });
      
      // Capturer l'état de la page après chargement
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.testId}-page-loaded.png`,
        fullPage: true 
      });
      
    } catch (error) {
      // Capturer l'état en cas d'erreur
      await page.screenshot({ 
        path: `test-results/screenshots/${testInfo.testId}-error.png`,
        fullPage: true 
      });
      console.error('Erreur pendant le beforeEach:', error);
      throw error; // Relancer l'erreur pour échouer le test
    }
  });

  test('Chargement initial de la page', async ({ page }, testInfo) => {
    // Vérifier que la page est chargée
    await expect(page).toHaveTitle(/Timeline/);
    
    // Vérifier que le conteneur principal est présent et visible
    const timelineContainer = page.locator('[data-testid="timeline-container"]');
    await expect(timelineContainer).toBeVisible({ timeout: TIMEOUT.LONG });
    
    // Attendre que les événements soient chargés
    await page.waitForSelector('[data-testid^="event-item-"]', { 
      state: 'attached', 
      timeout: TIMEOUT.LONG 
    });
    
    // Vérifier qu'il y a des événements
    const events = page.locator('[data-testid^="event-item-"]');
    const eventsCount = await events.count();
    expect(eventsCount).toBeGreaterThan(0);
    
    // Vérifier que le premier événement est visible
    await expect(events.first()).toBeVisible({ timeout: TIMEOUT.LONG });
    
    // Vérifier que le compteur d'événements est présent
    const eventCounter = page.locator('[data-testid="event-count"]');
    await expect(eventCounter).toBeVisible();
  });

  test('Filtrage des événements', async ({ page }, testInfo) => {
    // Tester le filtre de recherche
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill(testEvent.title);
    await page.keyboard.press('Enter');
    
    // Vérifier que les résultats sont filtrés
    const filteredEvents = page.locator('[data-testid^="event-item-"]');
    await expect(filteredEvents).toHaveCount(1);
    
    // Réinitialiser les filtres
    const resetButton = page.locator('[data-testid="reset-filters"]');
    await resetButton.click();
    
    // Vérifier que tous les événements sont à nouveau visibles
    const allEvents = page.locator('[data-testid^="event-item-"]');
    await expect(allEvents).toHaveCount(10); // Ajuster selon le nombre attendu
  });

  test('Défilement et chargement infini', async ({ page }, testInfo) => {
    // Faire défiler vers le bas
    const eventList = page.locator('[data-testid="event-list"]');
    await eventList.evaluate(e => e.scrollTo(0, e.scrollHeight));
    
    // Attendre le chargement des nouveaux éléments
    await page.waitForLoadState('networkidle');
    
    // Vérifier que plus d'événements sont chargés
    const initialEvents = await page.locator('[data-testid^="event-item-"]').count();
    expect(initialEvents).toBeGreaterThan(10);
  });

  test('Interaction avec un événement', async ({ page }, testInfo) => {
    // Cliquer sur le premier événement
    const firstEvent = page.locator('[data-testid^="event-item-"]').first();
    await firstEvent.click();
    
    // Vérifier que la modale s'ouvre
    const modal = page.locator('[data-testid="event-modal"]');
    await expect(modal).toBeVisible();
    
    // Vérifier que le contenu de la modale est correct
    const modalTitle = modal.locator('[data-testid="modal-title"]');
    await expect(modalTitle).toBeVisible();
    
    // Fermer la modale
    const closeButton = modal.locator('[data-testid="close-modal"]');
    await closeButton.click();
    
    // Vérifier que la modale est fermée
    await expect(modal).not.toBeVisible();
  });

  test('Gestion des erreurs', async ({ page }, testInfo) => {
    // Simuler une erreur de chargement
    await page.route('**/api/events*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erreur serveur' })
      });
    });
    
    // Rafraîchir la page pour déclencher l'erreur
    await page.reload();
    
    // Vérifier que le message d'erreur s'affiche
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    
    // Vérifier que le bouton de réessai fonctionne
    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
    
    // Réactiver les requêtes normales
    await page.unroute('**/api/events*');
    
    // Cliquer sur le bouton de réessai
    await retryButton.click();
    
    // Vérifier que les événements sont chargés
    const events = page.locator('[data-testid^="event-item-"]');
    await expect(events.first()).toBeVisible({ timeout: 10000 });
  });

  test('Responsive design', async ({ page }, testInfo) => {
    // Tester la vue mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Vérifier que les éléments s'affichent correctement
    const menuButton = page.locator('[data-testid="mobile-menu"]');
    await expect(menuButton).toBeVisible();
    
    // Vérifier que les filtres sont accessibles
    const filterButton = page.locator('[data-testid="mobile-filters"]');
    await filterButton.click();
    
    const filterPanel = page.locator('[data-testid="filter-panel"]');
    await expect(filterPanel).toBeVisible();
  });
});
