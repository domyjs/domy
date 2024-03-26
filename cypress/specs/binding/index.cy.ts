import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('binding test', () => {
  it('Check the attributes are removed', () => {
    cy.get('h1').should('not.have.attr', ':style');
    cy.get('h1').should('not.have.attr', ':id');
  });

  it('Check the value is correct', () => {
    cy.get('h1').should('have.attr', 'id', '0');
    cy.get('h1').should('have.css', 'backgroundColor', 'rgb(255, 0, 0)');
  });

  it('Check the value are updated', () => {
    cy.get('button').click();
    cy.get('h1').should('have.attr', 'id', '1');
    cy.get('h1').should('have.css', 'backgroundColor', 'rgb(0, 128, 0)');
  });
});
