import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('methods test', () => {
  it('Check watcher is called', () => {
    cy.get('h1').should('have.text', '0');

    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1');

    // We wait we can call again the throttle
    cy.wait(500);

    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '2');
  });
});
