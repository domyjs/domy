import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('CSP test', () => {
  it('Check we can access deep object property and array', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });

  it('Check CSP working with methods and computed value', () => {
    cy.get('#count').should('have.text', 'Count: 0');
    cy.get('#odd').should('have.text', 'Is odd: false');

    cy.get('#dec').click();
    cy.get('#count').should('have.text', 'Count: 0');
    cy.get('#odd').should('have.text', 'Is odd: false');

    cy.get('#inc').click();
    cy.get('#count').should('have.text', 'Count: 1');
    cy.get('#odd').should('have.text', 'Is odd: true');

    cy.get('#dec').click();
    cy.get('#count').should('have.text', 'Count: 0');
    cy.get('#odd').should('have.text', 'Is odd: false');
  });

  it('Check d-model implementation with CSP', () => {
    cy.get('#search').should('have.text', 'Search: ');

    cy.get('input').type('Hello World!');

    cy.get('#search').should('have.text', 'Search: Hello World!');
  });
});
