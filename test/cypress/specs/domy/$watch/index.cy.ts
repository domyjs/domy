import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('$watch', () => {
  it('should not call the watcher when the component is hidden', () => {
    cy.get('#watcherCall').should('have.text', '0');
  });

  it('should call the watcher when the component is shown and count is updated and stop watching on unmount', () => {
    cy.get('#show').click();

    cy.get('#watcherCall').should('have.text', '1');

    cy.get('#inc').click();

    cy.get('#watcherCall').should('have.text', '2');

    cy.get('#inc').click();
    cy.get('#watcherCall').should('have.text', '3');

    // check when we unmount
    cy.get('#show').click();
    cy.get('#inc').click();
    cy.get('#watcherCall').should('have.text', '3');
  });
});
