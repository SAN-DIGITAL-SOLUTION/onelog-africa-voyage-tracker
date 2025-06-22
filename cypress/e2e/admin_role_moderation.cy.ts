/// <reference types="cypress" />

// Tests E2E modération des demandes de rôle côté admin
describe('Modération des rôles - Admin', () => {
  const admin = { email: 'admin@qa.test', password: 'Password123!' };
  const pendingUser = { email: 'pending@qa.test', password: 'Password123!' };

  it('Accès réservé à l\'admin', () => {
    cy.login(admin.email, admin.password);
    cy.visit('/admin/role-requests');
    cy.contains('Demandes de rôles').should('exist');
  });

  it('Refuse l\'accès à un non-admin', () => {
    cy.login(pendingUser.email, 'Password123!');
    cy.visit('/admin/role-requests');
    cy.contains('Accès refusé').should('exist');
  });

  it('Admin peut approuver une demande', () => {
    cy.login(admin.email, admin.password);
    cy.visit('/admin/role-requests');
    cy.get('[data-cy=approve-btn]').first().click();
    cy.contains('Demande approuvée').should('exist');
  });

  it('Admin peut rejeter une demande', () => {
    cy.login(admin.email, admin.password);
    cy.visit('/admin/role-requests');
    cy.get('[data-cy=reject-btn]').first().click();
    cy.contains('Demande rejetée').should('exist');
  });
});
