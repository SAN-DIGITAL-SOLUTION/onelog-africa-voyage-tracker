/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email: string, _password: string) => {
  // Lecture des users de test depuis les fixtures
  cy.fixture('testUsers').then((users: any) => {
    const userEntry = Object.values(users).find((u: any) => u.email === email);
    if (!userEntry) {
      throw new Error(`Aucun utilisateur de test trouvé pour l'email ${email}`);
    }

    // Derive projectRef à partir de l'URL Supabase pour respecter le préfixe clé localStorage
    const supabaseUrl: string = Cypress.env('SUPABASE_URL');
    const match = supabaseUrl?.match(/https?:\/\/([a-zA-Z0-9-]+)\.supabase\.co/);
    const projectRef = match ? match[1] : 'local';
    const storageKey = `sb-${projectRef}-auth-token`;

    // Stockage de la session minimaliste attendue par supabase-js
    const session = {
      access_token: userEntry.token,
      refresh_token: `refresh-${userEntry.token}`,
      user: {
        id: userEntry.id,
        email: userEntry.email,
        role: userEntry.role,
        app_metadata: { role: userEntry.role },
        user_metadata: { role_status: userEntry.role_status },
      },
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'Bearer',
    };

    window.localStorage.setItem(storageKey, JSON.stringify(session));
  });
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }