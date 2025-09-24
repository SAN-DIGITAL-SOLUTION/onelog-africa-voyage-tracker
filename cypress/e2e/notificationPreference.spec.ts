/// <reference types="cypress" />

context('Notification Retry respecting user preference', () => {
  const TEST_USER_ID = 'user-preference-disabled';

  before(() => {
    // 1. Préparer la base : créer un profil avec préférence SMS désactivée
    cy.task('supabaseInsert', {
      table: 'notification_preferences',
      record: {
        id: TEST_USER_ID,
        email_enabled: true,
        sms_enabled: false,            // SMS désactivé
        whatsapp_enabled: true,
        in_app_enabled: true,
        preferences: {}
      }
    });

    // 2. Créer une notification échouée pour ce user
    cy.task('supabaseInsert', {
      table: 'notification_logs',
      record: {
        notification_id: 'notif-test-1',
        user_id: TEST_USER_ID,
        channel: 'sms',
        status: 'failed',
        retry_count: 0,
        message: 'Test message',
        metadata: {}
      }
    });
  });

  it('does not retry SMS when sms_enabled = false and logs preference_skipped', () => {
    // Lancer le script de retry via CLI
    cy.exec('npm run notify:retry', { timeout: 600000 }).its('code').should('eq', 0);

    // Vérifier qu’aucun appel Twilio n’a été effectué
    // (on peut stubber Twilio dans un plugin Cypress ou vérifier absence de log "sent")
    cy.task('supabaseSelect', {
      table: 'notification_logs',
      filters: { notification_id: 'notif-test-1', status: 'preference_skipped' }
    }).then((rows) => {
      expect(rows).to.have.length(1);
    });

    // Vérifier que le retry_count n’a pas incrémenté pour ce log
    cy.task('supabaseSelect', {
      table: 'notification_logs',
      filters: { notification_id: 'notif-test-1' }
    }).then((rows) => {
      // On devrait avoir deux lignes : l'original + le log preference_skipped
      expect(rows).to.have.length(2);
      // L'original conserve retry_count = 0
      const original = rows.find((r) => r.status === 'failed');
      expect(original.retry_count).to.equal(0);
    });
  });
});
