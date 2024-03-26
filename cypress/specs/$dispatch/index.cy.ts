import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$dispatch test', () => {
  it('Check the custom event is dispatched', () => {
    cy.get('h1').should('have.text', '');
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Hello World!');
  });
});
