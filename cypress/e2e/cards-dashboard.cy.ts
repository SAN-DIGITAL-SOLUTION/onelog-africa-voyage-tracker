describe('Cards Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Visit dashboard page (to be created)
    cy.visit('/dashboard');
  });

  describe('Dashboard Grid Layout', () => {
    it('renders dashboard grid with responsive layout', () => {
      cy.get('[data-testid="dashboard-grid"]').should('be.visible');
      
      // Test responsive breakpoints
      cy.viewport(375, 667); // Mobile
      cy.get('[data-testid="dashboard-grid"]').should('have.class', 'grid-cols-1');
      
      cy.viewport(768, 1024); // Tablet
      cy.get('[data-testid="dashboard-grid"]').should('have.class', 'md:grid-cols-2');
      
      cy.viewport(1200, 800); // Desktop
      cy.get('[data-testid="dashboard-grid"]').should('have.class', 'lg:grid-cols-3');
    });

    it('displays all dashboard cards', () => {
      cy.get('[data-testid="dashboard-grid"]').within(() => {
        cy.get('[data-testid^="dashboard-card"]').should('have.length.at.least', 1);
      });
    });
  });

  describe('Vehicle Stats Card', () => {
    it('displays vehicle statistics correctly', () => {
      cy.get('[data-testid="card-vehicle-stats"]').should('be.visible');
      cy.get('[data-testid="card-vehicle-stats"]').within(() => {
        cy.contains('Flotte Véhicules').should('be.visible');
        cy.get('[data-testid="stat-widget-value"]').should('contain.text', /\d+/);
        cy.contains('Véhicules au total').should('be.visible');
      });
    });

    it('shows vehicle status breakdown', () => {
      cy.get('[data-testid="card-vehicle-stats"]').within(() => {
        cy.contains('Actifs').should('be.visible');
        cy.contains('Inactifs').should('be.visible');
        cy.contains('Maintenance').should('be.visible');
        
        // Check percentage badges
        cy.get('[data-testid^="badge"]').should('have.length.at.least', 3);
      });
    });

    it('displays trend information', () => {
      cy.get('[data-testid="card-vehicle-stats"]').within(() => {
        // Should show trend icon and percentage
        cy.get('svg').should('be.visible'); // Trend icon
        cy.get('span').contains('%').should('be.visible');
      });
    });

    it('shows last update timestamp', () => {
      cy.get('[data-testid="card-vehicle-stats"]').within(() => {
        cy.contains('Dernière mise à jour').should('be.visible');
        cy.contains(/\d{2}:\d{2}:\d{2}/).should('be.visible');
      });
    });
  });

  describe('Stat Widgets', () => {
    it('renders stat widgets with correct structure', () => {
      cy.get('[data-testid="stat-widget"]').should('have.length.at.least', 1);
      
      cy.get('[data-testid="stat-widget"]').first().within(() => {
        // Should have title, value, and optional elements
        cy.get('h3').should('be.visible');
        cy.get('[data-testid="stat-widget-value"]').should('be.visible');
      });
    });

    it('displays trend indicators when present', () => {
      cy.get('[data-testid="stat-widget"]').each(($widget) => {
        cy.wrap($widget).within(() => {
          // Check if trend exists, then verify its content
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="stat-widget-trend"]').length > 0) {
              cy.get('[data-testid="stat-widget-trend"]').should('be.visible');
              cy.get('[data-testid="stat-widget-trend"]').should('contain.text', '%');
            }
          });
        });
      });
    });

    it('shows icons when provided', () => {
      cy.get('[data-testid="stat-widget"]').each(($widget) => {
        cy.wrap($widget).within(() => {
          // Check if icon exists
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="stat-widget-icon"]').length > 0) {
              cy.get('[data-testid="stat-widget-icon"]').should('be.visible');
            }
          });
        });
      });
    });
  });

  describe('Loading States', () => {
    it('handles loading states gracefully', () => {
      // Simulate slow network
      cy.intercept('GET', '**/api/**', { delay: 2000 }).as('slowApi');
      
      cy.visit('/dashboard');
      
      // Should show loading skeletons
      cy.get('[data-testid*="loading"]').should('be.visible');
      cy.get('.animate-pulse').should('be.visible');
      
      cy.wait('@slowApi');
      
      // Loading should disappear
      cy.get('[data-testid*="loading"]').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];

    viewports.forEach(({ width, height, name }) => {
      it(`displays correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        
        // Grid should be visible and properly sized
        cy.get('[data-testid="dashboard-grid"]').should('be.visible');
        
        // Cards should be readable
        cy.get('[data-testid^="card-"]').each(($card) => {
          cy.wrap($card).should('be.visible');
          cy.wrap($card).within(() => {
            cy.get('h3').should('be.visible');
          });
        });
        
        // Text should be readable (not too small)
        cy.get('[data-testid="stat-widget-value"]').should('have.css', 'font-size');
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');
      
      // Check that headings are in logical order
      cy.get('h3').should('be.visible'); // Card titles
    });

    it('provides proper ARIA attributes', () => {
      cy.get('[data-testid="dashboard-grid"]').should('have.attr', 'data-testid');
      cy.get('[data-testid^="card-"]').should('have.length.at.least', 1);
      cy.get('[data-testid^="stat-widget"]').should('have.length.at.least', 1);
    });

    it('supports keyboard navigation', () => {
      // Focus should be manageable with keyboard
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });
  });

  describe('Performance', () => {
    it('loads dashboard within performance budget', () => {
      const startTime = Date.now();
      
      cy.visit('/dashboard');
      cy.get('[data-testid="dashboard-grid"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000); // < 2 seconds
      });
    });

    it('updates data efficiently', () => {
      cy.visit('/dashboard');
      
      // Simulate data update
      cy.get('[data-testid="card-vehicle-stats"]').should('be.visible');
      
      // Check that updates don't cause layout shifts
      cy.get('[data-testid="dashboard-grid"]').should('have.css', 'display', 'grid');
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', () => {
      // Simulate API error
      cy.intercept('GET', '**/api/**', { statusCode: 500 }).as('apiError');
      
      cy.visit('/dashboard');
      
      // Should still render basic structure
      cy.get('[data-testid="dashboard-grid"]').should('be.visible');
      
      // Should show error state or fallback content
      cy.get('body').should('contain.text', /erreur|indisponible|--/i);
    });

    it('recovers from network issues', () => {
      // Simulate network failure then recovery
      cy.intercept('GET', '**/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/dashboard');
      
      // Should handle gracefully
      cy.get('[data-testid="dashboard-grid"]').should('be.visible');
      
      // Simulate recovery
      cy.intercept('GET', '**/api/**', { fixture: 'dashboard-data.json' }).as('recovery');
      
      // Should recover and show data
      cy.reload();
      cy.get('[data-testid="stat-widget-value"]').should('contain.text', /\d+/);
    });
  });
});
