import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Throttle test', () => {
  it('Check we throttle the function every 500ms', () => {
    // Ensure the initial value is 0
    cy.get('h1').should('have.text', '0');

    // Click once and ensure the count increments to 1
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1');

    // Rapid clicks within the throttle period should not increment
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '1'); // Still 1 because throttle allows only one execution in 500ms

    // Wait 500ms for the throttle to allow another increment
    cy.wait(500);

    // After waiting, the count should increment by 1
    cy.get('#inc').click();
    cy.get('h1').should('have.text', '2');

    // Click again and ensure the count increments after the throttle period
    cy.get('#inc').click();
    cy.wait(500);
    cy.get('h1').should('have.text', '2');
  });
});
