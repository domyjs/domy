import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('watchEffect test', () => {
  it('Check effect is called', () => {
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', 'Count: 1');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');
  });

  it('Check the effect cant call it self more than 100 times', () => {
    cy.get('h2').should('have.text', 'Count by 2: 100');
  });
});
