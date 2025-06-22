/// <reference types="cypress" />

// Tests E2E de protection des routes principales selon le rôle et le statut
describe('Protection des routes', () => {
  const users = {
    norole: { email: 'norole@qa.test', password: 'Password123!' },
    pending: { email: 'pending@qa.test', password: 'Password123!' },
    self: { email: 'self@qa.test', password: 'Password123!' },
    admin: { email: 'admin@qa.test', password: 'Password123!' },
  };

  it('Bloque /dashboard si pas de rôle validé', () => {
    cy.login(users.norole.email, users.norole.password);
    cy.visit('/dashboard');
    cy.url().should('include', '/onboarding');
  });

  it('Autorise /dashboard si role_status = approved', () => {
    cy.login(users.self.email, users.self.password);
    cy.visit('/dashboard');
    cy.contains('Bienvenue').should('exist');
  });

  it('Autorise /admin/dashboard pour admin uniquement', () => {
    cy.login(users.admin.email, users.admin.password);
    cy.visit('/admin/dashboard');
    cy.contains('Admin').should('exist');
  });
});
