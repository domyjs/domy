import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Avoid deprecated with', () => {
  it('Check we can do basic actions with "this"', () => {
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

  it('Check d-model implementation', () => {
    cy.get('#search').should('have.text', 'Search: ');

    cy.get('input').type('Hello World!');

    cy.get('#search').should('have.text', 'Search: Hello World!');
  });
});
