describe('Suivi live Chauffeur - Dashboard', () => {
  const email = 'chauffeur@test.com';
  const password = 'password123';

  before(() => {
    // Optionnel : reset base ou mock des données via API
  });

  it('se connecte, sélectionne mission, affiche suivi live et se déconnecte', () => {
    // Visiter la page login
    cy.visit('/login');

    // Saisie des identifiants et connexion
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Attendre le dashboard chauffeur
    cy.url().should('include', '/chauffeur');
    cy.contains('Tableau de bord Chauffeur').should('be.visible');

    // Vérifier que la liste des missions est visible
    cy.contains('Missions assignées').should('be.visible');

    // Sélectionner la première mission
    cy.get('ul > li').first().click();

    // Vérifier que le suivi live est visible
    cy.contains('Suivi en temps réel').should('be.visible');

    // Mock la géolocalisation (latitude, longitude)
    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'watchPosition').callsFake((success) => {
        return success({
          coords: {
            latitude: 5.3456,
            longitude: -4.0123,
            accuracy: 10,
          }
        });
      });
    });

    // Vérifier que la carte Google Maps est présente
    cy.get('div[role="application"]').should('exist');

    // Vérifier que des marqueurs (points) sont affichés
    cy.get('img[alt="Marker"]').should('exist');

    // Cliquer sur bouton déconnexion (assume qu’il y en a un)
    cy.get('button').contains(/déconnexion|logout/i).click();

    // Vérifier la redirection vers login
    cy.url().should('include', '/login');
  });
});
