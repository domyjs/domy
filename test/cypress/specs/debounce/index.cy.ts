import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Debounce test', () => {
  it('Check we debounce the function every 500ms', () => {
    // Ensure the initial value is 0
    cy.get('h1').should('have.text', '0');

    // Click once and ensure the count increments to 1
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1');

    // Rapid clicks within the debounce period should not increment immediately
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1'); // Still 1 because debounce delays the execution

    // Wait 500ms for the debounce to execute
    cy.wait(500);

    // After waiting, the count should increment by 1
    cy.get('h1').should('have.text', '2');

    // Click again and ensure the count increments after the debounce period
    cy.get('#inc').click();
    cy.wait(500);
    cy.get('h1').should('have.text', '3');
  });
});
