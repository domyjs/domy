import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$el test', () => {
  it('should have the correct text content and name', () => {
    cy.get('h1').contains('hello');
    cy.get('h1').should('have.attr', 'name', 'hello');
  });
});
