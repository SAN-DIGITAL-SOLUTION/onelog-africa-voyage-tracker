/// <reference types="cypress" />

describe('Notifications temps réel', () => {
  beforeEach(() => {
    cy.loginAs('user@example.com', 'password');
  });

  it('affiche le badge lors de la réception d’une notification', () => {
    cy.sendNotification({ message: 'Test notif', user_id: Cypress.env('USER_ID') });
    cy.visit('/');
    cy.get('[aria-label="Notifications"] span').should('contain', '1');
  });

  it('affiche le toast et permet de marquer comme lu', () => {
    cy.sendNotification({ message: 'Notif toast', user_id: Cypress.env('USER_ID') });
    cy.visit('/');
    cy.get('[aria-label="Notifications"]').click();
    cy.contains('Notif toast').should('exist');
    cy.contains('Marquer comme lu').click();
    cy.contains('Notif toast').parent().should('have.class', 'bg-gray-100');
  });
});
