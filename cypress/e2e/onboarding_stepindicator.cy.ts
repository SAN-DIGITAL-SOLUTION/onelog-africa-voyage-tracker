/// <reference types="cypress" />

describe('Onboarding StepIndicator', () => {
  it('affiche la barre de progression et évolue lors de la navigation', () => {
    cy.visit('/onboarding');
    cy.contains('Suivant').should('exist');
    cy.get('[aria-label="Progress"]').should('exist');
    // Vérifie que la première étape est active
    cy.get('[aria-label="Progress"] li').first().find('span').first().should('have.class', 'bg-accentCTA');
    // Passe à l’étape suivante
    cy.contains('Suivant').click();
    cy.get('[aria-label="Progress"] li').eq(1).find('span').first().should('have.class', 'bg-accentCTA');
  });
});
