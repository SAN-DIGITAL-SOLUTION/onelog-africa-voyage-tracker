/// <reference types="cypress" />

describe('Notifications Fallback', () => {
  it('relance une notification non lue par SMS', () => {
    // Simuler une notification push non lue
    cy.createNotification({ user_id: Cypress.env('USER_ID'), message: 'Test fallback', channel: 'push' });
    cy.wait(130000); // attendre 130s (mock)
    cy.exec('npm run notify:retry');
    cy.checkNotificationSent({ user_id: Cypress.env('USER_ID'), channel: 'sms' });
  });
});
