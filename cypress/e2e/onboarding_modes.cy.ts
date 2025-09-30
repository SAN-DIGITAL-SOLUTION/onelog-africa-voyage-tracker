/// <reference types="cypress" />

// Tests E2E Onboarding dynamique (admin_only, hybrid, self_service)
describe('Onboarding - Modes d\'attribution de rôle', () => {
  const users = {
    norole: { email: 'norole@qa.test', password: 'Password123!' },
    pending: { email: 'pending@qa.test', password: 'Password123!' },
    self: { email: 'self@qa.test', password: 'Password123!' },
    admin: { email: 'admin@qa.test', password: 'Password123!' },
  };

  it('Bloque l\'accès dashboard si aucun rôle', () => {
    cy.login(users.norole.email, users.norole.password);
    cy.visit('/dashboard');
    cy.contains('Aucun rôle attribué').should('exist');
    cy.url().should('include', '/onboarding');
  });

  it('Bloque dashboard si role_status = pending (hybrid)', () => {
    cy.login(users.pending.email, users.pending.password);
    cy.visit('/dashboard');
    cy.contains('Votre demande est en attente').should('exist');
  });

  it('Accès dashboard si role validé (self_service)', () => {
    cy.login(users.self.email, users.self.password);
    cy.visit('/dashboard');
    cy.contains('Bienvenue').should('exist');
  });
});
