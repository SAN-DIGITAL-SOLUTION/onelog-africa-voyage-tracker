describe('Control Room E2E Tests', () => {
  beforeEach(() => {
    // Login as transporteur
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('transporteur@test.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    // Wait for redirect and navigate to control room
    cy.url().should('include', '/dashboard');
    cy.visit('/control-room');
    cy.url().should('include', '/control-room');
  });

  describe('Map Display', () => {
    it('should display the map container', () => {
      cy.get('[data-cy=map-container]').should('be.visible');
    });

    it('should load Mapbox map', () => {
      cy.get('.mapboxgl-map').should('be.visible');
      cy.get('.mapboxgl-canvas').should('exist');
    });

    it('should display initial markers', () => {
      cy.get('.mapboxgl-marker').should('exist');
    });
  });

  describe('Real-time Updates', () => {
    it('should receive WebSocket updates', () => {
      // Mock a new position update
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('position_update', {
          detail: {
            id: 'test-123',
            vehicule_id: 'VH001',
            mission_id: 'MIS001',
            statut: 'en_route',
            latitude: 5.359952,
            longitude: -3.998575,
            vitesse: 80
          }
        }));
      });

      // Check if new marker appears
      cy.get('.mapboxgl-marker', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });

    it('should update marker positions', () => {
      // Wait for initial load
      cy.get('.mapboxgl-marker').should('exist');
      
      // Check if markers update after data refresh
      cy.intercept('GET', '/api/positions/*').as('getPositions');
      cy.wait('@getPositions');
      
      cy.get('.mapboxgl-marker').should('be.visible');
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      cy.get('[data-cy=sidebar]').should('be.visible');
    });

    it('should filter by vehicle', () => {
      cy.get('[data-cy=vehicle-filter]').select('VH001');
      cy.get('.mapboxgl-marker').should('have.length', 1);
    });

    it('should filter by mission', () => {
      cy.get('[data-cy=mission-filter]').select('MIS001');
      cy.get('.mapboxgl-marker').should('have.length.at.least', 1);
    });

    it('should filter by status', () => {
      cy.get('[data-cy=status-filter-en_route]').check();
      cy.get('.mapboxgl-marker').should('exist');
    });

    it('should clear all filters', () => {
      cy.get('[data-cy=vehicle-filter]').select('VH001');
      cy.get('[data-cy=clear-filters-button]').click();
      cy.get('[data-cy=vehicle-filter]').should('have.value', '');
    });
  });

  describe('Display Modes', () => {
    it('should toggle TV mode', () => {
      cy.get('[data-cy=toggle-tv-mode]').click();
      cy.get('[data-cy=sidebar]').should('not.be.visible');
      cy.get('[data-cy=map-container]').should('have.class', 'fullscreen');
    });

    it('should toggle fullscreen', () => {
      cy.get('[data-cy=toggle-fullscreen]').click();
      cy.document().its('fullscreenElement').should('not.be.null');
    });

    it('should exit fullscreen', () => {
      cy.get('[data-cy=toggle-fullscreen]').click();
      cy.get('[data-cy=toggle-fullscreen]').click();
      cy.document().its('fullscreenElement').should('be.null');
    });
  });

  describe('Statistics Display', () => {
    it('should display statistics', () => {
      cy.get('[data-cy=stats-total]').should('be.visible');
      cy.get('[data-cy=stats-en-route]').should('be.visible');
      cy.get('[data-cy=stats-vehicles]').should('be.visible');
    });

    it('should update statistics when filters change', () => {
      const initialTotal = cy.get('[data-cy=stats-total]').invoke('text');
      
      cy.get('[data-cy=vehicle-filter]').select('VH001');
      cy.get('[data-cy=stats-total]').should('not.have.text', initialTotal);
    });
  });

  describe('Marker Interactions', () => {
    it('should display popup on marker click', () => {
      cy.get('.mapboxgl-marker').first().click();
      cy.get('.mapboxgl-popup').should('be.visible');
      cy.get('.mapboxgl-popup-content').should('contain', 'VH001');
    });

    it('should close popup on map click', () => {
      cy.get('.mapboxgl-marker').first().click();
      cy.get('.mapboxgl-popup').should('be.visible');
      
      cy.get('[data-cy=map-container]').click(100, 100);
      cy.get('.mapboxgl-popup').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.intercept('GET', '/api/positions/*', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getPositionsError');

      cy.visit('/control-room');
      cy.wait('@getPositionsError');
      cy.get('[data-cy=error-message]').should('be.visible');
    });

    it('should show loading state', () => {
      cy.intercept('GET', '/api/positions/*', (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send({ data: [] });
        });
      }).as('getPositionsSlow');

      cy.visit('/control-room');
      cy.get('[data-cy=loading-spinner]').should('be.visible');
    });
  });

  describe('Performance Tests', () => {
    it('should handle 100+ markers efficiently', () => {
      // Mock large dataset
      const largeDataset = Array(100).fill(0).map((_, index) => ({
        id: `test-${index}`,
        vehicule_id: `VH${index}`,
        mission_id: `MIS${index}`,
        statut: 'en_route',
        latitude: 5.359952 + (Math.random() - 0.5) * 0.1,
        longitude: -3.998575 + (Math.random() - 0.5) * 0.1,
        vitesse: 80
      }));

      cy.intercept('GET', '/api/positions/*', {
        body: largeDataset
      }).as('getLargeDataset');

      cy.visit('/control-room');
      cy.wait('@getLargeDataset');
      
      // Check performance metrics
      cy.window().then((win) => {
        expect(win.performance.getEntriesByType('measure')).to.have.length.greaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'toggle-tv-mode');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'toggle-fullscreen');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-cy=map-container]').should('have.attr', 'aria-label');
      cy.get('[data-cy=toggle-tv-mode]').should('have.attr', 'aria-label');
    });
  });
});
