import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Computed test', () => {
  it('Check the moethod is called again when a dep change', () => {
    cy.get('h1').should('have.text', 'Count: 0');
    cy.get('p').should('have.text', 'Is odd: false');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');
    cy.get('p').should('have.text', 'Is odd: false');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', 'Count: 1');
    cy.get('p').should('have.text', 'Is odd: true');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');
    cy.get('p').should('have.text', 'Is odd: false');
  });
});
