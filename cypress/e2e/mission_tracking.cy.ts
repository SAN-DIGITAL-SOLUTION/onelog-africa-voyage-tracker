// fichier : cypress/e2e/mission_tracking.cy.ts

describe('Suivi en temps réel – Mission Tracking', () => {
  const missionId = 'test-mission-123';

  beforeEach(() => {
    cy.login('chauffeur@qa.test', 'password123');

    cy.intercept('GET', `/tracking_points?mission_id=eq.${missionId}*`, {
      statusCode: 200,
      body: [
        { id: 'p1', mission_id: missionId, latitude: 6.5244, longitude: 3.3792, created_at: '2025-06-20T08:00:00Z' },
        { id: 'p2', mission_id: missionId, latitude: 6.5250, longitude: 3.3800, created_at: '2025-06-20T08:01:00Z' },
      ],
    });

    cy.intercept('POST', '/realtime/v1/', req => {
      if (req.body?.event === 'postgres_changes') {
        req.reply({ statusCode: 200 });
      }
    });

    cy.visit(`/missions/${missionId}/tracking`);
  });

  it('affiche la carte Google Maps', () => {
    cy.get('div[data-testid="google-map-container"]').should('exist');
  });

  it('affiche le polyline et les markers', () => {
    cy.get('div[aria-label="Marker"]').should('have.length.at.least', 1);
  });

  it('met à jour la carte lorsqu’un nouveau point arrive', () => {
    cy.window().then(win => {
      const channel = win.supabase.channel();
      channel.handlers[0].callback({
        new: { id: 'p3', mission_id: missionId, latitude: 6.5260, longitude: 3.3810, created_at: new Date().toISOString() },
      });
    });
    cy.get('div[aria-label="Marker"]').should('have.length.at.least', 3);
  });

  // --- SCÉNARIOS SUPPLÉMENTAIRES ---

  it('affiche un message si aucun point GPS n’est disponible', () => {
    cy.intercept('GET', `/tracking_points?mission_id=eq.empty-mission*`, {
      statusCode: 200,
      body: [],
    });
    cy.visit('/missions/empty-mission/tracking');
    cy.contains('En attente de position GPS').should('be.visible');
  });

  it('gère une erreur de récupération des points', () => {
    cy.intercept('GET', `/tracking_points?mission_id=eq.error-mission*`, {
      statusCode: 500,
      body: { error: 'Server error' },
    });
    cy.visit('/missions/error-mission/tracking');
    cy.contains(/erreur|impossible/i, { matchCase: false });
  });

  it('bloque l’accès si non authentifié', () => {
    cy.clearCookies();
    cy.visit(`/missions/${missionId}/tracking`);
    cy.contains(/connexion|authentification/i, { matchCase: false });
  });

  it('bloque l’accès à une mission non autorisée', () => {
    // Simuler une mission dont le chauffeur n’est pas propriétaire
    cy.login('autre@qa.test', 'password123');
    cy.intercept('GET', `/tracking_points?mission_id=eq.unauth-mission*`, {
      statusCode: 403,
      body: { error: 'Forbidden' },
    });
    cy.visit('/missions/unauth-mission/tracking');
    cy.contains(/non autorisé|forbidden|accès refusé/i, { matchCase: false });
  });

  it('affiche une info de chargement pendant le fetch', () => {
    cy.intercept('GET', `/tracking_points?mission_id=eq.${missionId}*`, (req) => {
      req.on('response', (res) => {
        setTimeout(() => res.send(), 1000); // délai artificiel
      });
    });
    cy.visit(`/missions/${missionId}/tracking`);
    cy.contains(/chargement/i, { matchCase: false });
  });
});
