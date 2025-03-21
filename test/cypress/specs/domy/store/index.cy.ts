import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Store test', () => {
  it('Check the count start at 0', () => {
    cy.get('h1').should('contain', '0');
    cy.get('p').should('contain', '0');
  });

  it('Should increment', () => {
    cy.get('#increment').click();
    cy.get('h1').should('contain', '1');
    cy.get('p').should('contain', '1');
  });

  it('Should decrement', () => {
    cy.get('#increment').click();
    cy.get('#increment').click();
    cy.get('#decrement').click();
    cy.get('h1').should('contain', '1');
    cy.get('p').should('contain', '1');
  });
});
