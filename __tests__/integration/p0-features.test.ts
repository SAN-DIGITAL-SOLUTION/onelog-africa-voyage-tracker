// Tests d'intégration pour les fonctionnalités P0 critiques OneLog Africa
// Validation complète des features stratégiques avant production

import { test, expect } from '@playwright/test';

// Configuration des tests
const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
  timeout: 30000,
  users: {
    admin: { email: 'admin@test.com', password: 'TestAdmin123!' },
    exploiteur: { email: 'exploiteur@test.com', password: 'TestExploiteur123!' },
    chauffeur: { email: 'chauffeur@test.com', password: 'TestChauffeur123!' },
    client: { email: 'client@test.com', password: 'TestClient123!' }
  }
};

test.describe('P0 Features Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.baseURL);
  });

  test.describe('1. Facturation Multi-Acteurs', () => {
    
    test('should create billing cycle for MEDLOG partner', async ({ page }) => {
      // Connexion admin
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigation vers facturation
      await page.click('[data-testid="billing-menu"]');
      await page.click('[data-testid="billing-cycles"]');
      
      // Créer nouveau cycle MEDLOG
      await page.click('[data-testid="create-cycle-button"]');
      await page.selectOption('[data-testid="partner-select"]', 'MEDLOG');
      await page.selectOption('[data-testid="cycle-type"]', 'monthly');
      await page.fill('[data-testid="cycle-name"]', 'Test MEDLOG Cycle');
      
      await page.click('[data-testid="save-cycle"]');
      
      // Vérifier la création
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Test MEDLOG Cycle')).toBeVisible();
    });

    test('should generate grouped invoice for multiple missions', async ({ page }) => {
      // Connexion et navigation
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.admin.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="billing-menu"]');
      await page.click('[data-testid="invoices"]');
      
      // Générer facture groupée
      await page.click('[data-testid="generate-grouped-invoice"]');
      await page.selectOption('[data-testid="partner-select"]', 'MAERSK');
      
      // Sélectionner missions
      await page.check('[data-testid="mission-1"]');
      await page.check('[data-testid="mission-2"]');
      
      await page.click('[data-testid="generate-invoice"]');
      
      // Vérifier génération PDF
      await expect(page.locator('[data-testid="pdf-generated"]')).toBeVisible();
      
      // Vérifier audit trail
      const auditLog = await page.locator('[data-testid="audit-log"]').first();
      await expect(auditLog).toContainText('EXPORT');
      await expect(auditLog).toContainText('grouped_invoice');
    });

  });

  test.describe('2. Notifications Maîtrisées', () => {
    
    test('should configure notification rules in manual mode', async ({ page }) => {
      // Connexion exploiteur
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      // Navigation vers notifications
      await page.click('[data-testid="notifications-menu"]');
      await page.click('[data-testid="notification-control"]');
      
      // Configurer mode manuel
      await page.click('[data-testid="mode-manual"]');
      await page.uncheck('[data-testid="auto-mission-created"]');
      await page.check('[data-testid="manual-mission-completed"]');
      
      // Configurer canaux
      await page.check('[data-testid="channel-email"]');
      await page.uncheck('[data-testid="channel-sms"]');
      
      await page.click('[data-testid="save-rules"]');
      
      // Vérifier sauvegarde
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="mode-manual"]')).toBeChecked();
    });

    test('should send test notification and verify delivery', async ({ page }) => {
      // Connexion et configuration
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="notifications-menu"]');
      await page.click('[data-testid="notification-control"]');
      
      // Envoyer notification test
      await page.fill('[data-testid="test-message"]', 'Test notification P0');
      await page.selectOption('[data-testid="test-channel"]', 'email');
      await page.click('[data-testid="send-test"]');
      
      // Vérifier envoi
      await expect(page.locator('[data-testid="test-sent"]')).toBeVisible();
      
      // Vérifier log dans audit trail
      await page.click('[data-testid="audit-menu"]');
      const auditEntry = page.locator('[data-testid="audit-entry"]').first();
      await expect(auditEntry).toContainText('notification_test');
    });

  });

  test.describe('3. Vue Grand Écran TV', () => {
    
    test('should access fullscreen dashboard with filters', async ({ page }) => {
      // Connexion
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      // Accéder au mode TV
      await page.click('[data-testid="control-room"]');
      await page.click('[data-testid="tv-mode-toggle"]');
      
      // Vérifier redirection vers fullscreen dashboard
      await expect(page).toHaveURL(/.*fullscreen-dashboard/);
      
      // Tester les filtres dynamiques
      await page.keyboard.press('Control+f'); // Raccourci filtres
      await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();
      
      // Appliquer filtres
      await page.selectOption('[data-testid="status-filter"]', 'active');
      await page.selectOption('[data-testid="priority-filter"]', 'high');
      
      // Vérifier mise à jour des données
      await expect(page.locator('[data-testid="active-missions"]')).toBeVisible();
      
      // Tester plein écran
      await page.keyboard.press('F11');
      // Note: Le test du plein écran réel nécessite des permissions spéciales
    });

    test('should display real-time KPIs and auto-refresh', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      await page.goto(`${TEST_CONFIG.baseURL}/fullscreen-dashboard`);
      
      // Vérifier présence des KPIs
      await expect(page.locator('[data-testid="total-missions"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-missions"]')).toBeVisible();
      await expect(page.locator('[data-testid="completed-missions"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-vehicles"]')).toBeVisible();
      
      // Vérifier auto-refresh (attendre 30s configuré)
      const initialValue = await page.locator('[data-testid="last-update"]').textContent();
      await page.waitForTimeout(31000);
      const updatedValue = await page.locator('[data-testid="last-update"]').textContent();
      
      expect(initialValue).not.toBe(updatedValue);
    });

  });

  test.describe('4. Audit Trail & GDPR', () => {
    
    test('should log user actions in audit trail', async ({ page }) => {
      // Connexion
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Effectuer une action tracée
      await page.click('[data-testid="missions-menu"]');
      await page.click('[data-testid="create-mission"]');
      await page.fill('[data-testid="mission-reference"]', 'TEST-AUDIT-001');
      await page.click('[data-testid="save-mission"]');
      
      // Vérifier audit trail
      await page.click('[data-testid="audit-menu"]');
      
      const auditEntry = page.locator('[data-testid="audit-entry"]').first();
      await expect(auditEntry).toContainText('CREATE');
      await expect(auditEntry).toContainText('missions');
      await expect(auditEntry).toContainText('TEST-AUDIT-001');
    });

    test('should handle GDPR data export request', async ({ page }) => {
      // Connexion utilisateur
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.client.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.client.password);
      await page.click('[data-testid="login-button"]');
      
      // Accéder au panneau GDPR
      await page.click('[data-testid="profile-menu"]');
      await page.click('[data-testid="gdpr-panel"]');
      
      // Demander export des données
      await page.click('[data-testid="export-data-button"]');
      
      // Vérifier téléchargement
      const downloadPromise = page.waitForEvent('download');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('mes-donnees-onelog');
      expect(download.suggestedFilename()).toContain('.json');
      
      // Vérifier audit de l'export
      await page.click('[data-testid="audit-menu"]');
      const auditEntry = page.locator('[data-testid="audit-entry"]').first();
      await expect(auditEntry).toContainText('EXPORT');
      await expect(auditEntry).toContainText('user_data');
    });

    test('should manage GDPR consents', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.client.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.client.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="profile-menu"]');
      await page.click('[data-testid="gdpr-panel"]');
      
      // Modifier consentements
      await page.uncheck('[data-testid="consent-marketing"]');
      await page.check('[data-testid="consent-analytics"]');
      
      // Vérifier sauvegarde
      await expect(page.locator('[data-testid="consent-updated"]')).toBeVisible();
      
      // Vérifier état des consentements
      await page.reload();
      await expect(page.locator('[data-testid="consent-marketing"]')).not.toBeChecked();
      await expect(page.locator('[data-testid="consent-analytics"]')).toBeChecked();
    });

  });

  test.describe('5. Géolocalisation Optimisée', () => {
    
    test('should display map with real-time positions', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="control-room"]');
      
      // Vérifier chargement de la carte
      await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
      
      // Vérifier présence des marqueurs
      await page.waitForSelector('.mapboxgl-marker', { timeout: 10000 });
      const markers = await page.locator('.mapboxgl-marker').count();
      expect(markers).toBeGreaterThan(0);
      
      // Tester popup d'information
      await page.click('.mapboxgl-marker');
      await expect(page.locator('.mapboxgl-popup')).toBeVisible();
    });

    test('should handle map errors gracefully', async ({ page }) => {
      // Simuler erreur réseau
      await page.route('https://api.mapbox.com/**', route => route.abort());
      
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
      await page.click('[data-testid="login-button"]');
      
      await page.click('[data-testid="control-room"]');
      
      // Vérifier affichage d'erreur
      await expect(page.locator('[data-testid="map-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // Tester retry
      await page.unroute('https://api.mapbox.com/**');
      await page.click('[data-testid="retry-button"]');
      
      // Vérifier récupération
      await expect(page.locator('[data-testid="map-container"]')).toBeVisible();
    });

  });

  test.describe('6. Sécurité et Performance', () => {
    
    test('should enforce rate limiting', async ({ page }) => {
      // Test de rate limiting sur l'API
      const promises = [];
      
      // Envoyer 20 requêtes rapidement
      for (let i = 0; i < 20; i++) {
        promises.push(
          page.request.post(`${TEST_CONFIG.baseURL}/api/test-endpoint`, {
            data: { test: i }
          })
        );
      }
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status() === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should validate input sanitization', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Tenter injection XSS
      await page.click('[data-testid="missions-menu"]');
      await page.click('[data-testid="create-mission"]');
      
      const maliciousInput = '<script>alert("XSS")</script>';
      await page.fill('[data-testid="mission-reference"]', maliciousInput);
      await page.click('[data-testid="save-mission"]');
      
      // Vérifier que le script n'est pas exécuté
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const dialog = await dialogPromise;
      expect(dialog).toBeNull();
      
      // Vérifier sanitisation
      const savedValue = await page.locator('[data-testid="mission-reference"]').inputValue();
      expect(savedValue).not.toContain('<script>');
    });

    test('should monitor performance metrics', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.admin.email);
      await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.admin.password);
      await page.click('[data-testid="login-button"]');
      
      // Accéder au dashboard de monitoring
      await page.click('[data-testid="admin-menu"]');
      await page.click('[data-testid="monitoring-dashboard"]');
      
      // Vérifier métriques
      await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage"]')).toBeVisible();
      
      // Vérifier alertes
      await expect(page.locator('[data-testid="alerts-section"]')).toBeVisible();
    });

  });

  test.describe('7. Tests de Régression', () => {
    
    test('should maintain backward compatibility', async ({ page }) => {
      // Tester les anciennes URLs
      await page.goto(`${TEST_CONFIG.baseURL}/missions-chauffeur`);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      
      // Tester les anciens endpoints API
      const response = await page.request.get(`${TEST_CONFIG.baseURL}/api/missions`);
      expect(response.status()).toBeLessThan(500);
    });

    test('should handle database migrations correctly', async ({ page }) => {
      // Test de vérification des migrations via l'interface
      await page.goto(`${TEST_CONFIG.baseURL}/admin/dashboard`);
      
      // Vérifier que les pages se chargent sans erreur (indique que les tables existent)
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

  });

});

// Tests de performance
test.describe('Performance Tests', () => {
  
  test('should load dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(TEST_CONFIG.baseURL);
    await page.fill('[data-testid="email-input"]', TEST_CONFIG.users.exploiteur.email);
    await page.fill('[data-testid="password-input"]', TEST_CONFIG.users.exploiteur.password);
    await page.click('[data-testid="login-button"]');
    
    await page.waitForSelector('[data-testid="dashboard-loaded"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5 secondes max
  });

  test('should handle concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Connexions simultanées
    await Promise.all(
      pages.map(async (page, index) => {
        await page.goto(TEST_CONFIG.baseURL);
        await page.fill('[data-testid="email-input"]', `user${index}@test.com`);
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.click('[data-testid="login-button"]');
      })
    );
    
    // Vérifier que toutes les sessions sont actives
    for (const page of pages) {
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    }
    
    // Nettoyer
    await Promise.all(contexts.map(context => context.close()));
  });

});

export { TEST_CONFIG };
