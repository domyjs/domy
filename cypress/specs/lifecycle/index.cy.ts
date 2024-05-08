import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Lifecycle test', () => {
  it('Check ready have the correct value', () => {
    cy.get('#ready').should('have.text', "'Hello World!'");
  });

  it('Check mounted have the correct value', () => {
    cy.get('#mounted').should('have.text', '');
  });
});
