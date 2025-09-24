/// <reference types="cypress" />

// Ce fichier suppose que l'app expose les endpoints /api/userProfiles et une UI accessible à /admin/userProfiles

describe('E2E Profils Utilisateurs', () => {
  const testUser = {
    id: 'e2e-test-1',
    email: 'e2e-profile@onelog.dev',
    fullName: 'E2E Test User',
    role: 'client',
    created_at: '',
    updated_at: ''
  };

  before(() => {
    // Nettoyage ou création d'un profil test via API si besoin
    cy.request('PUT', '/api/userProfiles', { userId: testUser.id, updates: testUser });
  });

  it('Affiche la liste des profils', () => {
    cy.visit('/admin/userProfiles');
    cy.contains(testUser.email).should('exist');
  });

  it('Modifie le nom complet', () => {
    cy.visit('/admin/userProfiles');
    cy.contains(testUser.email).click();
    cy.get('input[name="fullName"]').clear().type('E2E User Modifié');
    cy.contains('Enregistrer').click();
    cy.contains('E2E User Modifié').should('exist');
  });

  it('Change le rôle', () => {
    cy.visit('/admin/userProfiles');
    cy.contains(testUser.email).click();
    cy.get('select[name="role"]').select('admin');
    cy.contains('Enregistrer').click();
    cy.contains('admin').should('exist');
  });

  it('Gère les erreurs d’entrée', () => {
    cy.visit('/admin/userProfiles');
    cy.contains(testUser.email).click();
    cy.get('input[name="fullName"]').clear();
    cy.contains('Enregistrer').click();
    cy.contains(/erreur/i).should('exist');
  });

  it('Refuse modification sans permission', () => {
    // Simule un utilisateur non-admin
    cy.loginAs('client');
    cy.visit('/admin/userProfiles');
    cy.contains(testUser.email).click();
    cy.get('select[name="role"]').should('be.disabled');
  });
});
