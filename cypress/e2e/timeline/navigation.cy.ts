/// <reference types="cypress" />

describe('Navigation et fonctionnalités de la Timeline', () => {
  beforeEach(() => {
    // Visiter la page de la timeline avant chaque test
    cy.visit('/timeline');
    // Attendre que la page soit chargée
    cy.get('[data-testid="timeline-container"]').should('be.visible');
  });

  it('affiche la liste des événements au chargement', () => {
    // Vérifier que des événements sont affichés
    cy.get('[data-testid^="event-item-"]').should('have.length.greaterThan', 0);
    
    // Vérifier que les événements sont groupés par jour
    cy.get('[data-testid^="day-divider-"]').should('exist');
  });

  it('permet de filtrer les événements par type', () => {
    // Ouvrir le menu déroulant des filtres
    cy.get('[data-testid="filter-type-button"]').click();
    
    // Sélectionner le filtre "Départ"
    cy.get('[data-testid="filter-option-departure"]').click();
    
    // Vérifier que seuls les événements de type "Départ" sont visibles
    cy.get('[data-testid^="event-item-"]').each(($el) => {
      cy.wrap($el).should('contain', 'Départ');
    });
  });

  it('affiche les détails d\'un événement au clic', () => {
    // Cliquer sur le premier événement
    cy.get('[data-testid^="event-item-"]').first().click();
    
    // Vérifier que la modale de détails s'affiche
    cy.get('[data-testid="event-detail-modal"]').should('be.visible');
    
    // Vérifier que le bouton de fermeture fonctionne
    cy.get('[data-testid="close-modal-button"]').click();
    cy.get('[data-testid="event-detail-modal"]').should('not.exist');
  });

  it('permet de naviguer entre les jours avec le sélecteur de date', () => {
    // Vérifier que le sélecteur de date est présent
    cy.get('[data-testid="date-picker"]').should('exist');
    
    // Sélectionner une date différente
    cy.get('[data-testid="date-picker"]').click();
    cy.get('.react-datepicker__day--015').click();
    
    // Vérifier que la timeline se met à jour
    cy.get('[data-testid^="day-divider-"]').first().should('contain', '15');
  });

  it('affiche un message quand il n\'y a pas d\'événements', () => {
    // Simuler une réponse vide de l'API
    cy.intercept('GET', '/api/timeline/*', []).as('getEmptyTimeline');
    
    // Recharger la page
    cy.reload();
    
    // Vérifier que le message d'absence d'événements est affiché
    cy.get('[data-testid="no-events-message"]').should('be.visible');
  });
});
