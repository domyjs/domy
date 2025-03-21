import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('d-insert test', () => {
  it('Check we have just the button at first', () => {
    cy.get('p').should('not.exist');
    cy.get('#inc').should('not.exist');
    cy.get('#dec').should('not.exist');
  });

  it('Check we dont render the element but its only inserted', () => {
    cy.get('#renderCount').click();
    cy.get('#norender').should('have.text', 'Count: {{ count }}');
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
    cy.get('#render').should('have.text', 'Count: 0');
  });

  it('should increment/decrement the count when "-" button is clicked', () => {
    cy.get('#renderCount').click();

    cy.get('#inc').click();
    cy.get('#render').should('have.text', 'Count: 1');

    cy.get('#inc').click();
    cy.get('#render').should('have.text', 'Count: 2');

    cy.get('#dec').click();
    cy.get('#render').should('have.text', 'Count: 1');
  });
});
