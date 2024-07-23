import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Lifecycle test', () => {
  it('Check initialisation have the correct value', () => {
    cy.get('#initialisation').should('have.text', "'Hello World!'");
  });

  it('Check setuped have the correct value', () => {
    cy.get('#setuped').should('have.text', "'Bye World!'");
  });

  it('Check mounted have the correct value', () => {
    cy.get('#mounted').should('have.text', '');
  });
});
