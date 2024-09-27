import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attribute d-unmounted test', () => {
  it('Check attribute is removed', () => {
    cy.get('div').should('not.have.attr', 'd-unmounted');
  });

  it('Check unmount function is called', () => {
    cy.get('h1').should('have.text', '');

    cy.get('button').click();
    cy.get('h1').should('have.text', 'Hello World!');

    cy.get('button').click();
    cy.get('h1').should('have.text', '');

    cy.get('button').click();
    cy.get('h1').should('have.text', 'Hello World!');
  });
});
