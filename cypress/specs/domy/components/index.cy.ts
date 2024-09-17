import path from 'path';

beforeEach(() => {
  cy.visit(path.join(__dirname, 'index.html'));
});

describe('Components tests', () => {
  it('should increment the count when the "+" button is clicked', () => {
    cy.get('p').contains('Count: 0');
    cy.get('button').contains('+').click();
    cy.get('p').contains('Count: 1');
  });

  it('should decrement the count when the "-" button is clicked', () => {
    cy.get('button').contains('+').click();
    cy.get('p').contains('Count: 1');

    cy.get('button').contains('-').click();
    cy.get('p').contains('Count: 0');
  });

  it('should show an error message when count is less than 0', () => {
    cy.get('button').contains('-').click();
    cy.get('p').contains('Count: -1');
    cy.get('p').contains('Error Message:');
    cy.get('p').contains('The count as to be greater than 0!');
  });

  it('should close the error message when the "X" button is clicked', () => {
    cy.get('button').contains('-').click();
    cy.get('p').contains('Error Message:');

    cy.get('button').contains('X').click();
    cy.get('p').should('not.contain', 'Error Message:');
  });

  it('should hide the error message when count is incremented back to 0 or more', () => {
    cy.get('button').contains('-').click();
    cy.get('p').contains('Error Message:');

    cy.get('button').contains('+').click();
    cy.get('p').contains('Count: 0');
    cy.get('p').should('not.contain', 'Error Message:');
  });
});
