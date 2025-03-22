import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-for performance test', () => {
  it('Check we can generate a big list of elements in a correct timeout', () => {
    cy.get('li:first-child').contains('0', { timeout: 500 });
    cy.get('li:last-child').contains('9999');
  });
});
