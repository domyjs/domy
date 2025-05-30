import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-ref test', () => {
  it('Check attribute is removed', () => {
    cy.get('input').should('not.have.attr', 'd-ref');
  });

  it('Check the ref is accessible', () => {
    cy.get('button').click();
    cy.get('p').should('have.text', 'Hello World!');
  });
});
