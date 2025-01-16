import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('d-teleport test', () => {
  it('Should teleport the element to the specified target and render it', () => {
    cy.get('body').find('h1').should('have.length', 1);
    cy.get('div').get('template').should('not.exist');
    cy.get('h1').contains('Hello World!');
  });

  it('Test the defer modifier', () => {
    cy.get('template').should('not.exist');
    cy.get('#defered').get('p').should('have.length', 1);
    cy.get('div').get('template').should('not.exist');
    cy.get('p').contains('Hello World!');
  });
});
