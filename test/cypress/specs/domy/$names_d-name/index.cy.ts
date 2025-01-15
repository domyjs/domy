import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$names and d-name tests', () => {
  it('checks only Hello World is rendered', () => {
    cy.get('#hello').should('exist');
    cy.get('#hello').should('have.text', 'Hello World!');
    cy.get('#bye').should('not.exist');
  });
});
