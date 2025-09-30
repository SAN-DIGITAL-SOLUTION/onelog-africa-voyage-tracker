/// <reference types="cypress" />

describe('Page Paramètres de notification', () => {
  const TEST_USER_ID = 'notif-settings-user';

  before(() => {
    // Préparer l'utilisateur et la table
    cy.task('supabaseInsert', {
      table: 'notification_preferences',
      record: {
        id: TEST_USER_ID,
        email_enabled: true,
        sms_enabled: false,
        whatsapp_enabled: true,
        in_app_enabled: false,
        preferences: {}
      }
    });
    // Auth simpliée (adapter selon le projet)
    cy.login(TEST_USER_ID);
  });

  it('affiche et modifie les préférences', () => {
    cy.visit('/settings/notifications');
    cy.contains('Paramètres de notification');
    cy.get('input[type="checkbox"]').should('have.length', 4);
    cy.get('input[type="checkbox"]').eq(1).should('not.be.checked'); // SMS désactivé
    cy.get('input[type="checkbox"]').eq(1).check(); // Activer SMS
    cy.get('button[type="submit"]').click();
    cy.contains('Chargement…').should('exist');
    cy.contains('Chargement…').should('not.exist');
    // Vérifier en base
    cy.task('supabaseSelect', {
      table: 'notification_preferences',
      filters: { id: TEST_USER_ID }
    }).then((rows) => {
      expect(rows[0].sms_enabled).to.equal(true);
    });
  });
});
