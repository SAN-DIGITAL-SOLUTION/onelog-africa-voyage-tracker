/// <reference types="cypress" />

describe('Notifications et respect des préférences utilisateur', () => {
  const userId = Cypress.env('USER_ID');

  beforeEach(() => {
    cy.loginAs('user@example.com', 'password');
  });

  it('n\'envoie PAS de notification si la préférence utilisateur est désactivée', () => {
    // Désactive la préférence notification SMS pour l'utilisateur
    cy.setNotificationPreference({ user_id: userId, channel: 'sms', enabled: false });
    // Simule une notification échouée à relancer (retry)
    cy.createNotification({ user_id: userId, message: 'Test retry', channel: 'sms', status: 'failed', retry_count: 0 });
    cy.exec('npm run notify:retry');
    // Vérifie qu'aucune notification n'a été envoyée sur le canal désactivé
    cy.checkNoNotificationSent({ user_id: userId, channel: 'sms' });
    // Vérifie qu'un log d'audit preference_skipped est enregistré côté admin
    cy.visit('/admin/notifications');
    cy.contains('preference_skipped').should('exist');
    cy.contains('Canal sms désactivé, retry annulé.').should('exist');
  });

  it('envoie la notification si la préférence est activée', () => {
    cy.setNotificationPreference({ user_id: userId, channel: 'sms', enabled: true });
    cy.createNotification({ user_id: userId, message: 'Test retry ok', channel: 'sms', status: 'failed', retry_count: 0 });
    cy.exec('npm run notify:retry');
    cy.checkNotificationSent({ user_id: userId, channel: 'sms' });
  });
});
