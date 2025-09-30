/// <reference types="cypress" />

describe('Admin Dashboard', () => {
  it('navigue sur /admin/dashboard et affiche les stats', () => {
    cy.visit('/admin/dashboard');
    cy.get('[data-testid="dashboard-admin"]').should('exist');
    cy.contains('Vue générale du système');
    cy.contains('Utilisateurs');
    cy.contains('Missions');
    cy.contains('Notifications');
  });

  it('accède à la page logs et affiche le stream live', () => {
    cy.visit('/admin/logs');
    cy.contains('Logs et indicateurs live');
    cy.contains('Live logs :');
    cy.contains('Logs récents');
  });

  it('accède à la page notifications et affiche le résumé', () => {
    cy.visit('/admin/notifications');
    cy.contains('Notifications');
  });
});
