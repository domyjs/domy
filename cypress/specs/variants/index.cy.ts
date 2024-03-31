import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('variants test', () => {
  it('Check the value change one time', () => {
    cy.get('h1').should('have.text', 'Count: 0');
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Count: 1');
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Count: 1');
  });
});
