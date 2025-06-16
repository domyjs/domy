import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('watch test', () => {
  it('Check watcher is called', () => {
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', 'Count: 1');

    cy.get('#dec').click();
    cy.get('h1').should('have.text', 'Count: 0');
  });

  it('Check the watcher cant call it self more than 100 times', () => {
    cy.get('h2').should('have.text', 'Count by 2: 0');

    cy.get('#dec2').click();
    cy.get('h2').should('have.text', 'Count by 2: -101');
  });

  it('Check path and params work', () => {
    cy.get('#path').should('have.text', '');
    cy.get('#index').should('have.text', '');

    cy.get('#todo1').click();

    cy.get('#path').should('have.text', 'value.1.isComplete');
    cy.get('#index').should('have.text', '1');
  });
});
