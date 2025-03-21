import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-setup test', () => {
  it('Check attribute is removed', () => {
    cy.get('p').should('not.have.attr', 'd-setup');
  });

  it('Check init function change the element content', () => {
    cy.get('p').should('have.text', 'Hello World!');
  });
});
