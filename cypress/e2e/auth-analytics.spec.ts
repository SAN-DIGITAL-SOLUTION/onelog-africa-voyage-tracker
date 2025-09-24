describe('RBAC & Analytics E2E', () => {
  it('refuse l\'accès aux routes admin pour un user non-admin', () => {
    cy.loginAs('user');
    cy.visit('/admin/dashboard');
    cy.url().should('not.include', '/admin/dashboard');
  });

  it('affiche les analytics pour un admin', () => {
    cy.loginAs('admin');
    cy.visit('/admin/dashboard');
    cy.contains('Analytics avancés');
    cy.get('canvas').should('exist');
  });

  it('modification des rôles impacte l\'UI', () => {
    cy.loginAs('admin');
    cy.visit('/admin/users');
    cy.get('button').contains('Rôles').first().click();
    cy.get('input[type=checkbox][value=manager]').check();
    cy.get('button').contains('Enregistrer').click();
    cy.reload();
    cy.get('button').contains('Rôles').first().click();
    cy.get('input[type=checkbox][value=manager]').should('be.checked');
  });
});
