import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Script in head test to ensure DOMY is waiting for the DOM to be fully loaded', () => {
  it('Check the value of the state is inserted into the page', () => {
    cy.get('h1').should('have.text', 'Hello World!');
  });

  it('Check the value of the state is changed after the value is changed', () => {
    cy.get('button').click();
    cy.get('h1').should('have.text', 'Bye World!');
  });
});
