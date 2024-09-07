import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Render function test', () => {
  it('should display the initial count', () => {
    cy.get('#container p').should('have.text', 'Count: 0');
  });

  it('should increment the count when "+" button is clicked', () => {
    cy.get('#inc').click();
    cy.get('#container p').should('have.text', 'Count: 1');
  });

  it('should decrement the count when "-" button is clicked', () => {
    cy.get('#inc').click();
    cy.get('#inc').click();

    cy.get('#container p').should('have.text', 'Count: 2');

    cy.get('#dec').click();
    cy.get('#container p').should('have.text', 'Count: 1');
  });
});
