import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-mount test', () => {
  it('Check attribute is removed', () => {
    cy.get('div').should('not.have.attr', 'd-mount');
  });

  it('Check mount function change the element content', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });
});
