import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$config tests', () => {
  it('should get the configuration for CSP', () => {
    cy.get('h1').should('have.text', 'true');
  });
});
