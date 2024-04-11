import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$fn test', () => {
  it('Check watcher is called', () => {
    cy.get('h1').should('have.text', '0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', '0');

    cy.get('#sinc').click();
    cy.get('h1').should('have.text', '10');

    cy.get('#sdec').click();
    cy.get('h1').should('have.text', '0');
  });
});
