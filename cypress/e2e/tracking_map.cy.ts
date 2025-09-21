// cypress/e2e/tracking_map.cy.ts

describe("TrackingMap Page", () => {
  it("affiche la carte avec markers", () => {
    cy.intercept("GET", "**/positions*", { fixture: "positions.json" }).as("getPositions");
    cy.visit("/tracking-map");
    cy.contains("Chargement des positions...");
    cy.wait("@getPositions");
    cy.get(".mapboxgl-map").should("exist");
    cy.get(".mapboxgl-marker").should("have.length.greaterThan", 0);
  });

  it("permet de zoomer et déplacer la carte", () => {
    cy.intercept("GET", "**/positions*", { fixture: "positions.json" }).as("getPositions");
    cy.visit("/tracking-map");
    cy.wait("@getPositions");
    cy.get(".mapboxgl-map").should("exist");
    // Zoom avant
    cy.get('.mapboxgl-ctrl-zoom-in').click();
    // Zoom arrière
    cy.get('.mapboxgl-ctrl-zoom-out').click();
    // Drag (pan)
    cy.get('.mapboxgl-canvas')
      .trigger('mousedown', { which: 1, pageX: 300, pageY: 300 })
      .trigger('mousemove', { which: 1, pageX: 350, pageY: 350 })
      .trigger('mouseup');
    // Vérifie que la carte est toujours affichée
    cy.get(".mapboxgl-map").should("exist");
  });

  it("affiche un popup au clic sur un marker", () => {
    cy.intercept("GET", "**/positions*", { fixture: "positions.json" }).as("getPositions");
    cy.visit("/tracking-map");
    cy.wait("@getPositions");
    cy.get(".mapboxgl-marker").first().click({ force: true });
    cy.get(".mapboxgl-popup").should("exist");
    // Vérifie la présence d'un texte dynamique (adapter selon contenu réel du popup)
    cy.get(".mapboxgl-popup").should("contain.text", "veh-001");
  });

  it("affiche un message d'état si aucune donnée n'est disponible", () => {
    cy.intercept("GET", "**/positions*", []).as("getPositionsEmpty");
    cy.visit("/tracking-map");
    cy.wait("@getPositionsEmpty");
    cy.get(".mapboxgl-marker").should("have.length", 0);
    cy.contains("Aucune donnée disponible");
  });

  it("affiche une erreur si le token Mapbox est invalide", () => {
    // Simule un token erroné via variable d'env ou interception
    cy.intercept("GET", /mapbox.*access_token=invalid/, { statusCode: 401 }).as("getMapboxInvalidToken");
    // Ici, il faudrait forcer le token à 'invalid' côté app, ou mocker la config
    cy.visit("/tracking-map?token=invalid"); // À adapter selon implémentation
    cy.wait(1000); // Laisse le temps à la carte d'essayer de charger
    cy.contains(/carte indisponible|erreur/i);
  });

  it("affiche une erreur si l'API Mapbox est indisponible", () => {
    cy.intercept("GET", /mapbox.*tiles/, { forceNetworkError: true }).as("getMapboxTilesError");
    cy.visit("/tracking-map");
    cy.wait(1000);
    cy.contains(/carte indisponible|erreur/i);
  });
});
