// Tests E2E critiques - Parcours utilisateur complet

describe('Parcours utilisateur critique', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.intercept('POST', '**/auth/v1/token*').as('login');
    cy.intercept('GET', '**/rest/v1/missions*').as('getMissions');
    cy.intercept('POST', '**/rest/v1/missions').as('createMission');
    cy.intercept('GET', '**/rest/v1/vehicles*').as('getVehicles');
  });

  describe('Connexion et dashboard', () => {
    it('devrait permettre la connexion admin', () => {
      cy.get('[data-testid="email-input"]').type('admin@onelog.africa');
      cy.get('[data-testid="password-input"]').type('Admin123!');
      cy.get('[data-testid="login-button"]').click();
      
      cy.wait('@login');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-title"]').should('contain', 'Tableau de bord');
    });
  });

  describe('Création mission complète', () => {
    it('devrait créer une mission de A à Z', () => {
      // Connexion
      cy.get('[data-testid="email-input"]').type('admin@onelog.africa');
      cy.get('[data-testid="password-input"]').type('Admin123!');
      cy.get('[data-testid="login-button"]').click();
      
      // Navigation création mission
      cy.get('[data-testid="create-mission-btn"]').click();
      
      // Remplir formulaire
      cy.get('[data-testid="client-select"]').select('MEDLOG');
      cy.get('[data-testid="driver-select"]').select('Jean Dupont');
      cy.get('[data-testid="vehicle-select"]').select('Camion 001');
      cy.get('[data-testid="pickup-location"]').type('Douala Port');
      cy.get('[data-testid="delivery-location"]').type('Yaoundé Depot');
      cy.get('[data-testid="expected-start"]').type('2025-08-30');
      
      // Soumettre
      cy.get('[data-testid="submit-mission"]').click();
      cy.wait('@createMission');
      
      // Vérification
      cy.get('[data-testid="success-message"]').should('contain', 'Mission créée');
    });
  });

  describe('Supervision temps réel', () => {
    it('devrait afficher les véhicules en temps réel', () => {
      cy.get('[data-testid="email-input"]').type('admin@onelog.africa');
      cy.get('[data-testid="password-input"]').type('Admin123!');
      cy.get('[data-testid="login-button"]').click();
      
      // Navigation supervision
      cy.get('[data-testid="supervision-link"]').click();
      cy.url().should('include', '/supervision');
      
      // Vérification carte
      cy.get('[data-testid="supervision-map"]').should('be.visible');
      cy.wait('@getVehicles');
      
      // Test filtres
      cy.get('[data-testid="filter-status"]').select('en cours');
      cy.get('[data-testid="vehicle-marker"]').should('have.length.greaterThan', 0);
      
      // Mode plein écran
      cy.get('[data-testid="fullscreen-btn"]').click();
      cy.get('[data-testid="supervision-dashboard"]').should('have.class', 'fullscreen');
    });
  });

  describe('Facturation multi-acteurs', () => {
    it('devrait générer une facture groupée', () => {
      cy.get('[data-testid="email-input"]').type('admin@onelog.africa');
      cy.get('[data-testid="password-input"]').type('Admin123!');
      cy.get('[data-testid="login-button"]').click();
      
      // Navigation facturation
      cy.get('[data-testid="billing-link"]').click();
      
      // Sélectionner partenaire
      cy.get('[data-testid="billing-partner"]').select('MEDLOG');
      cy.get('[data-testid="start-date"]').type('2025-08-01');
      cy.get('[data-testid="end-date"]').type('2025-08-31');
      
      // Générer facture
      cy.get('[data-testid="generate-invoice"]').click();
      cy.get('[data-testid="invoice-preview"]').should('be.visible');
    });
  });
});
