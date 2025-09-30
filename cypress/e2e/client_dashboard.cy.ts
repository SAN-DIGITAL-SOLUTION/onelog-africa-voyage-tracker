// fichier : cypress/e2e/client_dashboard.cy.ts

describe('Client Dashboard - Parcours complet', () => {
  before(() => {
    cy.visit('/login');
    cy.get('input[name=email]').type('client@test.com');
    cy.get('input[name=password]').type('motdepasseTest123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/dashboard');
  });

  it('Affiche les sections principales du dashboard', () => {
    cy.contains('Tableau de bord Client');
    cy.contains('Missions en cours');
    cy.contains('Factures récentes');
    cy.contains('Notifications');
  });

  it('Affiche les missions assignées', () => {
    cy.get('section').contains('Missions en cours').parent().within(() => {
      cy.get('li').should('have.length.gte', 1);
    });
  });

  it('Affiche les factures du client', () => {
    cy.get('section').contains('Factures récentes').parent().within(() => {
      cy.get('li').should('have.length.gte', 1);
    });
  });

  it('Affiche les notifications', () => {
    cy.get('section').contains('Notifications').parent().within(() => {
      cy.get('li').should('have.length.gte', 1);
    });
  });

  it('Permet de se déconnecter proprement', () => {
    cy.get('button').contains('Déconnexion').click();
    cy.url().should('include', '/login');
  });
});
