import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Attributes d-if, d-else-if, d-else test', () => {
  it('Check only d-else if display', () => {
    cy.get('#if').should('not.exist');
    cy.get('#else-if').should('not.exist');
    cy.get('#else').should('exist');
  });

  it('Check elements are display/removed after a click', () => {
    cy.get('#inc').click();
    cy.get('#if').should('exist');
    cy.get('#else-if').should('not.exist');
    cy.get('#else').should('not.exist');

    cy.get('#dec').click();
    cy.get('#if').should('not.exist');
    cy.get('#else-if').should('not.exist');
    cy.get('#else').should('exist');

    cy.get('#dec').click();
    cy.get('#if').should('not.exist');
    cy.get('#else-if').should('exist');
    cy.get('#else').should('not.exist');
  });
});
