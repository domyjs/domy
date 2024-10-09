import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$scopedData tests', () => {
  it('should display "Hello World!"', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });
});
