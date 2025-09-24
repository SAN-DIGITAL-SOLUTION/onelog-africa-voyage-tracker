/// <reference types="cypress" />

describe('RLS Policies - Profils & Missions', () => {
  beforeEach(() => {
    // se connecter en tant que viewer
    cy.loginAs('viewer@example.com', 'password');
  });

  it('should prevent viewer from seeing other user profile', () => {
    cy.visit('/user-profiles/otherUserId');
    cy.contains('Accès refusé').should('exist');
  });

  it('should allow viewer to see own profile', () => {
    cy.visit(`/user-profiles/${Cypress.env('USER_ID')}`);
    cy.contains('Mon profil').should('exist');
  });

  it('should prevent viewer from editing others mission', () => {
    cy.visit('/missions/edit/otherMissionId');
    cy.contains('Accès refusé').should('exist');
  });

  it('should allow viewer to edit own mission', () => {
    cy.visit(`/missions/edit/${Cypress.env('MISSION_ID')}`);
    cy.get('input[name="status"]').should('be.enabled');
  });
});
