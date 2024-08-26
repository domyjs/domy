import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('arrowFn', () => {
  it('Check the app is working', () => {
    cy.wait(1000);

    cy.get('h1').should('have.text', 'Count: 2');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 1');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', 'Count: 1');
  });
});
