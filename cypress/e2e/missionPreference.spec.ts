/// <reference types="cypress" />

context('Mission Notification respects user preference', () => {
  const TEST_USER_ID = 'mission-pref-disabled';
  const TEST_MISSION_ID = 'mission-123';

  before(() => {
    // Créer une préférence désactivée pour le canal whatsapp
    cy.task('supabaseInsert', {
      table: 'notification_preferences',
      record: {
        id: TEST_USER_ID,
        email_enabled: true,
        sms_enabled: true,
        whatsapp_enabled: false, // Désactivé
        in_app_enabled: true,
        preferences: {}
      }
    });
    // Créer une mission fictive
    cy.task('supabaseInsert', {
      table: 'missions',
      record: {
        id: TEST_MISSION_ID,
        client_name: 'Test Client',
        status: 'ongoing',
        user_id: TEST_USER_ID
      }
    });
  });

  it('ne déclenche PAS de notification mission si whatsapp_enabled = false et log preference_skipped', () => {
    // Appeler via API/app ou script la fonction d’envoi (adapter selon l’intégration réelle)
    cy.request('POST', '/api/test/sendMissionUpdate', {
      missionId: TEST_MISSION_ID,
      userId: TEST_USER_ID,
      recipient: '+33123456789',
      status: 'completed',
      clientName: 'Test Client'
    }).its('status').should('eq', 200);

    // Vérifier qu’un log preference_skipped est créé
    cy.task('supabaseSelect', {
      table: 'notification_logs',
      filters: { user_id: TEST_USER_ID, channel: 'whatsapp', status: 'preference_skipped' }
    }).then((rows) => {
      expect(rows.length).to.equal(1);
      expect(rows[0].reason).to.include('user_disabled_whatsapp_notifications');
    });
  });

  it('déclenche la notification mission si whatsapp_enabled = true', () => {
    // Activer la préférence
    cy.task('supabaseUpdate', {
      table: 'notification_preferences',
      filters: { id: TEST_USER_ID },
      values: { whatsapp_enabled: true }
    });
    cy.request('POST', '/api/test/sendMissionUpdate', {
      missionId: TEST_MISSION_ID,
      userId: TEST_USER_ID,
      recipient: '+33123456789',
      status: 'completed',
      clientName: 'Test Client'
    }).its('status').should('eq', 200);
    // Vérifier qu’un log sent est créé
    cy.task('supabaseSelect', {
      table: 'notification_logs',
      filters: { user_id: TEST_USER_ID, channel: 'whatsapp', status: 'sent' }
    }).then((rows) => {
      expect(rows.length).to.be.greaterThan(0);
    });
  });
});
