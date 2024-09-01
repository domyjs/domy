import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$dispatch tests', () => {
  it('should display "Hello World!" when the notify button is clicked', () => {
    cy.get('#message').should('have.text', '');

    cy.get('#notify-button').click();

    cy.get('#message').should('have.text', 'Hello World!');
  });
});
