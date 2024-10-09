import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('d-render test', () => {
  it('Check we have just the button at first', () => {
    cy.get('p').should('not.exist');
    cy.get('#inc').should('not.exist');
    cy.get('#dec').should('not.exist');
  });

  it('Check we can add the count and make it disapear again', () => {
    cy.get('p').should('not.exist');
    cy.get('#inc').should('not.exist');
    cy.get('#dec').should('not.exist');

    cy.get('#renderCount').click();

    cy.get('p').should('exist');
    cy.get('#inc').should('exist');
    cy.get('#dec').should('exist');

    cy.get('#renderCount').click();

    cy.get('p').should('not.exist');
    cy.get('#inc').should('not.exist');
    cy.get('#dec').should('not.exist');
  });

  it('should display the initial count', () => {
    cy.get('#renderCount').click();
    cy.get('p').should('have.text', 'Count: 0');
  });

  it('should increment the count when "+" button is clicked', () => {
    cy.get('#renderCount').click();
    cy.get('#inc').click();
    cy.get('p').should('have.text', 'Count: 1');
  });

  it('should decrement the count when "-" button is clicked', () => {
    cy.get('#renderCount').click();
    cy.get('#inc').click();
    cy.get('#inc').click();

    cy.get('p').should('have.text', 'Count: 2');

    cy.get('#dec').click();
    cy.get('p').should('have.text', 'Count: 1');
  });
});
