import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-data test', () => {
  it('Check attribute is removed', () => {
    cy.get('h1').should('not.have.attr', 'd-text');
  });

  it('Check the value of the state is inserted into the page', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });

  it('Check the value of the state is changed after the value is changed', () => {
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Bye World!');
  });
});
