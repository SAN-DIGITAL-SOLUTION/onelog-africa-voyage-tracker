describe('User Profiles - E2E', () => {
  beforeEach(() => {
    cy.visit('/user-list');
  });

  it('affiche la liste des utilisateurs', () => {
    cy.get('[data-testid="user-card"]').should('have.length.greaterThan', 0);
  });

  it('navigue vers un profil utilisateur', () => {
    cy.get('[data-testid="user-card"]').first().click();
    cy.url().should('include', '/user/');
    cy.get('[data-testid="user-profile"]').should('exist');
  });

  it('modifie un profil utilisateur', () => {
    cy.get('[data-testid="user-card"]').first().click();
    cy.contains('Modifier').click();
    cy.url().should('include', '/edit');
    cy.get('input[name="name"]').clear().type('Nouveau Nom');
    cy.get('select[name="role"]').select('admin');
    cy.contains('Enregistrer').click();
    cy.contains('Profil mis à jour').should('exist');
  });

  it('retourne à la liste des utilisateurs', () => {
    cy.get('[data-testid="user-card"]').first().click();
    cy.contains('Retour').click();
    cy.url().should('include', '/user-list');
  });
});
