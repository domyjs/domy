import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Multiple config', () => {
  it('Check we can do basic actions with "this"', () => {
    cy.get('#count').should('have.text', 'Count: 0');

    cy.get('#dec').click();
    cy.get('#count').should('have.text', 'Count: 0');

    cy.get('#inc').click();
    cy.get('#count').should('have.text', 'Count: 1');

    cy.get('#dec').click();
    cy.get('#count').should('have.text', 'Count: 0');
  });

  it('Check d-model implementation with CSP', () => {
    cy.get('#search').should('have.text', 'Search: ');

    cy.get('input').type('Hello World!');

    cy.get('#search').should('have.text', 'Search: Hello World!');
  });
});
