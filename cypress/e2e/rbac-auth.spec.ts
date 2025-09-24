// E2E RBAC/Auth admin – OneLog Africa
// Vérifie la protection /admin/dashboard selon le rôle
// Nécessite les helpers cy.loginAs('admin'|'user')

describe('RBAC Auth – Admin Dashboard', () => {
  it('redirige vers /login si pas de cookie', () => {
    cy.clearCookies();
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('redirige vers /login si JWT corrompu', () => {
    cy.setCookie('sb-access-token', 'corrupted');
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('redirige vers /login si rôle user', () => {
    cy.loginAs('user');
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('accès admin OK, modale UserRolesModal présente', () => {
    cy.loginAs('admin');
    cy.visit('/admin/dashboard');
    cy.contains('Vue générale du système').should('exist');
    cy.get('h2').contains("Rôles de l'utilisateur").should('exist');
  });

  it('modification du rôle admin → user puis restriction', () => {
    cy.loginAs('admin');
    cy.visit('/admin/dashboard');
    cy.get('input[type="checkbox"][value="admin"]').uncheck({ force: true });
    cy.get('button').contains('Enregistrer').click();
    cy.clearCookies();
    cy.loginAs('user');
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });
});
