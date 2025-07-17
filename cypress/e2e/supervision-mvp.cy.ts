describe('Supervision MVP - Map-First', () => {
  beforeEach(() => {
    // Intercepter les appels API pour utiliser des données de test
    cy.intercept('GET', '**/vehicle_positions*', {
      fixture: 'vehicle-positions.json'
    }).as('getVehiclePositions');

    // Visiter la page de supervision
    cy.visit('/supervision');
  });

  describe('MapView Component', () => {
    it('should render the map container', () => {
      cy.get('[data-testid="map-container"]').should('be.visible');
      cy.get('[data-testid="map-container"]').should('have.class', 'h-96');
    });

    it('should display connection status', () => {
      cy.get('[data-testid="connection-status"]').should('be.visible');
      cy.get('[data-testid="connection-status"]').should('contain', 'Temps réel');
    });

    it('should show vehicle count', () => {
      cy.get('[data-testid="vehicle-count"]').should('be.visible');
      cy.get('[data-testid="vehicle-count"]').should('contain', 'véhicule');
    });

    it('should render vehicle markers', () => {
      cy.wait('@getVehiclePositions');
      
      // Vérifier que les markers sont présents
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length.greaterThan', 0);
      
      // Vérifier les couleurs des markers selon le statut
      cy.get('[data-testid="vehicle-marker-truck-001"]')
        .should('have.css', 'background-color', 'rgb(0, 150, 136)'); // Active - green
      
      cy.get('[data-testid="vehicle-marker-truck-002"]')
        .should('have.css', 'background-color', 'rgb(249, 168, 37)'); // Idle - yellow
    });

    it('should show vehicle popup on marker click', () => {
      cy.wait('@getVehiclePositions');
      
      // Cliquer sur un marker
      cy.get('[data-testid="vehicle-marker-truck-001"]').click();
      
      // Vérifier que le popup s'affiche
      cy.get('[data-testid="vehicle-popup"]').should('be.visible');
      cy.get('[data-testid="vehicle-popup"]').should('contain', 'Camion Dakar-01');
      cy.get('[data-testid="vehicle-popup"]').should('contain', 'Actif');
      cy.get('[data-testid="vehicle-popup"]').should('contain', 'Amadou Ba');
    });

    it('should close vehicle popup', () => {
      cy.wait('@getVehiclePositions');
      
      // Ouvrir le popup
      cy.get('[data-testid="vehicle-marker-truck-001"]').click();
      cy.get('[data-testid="vehicle-popup"]').should('be.visible');
      
      // Fermer le popup
      cy.get('[data-testid="close-popup"]').click();
      cy.get('[data-testid="vehicle-popup"]').should('not.exist');
    });

    it('should toggle fullscreen mode', () => {
      cy.get('[data-testid="fullscreen-toggle"]').click();
      cy.get('[data-testid="map-container"]').should('have.class', 'fixed');
      cy.get('[data-testid="map-container"]').should('have.class', 'inset-0');
      
      // Quitter le mode plein écran
      cy.get('[data-testid="fullscreen-toggle"]').click();
      cy.get('[data-testid="map-container"]').should('not.have.class', 'fixed');
    });

    it('should display map legend', () => {
      cy.get('[data-testid="map-legend"]').should('be.visible');
      cy.get('[data-testid="map-legend"]').should('contain', 'Légende');
      cy.get('[data-testid="map-legend"]').should('contain', 'Actif');
      cy.get('[data-testid="map-legend"]').should('contain', 'Inactif');
      cy.get('[data-testid="map-legend"]').should('contain', 'Maintenance');
    });
  });

  describe('SidebarFilters Component', () => {
    it('should render filters sidebar', () => {
      cy.get('[data-testid="sidebar-filters"]').should('be.visible');
      cy.get('[data-testid="filters-title"]').should('contain', 'Filtres');
    });

    it('should display filter sections', () => {
      cy.get('[data-testid="status-filters"]').should('be.visible');
      cy.get('[data-testid="zone-filters"]').should('be.visible');
      cy.get('[data-testid="driver-filters"]').should('be.visible');
    });

    it('should filter vehicles by status', () => {
      cy.wait('@getVehiclePositions');
      
      // Vérifier le nombre initial de markers
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 4);
      
      // Activer le filtre "Actif"
      cy.get('[data-testid="filter-status-active"]').click();
      
      // Vérifier que seuls les véhicules actifs sont affichés
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 2);
      cy.get('[data-testid="vehicle-count"]').should('contain', '2 véhicules');
    });

    it('should filter vehicles by zone', () => {
      cy.wait('@getVehiclePositions');
      
      // Activer le filtre "Dakar"
      cy.get('[data-testid="filter-zone-dakar"]').click();
      
      // Vérifier que seuls les véhicules de Dakar sont affichés
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 1);
      cy.get('[data-testid="vehicle-count"]').should('contain', '1 véhicule');
    });

    it('should filter vehicles by driver', () => {
      cy.wait('@getVehiclePositions');
      
      // Activer le filtre "Amadou Ba"
      cy.get('[data-testid="filter-driver-amadou-ba"]').click();
      
      // Vérifier que seuls les véhicules d'Amadou Ba sont affichés
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 1);
      cy.get('[data-testid="vehicle-marker-truck-001"]').should('be.visible');
    });

    it('should combine multiple filters', () => {
      cy.wait('@getVehiclePositions');
      
      // Activer plusieurs filtres
      cy.get('[data-testid="filter-status-active"]').click();
      cy.get('[data-testid="filter-zone-dakar"]').click();
      
      // Vérifier que les filtres se combinent correctement
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 1);
      cy.get('[data-testid="vehicle-marker-truck-001"]').should('be.visible');
    });

    it('should clear all filters', () => {
      cy.wait('@getVehiclePositions');
      
      // Activer quelques filtres
      cy.get('[data-testid="filter-status-active"]').click();
      cy.get('[data-testid="filter-zone-dakar"]').click();
      
      // Vérifier que les filtres sont actifs
      cy.get('[data-testid="active-filters-count"]').should('contain', '2');
      
      // Effacer tous les filtres
      cy.get('[data-testid="clear-all-filters"]').click();
      
      // Vérifier que tous les véhicules sont affichés
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length', 4);
      cy.get('[data-testid="active-filters-count"]').should('not.exist');
    });

    it('should show active filter count', () => {
      // Activer des filtres
      cy.get('[data-testid="filter-status-active"]').click();
      cy.get('[data-testid="filter-zone-dakar"]').click();
      
      // Vérifier le compteur
      cy.get('[data-testid="active-filters-count"]').should('contain', '2');
    });

    it('should collapse and expand filters', () => {
      // Réduire les filtres
      cy.get('[data-testid="toggle-filters"]').click();
      cy.get('[data-testid="status-filters"]').should('not.be.visible');
      
      // Développer les filtres
      cy.get('[data-testid="toggle-filters"]').click();
      cy.get('[data-testid="status-filters"]').should('be.visible');
    });
  });

  describe('Real-time Updates', () => {
    it('should handle connection status changes', () => {
      // Simuler une déconnexion
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });
      
      cy.get('[data-testid="connection-status"]').should('contain', 'Déconnecté');
      
      // Simuler une reconnexion
      cy.window().then((win) => {
        win.dispatchEvent(new Event('online'));
      });
      
      cy.get('[data-testid="connection-status"]').should('contain', 'Temps réel');
    });

    it('should update vehicle positions in real-time', () => {
      cy.wait('@getVehiclePositions');
      
      // Intercepter les mises à jour temps réel
      cy.intercept('GET', '**/vehicle_positions*', {
        fixture: 'vehicle-positions-updated.json'
      }).as('getUpdatedPositions');
      
      // Simuler une mise à jour temps réel
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('supabase-realtime-update'));
      });
      
      cy.wait('@getUpdatedPositions');
      
      // Vérifier que les positions ont été mises à jour
      cy.get('[data-testid="vehicle-marker-truck-001"]')
        .should('have.attr', 'style')
        .and('contain', 'left: 25%'); // Position mise à jour
    });
  });

  describe('Performance', () => {
    it('should load map within 2 seconds', () => {
      const start = Date.now();
      
      cy.wait('@getVehiclePositions').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(2000);
      });
    });

    it('should handle large number of vehicles', () => {
      // Intercepter avec un grand nombre de véhicules
      cy.intercept('GET', '**/vehicle_positions*', {
        fixture: 'vehicle-positions-large.json'
      }).as('getLargeDataset');
      
      cy.visit('/supervision');
      cy.wait('@getLargeDataset');
      
      // Vérifier que la carte reste responsive
      cy.get('[data-testid="map-container"]').should('be.visible');
      cy.get('[data-testid^="vehicle-marker-"]').should('have.length.greaterThan', 50);
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x');
      
      // Vérifier que les composants s'adaptent
      cy.get('[data-testid="sidebar-filters"]').should('be.visible');
      cy.get('[data-testid="map-container"]').should('be.visible');
      
      // Vérifier que les boutons sont accessibles
      cy.get('[data-testid="fullscreen-toggle"]').should('be.visible');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.get('[data-testid="sidebar-filters"]').should('be.visible');
      cy.get('[data-testid="map-container"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      // Tester la navigation au clavier
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status-active');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'filter-status-idle');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="map-container"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="sidebar-filters"]').should('have.attr', 'aria-label');
    });

    it('should support screen readers', () => {
      cy.get('[data-testid="vehicle-count"]').should('have.attr', 'aria-live', 'polite');
      cy.get('[data-testid="connection-status"]').should('have.attr', 'aria-live', 'polite');
    });
  });
});
