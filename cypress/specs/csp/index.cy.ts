import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('CSP test', () => {
  it('Check CSP working with methods', () => {
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', 'Count: 1');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');
  });

  it('Check d-model implementation with CSP', () => {
    cy.get('p').should('have.text', 'Search: ');

    cy.get('input').type('Hello World!');

    cy.get('p').should('have.text', 'Search: Hello World!');
  });
});
